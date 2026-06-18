import { createClient } from "@/utils/supabase/client";

export const SignInAction = async () => {
  const client = createClient();
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/",
      },
    });

    if (error) throw new Error(`AuthError: ${error}`);
    return { data };
  } catch (err) {
    console.error(err);
    return { err };
  }
};


export const SingOutAction = async () => {
  const client = createClient();

  try {
    const { error } = await client.auth.signOut();

    if (error) throw new Error(`AuthError: ${error}`);
    return { message: "signed out"};
  } catch(err) {
    console.error(err);
    return { err };
  }
}


/** Server-side: authenticated user, or null. */
export async function getAuthenticatedUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error };
  }

  return { user };
}