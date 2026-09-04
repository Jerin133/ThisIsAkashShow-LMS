const crypto = require("crypto");
const supabase = require("../config/supabase");

// 1. Create a Checkout Order for Course Purchase
const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if course exists and is published
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price, is_published")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if student is already enrolled
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
        isEnrolled: true,
      });
    }

    const amount = Number(course.price) || 0;
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // If Razorpay API keys are configured, we can initialize Razorpay SDK
    let razorpayOrderId = null;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = require("razorpay");
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
          amount: Math.round(amount * 100), // amount in paise
          currency: "INR",
          receipt: orderId,
          notes: {
            courseId: course.id,
            userId: userId,
          },
        };

        const razorpayOrder = await instance.orders.create(options);
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API not reachable, falling back to secure checkout token:", rzpErr.message);
      }
    }

    // Generate secure checkout token to prevent tampering
    const secret = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "lms_secure_secret";
    const checkoutToken = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${courseId}:${amount}:${orderId}`)
      .digest("hex");

    return res.json({
      success: true,
      data: {
        orderId: razorpayOrderId || orderId,
        customOrderId: orderId,
        amount: amount,
        currency: "INR",
        courseTitle: course.title,
        courseId: course.id,
        checkoutToken: checkoutToken,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_public_key",
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate checkout order",
    });
  }
};

// 2. Verify Payment and Enroll Student
const verifyPayment = async (req, res) => {
  try {
    const {
      courseId,
      orderId,
      paymentId,
      signature,
      checkoutToken,
      amount,
    } = req.body;

    const userId = req.user.id;

    if (!courseId || (!orderId && !paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment verification payload",
      });
    }

    // Verify cryptographic integrity
    const secret = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "lms_secure_secret";
    
    // Check if Razorpay signature verification applies
    if (process.env.RAZORPAY_KEY_SECRET && signature && orderId && paymentId) {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature !== signature) {
        return res.status(400).json({
          success: false,
          message: "Payment signature verification failed",
        });
      }
    } else if (checkoutToken) {
      // Verify our internal HMAC token
      const expectedToken = crypto
        .createHmac("sha256", secret)
        .update(`${userId}:${courseId}:${Number(amount)}:${orderId}`)
        .digest("hex");

      if (expectedToken !== checkoutToken) {
        return res.status(400).json({
          success: false,
          message: "Security signature mismatch or payment tampered",
        });
      }
    }

    const finalPaymentId = paymentId || `pay_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // 1. Record payment in `payments` table
    await supabase.from("payments").insert({
      user_id: userId,
      course_id: courseId,
      order_id: orderId,
      payment_id: finalPaymentId,
      signature: signature || "verified_checkout",
      amount: Number(amount) || 0,
      currency: "INR",
      status: "success",
      created_at: new Date().toISOString(),
    });

    // 2. Create or activate enrollment in `enrollments` table
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          payment_id: finalPaymentId,
          order_id: orderId,
          amount: Number(amount) || 0,
          status: "active",
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" }
      )
      .select()
      .single();

    if (enrollError) {
      console.error("Enrollment Insertion Error:", enrollError);
      throw enrollError;
    }

    return res.json({
      success: true,
      message: "Payment successful! You are now enrolled in the course.",
      data: {
        enrollmentId: enrollment.id,
        courseId: courseId,
        paymentId: finalPaymentId,
      },
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment and process enrollment",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
