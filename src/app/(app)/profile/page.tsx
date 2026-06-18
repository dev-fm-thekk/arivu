import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/src/services/auth/server-actions";
import { fetchUserProfileData } from "@/src/services/platform/actions";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/auth/login");

  const data = await fetchUserProfileData(profile.id);

  return <ProfileClient data={data} />;
}
