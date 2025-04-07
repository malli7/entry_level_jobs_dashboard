"use client"
import dynamic from "next/dynamic";

const ResumeClient = dynamic(() => import("../components/ResumeComponent"), {
  ssr: false,
});

export default function ProfilePage() {
  return <ResumeClient />;
}
