"use client"
import dynamic from "next/dynamic";

const ProfileClient = dynamic(() => import("../components/ProfileComponent"), {
  ssr: false,
});

export default function ProfilePage() {
  return <ProfileClient />;
}
