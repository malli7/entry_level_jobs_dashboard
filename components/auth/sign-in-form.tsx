"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FirebaseError } from "firebase/app"; // Import FirebaseError for better error typing

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetPasswordInput, setShowResetPasswordInput] = useState(false);
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await signInWithEmail(data.email, data.password);

      if (!user.emailVerified) {
        router.push("/verify-email");
        return;
      }
      if (user.hasResume) {
        router.push("/dashboard");
      } else {
        router.push("/resume");
      }
    } catch (err: unknown) {
      console.error("Sign in error:", err);

      if (err instanceof FirebaseError) {
        // Handle Firebase-specific errors
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          setError("Invalid email or password");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many failed login attempts. Please try again later.");
        } else {
          setError("Failed to sign in. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await signInWithGoogle();

      if (user.hasResume) {
        router.push("/dashboard");
      } else {
        router.push("/resume");
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsResettingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      await resetPassword(resetEmail);
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (err: unknown) {
      console.error("Reset password error:", err);

      if (err instanceof FirebaseError) {
        if (err.message === "No account found with this email address.") {
          setError(err.message);
        } else {
          setError("Failed to send password reset email. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-500/10 border-red-500/50 text-red-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert
          variant="default"
          className="bg-green-500/10 border-green-500/50 text-green-200"
        >
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-slate-400 hover:text-white"
              onClick={() => {
                setShowResetPasswordInput(true);
                setError(null);
                setSuccess(null);
              }}
              type="button"
            >
              Forgot password?
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            className="bg-slate-800/50 border-slate-700 text-white"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-900 px-2 text-slate-400">
            or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-slate-700  hover:bg-slate-800 hover:text-white"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </Button>

      {showResetPasswordInput && (
        <div className="space-y-4">
          <Label htmlFor="resetEmail" className="text-white">
            Enter your email to reset password
          </Label>
          <Input
            id="resetEmail"
            type="email"
            placeholder="you@example.com"
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <Button
            onClick={handleForgotPassword}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            disabled={isResettingPassword || !resetEmail}
          >
            {isResettingPassword ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Reset Password
          </Button>
        </div>
      )}
    </div>
  );
}
