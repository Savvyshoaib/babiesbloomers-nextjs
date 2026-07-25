"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  setUser,
  setProfile,
  setInitialized,
} from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

/**
 * Initialises auth state in Redux on mount.
 * Listens to Supabase auth state changes for real-time sign-in/out.
 */
export function AuthInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        dispatch(setUser({ id: session.user.id, email: session.user.email! }));
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profile) dispatch(setProfile(profile));
      }
      dispatch(setInitialized(true));
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          dispatch(setUser({ id: session.user.id, email: session.user.email! }));
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (profile) dispatch(setProfile(profile));
        } else if (event === "SIGNED_OUT") {
          dispatch(setUser(null));
          dispatch(setProfile(null));
        }
        dispatch(setInitialized(true));
      },
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return null;
}
