import React, { useState, useEffect } from "react";
import { Star, X, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { rateCourse, getMyCourseRating } from "../../services/api";

const STAR_LABELS = {
  1: "Poor - Needs a lot of improvement",
  2: "Fair - Has some helpful content",
  3: "Good - Average course",
  4: "Very Good - Highly informative",
  5: "Outstanding - Exceeded expectations!",
};

const CourseRatingModal = ({
  courseId,
  courseTitle,
  isOpen,
  onClose,
  onRatingSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (!isOpen || !courseId) return;

    const fetchUserRating = async () => {
      try {
        setFetchingExisting(true);
        setError("");
        setSuccess(false);
        const res = await getMyCourseRating(courseId);
        if (res.success && res.data) {
          setRating(res.data.rating || 5);
          setReview(res.data.review || "");
          setIsEdit(true);
        } else {
          setRating(5);
          setReview("");
          setIsEdit(false);
        }
      } catch (err) {
        // User not logged in or no rating yet
        setRating(5);
        setReview("");
        setIsEdit(false);
      } finally {
        setFetchingExisting(false);
      }
    };

    fetchUserRating();
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a star rating from 1 to 5.");
      return;
    }

    try {
      setLoading(true);
      const res = await rateCourse(courseId, { rating, review });
      if (res.success) {
        setSuccess(true);
        if (onRatingSubmitted) {
          onRatingSubmitted(res.data);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(res.message || "Failed to submit rating.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  const activeStars = hoveredRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200 mb-3 shadow-2xs">
            <Star size={24} className="fill-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? "Update Your Course Rating" : "Rate This Course"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 line-clamp-1 max-w-sm mx-auto">
            {courseTitle || "Digital Marketing Masterclass"}
          </p>
        </div>

        {fetchingExisting ? (
          <div className="py-12 text-center text-sm text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto mb-2" />
            Loading your review...
          </div>
        ) : success ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
            <p className="font-bold text-emerald-950 text-base">Thank you for your rating!</p>
            <p className="text-xs text-emerald-700">
              Your review helps other students discover quality courses and supports the academy instructor.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interactive Stars */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeStars;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 text-slate-300 hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-hidden"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        size={36}
                        className={
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  );
                })}
              </div>

              {/* Label for selected star count */}
              <p className="mt-2 text-xs font-bold text-amber-600">
                {STAR_LABELS[activeStars] || "Select your rating"}
              </p>
            </div>

            {/* Review Comment Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-emerald-600" />
                Review & Feedback (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you like about this course? How did it help your skills?"
                rows="4"
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : isEdit ? (
                  "Update Rating"
                ) : (
                  "Submit Rating"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CourseRatingModal;
