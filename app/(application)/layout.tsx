import type React from "react";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Job Match - Find Entry-Level Jobs That Match Your Skills",
  description:
    "Our AI analyzes your resume and matches you with the perfect entry-level positions from across the web",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}
