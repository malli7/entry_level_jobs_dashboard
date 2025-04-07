import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NavigationBar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-slate-800 text-white shadow-lg">
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className={`hover:text-blue-500 transition-colors duration-300 ${
            isActive("/") ? "text-blue-500" : ""
          }`}
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className={`hover:text-blue-500 transition-colors duration-300 ${
            isActive("/dashboard") ? "text-blue-500" : ""
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/profile"
          className={`hover:text-blue-500 transition-colors duration-300 ${
            isActive("/profile") ? "text-blue-500" : ""
          }`}
        >
          Profile
        </Link>
        <Link
          href="/analytics"
          className={`hover:text-blue-500 transition-colors duration-300 ${
            isActive("/analytics") ? "text-blue-500" : ""
          }`}
        >
          Analytics
        </Link>
      </div>
      <Button
        variant="outline"
        className="border-slate-700 text-slate-300 hover:bg-slate-800"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </nav>
  );
};

export default NavigationBar;
