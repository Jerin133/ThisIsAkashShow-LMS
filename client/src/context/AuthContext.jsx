import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId, userObj = null) => {
    try {
      // Use maybeSingle to safely handle 0 or 1 rows without throwing 406 PGRST116 error
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
        return data;
      }

      // Self-heal: If profile row doesn't exist yet, create a default profile record
      const currentUser = userObj || user;
      if (currentUser) {
        const defaultProfile = {
          id: userId,
          email: currentUser.email || "",
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split("@")[0] ||
            "Student",
          role: currentUser.user_metadata?.role || "student",
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .upsert(defaultProfile)
          .select()
          .maybeSingle();

        const resolved = createdProfile || defaultProfile;
        setProfile(resolved);
        return resolved;
      }
    } catch (err) {
      console.warn("loadProfile unexpected exception:", err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id, session.user);
        }
      } catch (err) {
        console.warn("initializeAuth error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};