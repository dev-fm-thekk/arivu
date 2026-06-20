"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { SignInAction, SingOutAction } from "@/src/services/auth/actions";

type AuthContextType = {
  user: User | null;
  isContributor: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isContributor, setIsContributor] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkContributor = async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();
      
      setIsContributor(!!data && !error);
    };

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await checkContributor(user.id);
      } else {
        setIsContributor(false);
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          await checkContributor(newUser.id);
        } else {
          setIsContributor(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    await SignInAction();
  };

  const signOut = async () => {
    await SingOutAction();
  };

  return (
    <AuthContext.Provider value={{ user, isContributor, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
