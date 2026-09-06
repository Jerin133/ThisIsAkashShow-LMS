import { supabase } from "../lib/supabase";
import api from "./api";

export const registerUser = async (param1, password, fullName) => {
  let emailValue = param1;
  let passwordValue = password;
  let nameValue = fullName;

  if (typeof param1 === "object" && param1 !== null) {
    emailValue = param1.email;
    passwordValue = param1.password;
    nameValue = param1.fullName;
  }

  // 1. Primary: Use backend admin registration with pre-confirmed email
  // This bypasses the Supabase free-tier shared SMTP "email rate limit exceeded" (429) error
  try {
    const res = await api.post("/auth/register", {
      email: emailValue,
      password: passwordValue,
      fullName: nameValue,
    });

    if (res.data?.success) {
      // Auto sign in user immediately so session is active
      try {
        await supabase.auth.signInWithPassword({
          email: emailValue,
          password: passwordValue,
        });
      } catch (loginErr) {
        console.warn("Auto-login after register failed:", loginErr);
      }

      return res.data.data;
    }
  } catch (apiErr) {
    // If backend returned a clear validation message (e.g. email already registered), show it
    if (apiErr.response?.data?.message) {
      throw new Error(apiErr.response.data.message);
    }
    console.warn("Backend auth register failed, falling back to direct Supabase signup:", apiErr);
  }

  // 2. Fallback to Supabase client signup if backend was unreachable
  const { data, error } = await supabase.auth.signUp({
    email: emailValue,
    password: passwordValue,
    options: {
      data: {
        full_name: nameValue,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export const loginUser = async (email, password) => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }

  return data;
};