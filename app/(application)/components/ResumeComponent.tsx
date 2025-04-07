"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { uploadResume } from "@/lib/firebase/resume";
import pdfToText from "react-pdftotext";

export default function ResumeComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (!user.emailVerified) {
      router.push("/verify-email");
      return;
    }
    if (user.hasResume) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || !user.emailVerified || user.hasResume) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a PDF or DOCX file");
        setFile(null);
      }
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      const textContent = await pdfToText(blob);
      return textContent;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      const resumeText = await extractTextFromPDF(file);
      await uploadResume(file, user.uid, resumeText);
      await updateUserProfile({ hasResume: true, resumeText });
      setUploadSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error uploading resume:", err);
      setError("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Upload Your Resume</CardTitle>
          <CardDescription>
            {
              "We'll analyze your resume to match you with the perfect entry-level positions"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-medium text-white">
                Resume Uploaded Successfully!
              </h3>
              <p className="text-slate-400 mt-2">
                Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  file
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
                onClick={() =>
                  document.getElementById("resume-upload")?.click()
                }
              >
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-10 w-10 text-emerald-500 mb-2" />
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-slate-500 mb-2" />
                    <p className="text-white font-medium">
                      Drag & drop your resume or click to browse
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Supports PDF, DOCX (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            disabled={!file || uploading || uploadSuccess}
            onClick={handleUpload}
          >
            {uploading ? "Uploading..." : "Upload Resume"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
