"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { uploadResume } from "@/lib/firebase/resume";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import NavigationBar from "./NavigationBar";
import pdfToText from "react-pdftotext";

export default function ProfileComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [resumeURL, setResumeURL] = useState<string>('');
  const [prevFileName,setPrevFileName] = useState<string>('');


  useEffect(() => {
    const fetchResumeURL = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPrevFileName(userData?.resumeFileName)
          setResumeURL(userData?.resumeURL || '');
        }
      }
    };
    fetchResumeURL();
  }, [user]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Please upload a PDF or DOCX file")
        setFile(null)
      }
    }
  }

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
      // Delete the existing resume file before uploading a new one
      const storageRef = ref(storage, `resumes/${user.uid}/${prevFileName}`);
      await deleteObject(storageRef);

      const resumeText = await extractTextFromPDF(file);
      await uploadResume(file, user.uid,resumeText);
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
  }

 

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      <NavigationBar />
        <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-3xl font-extrabold tracking-wide">User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white mb-4">
              <h2 className="text-2xl font-bold">{user?.displayName || user?.email}</h2>
              <p className="text-slate-400">Email: {user?.email}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Resume</h3>
              {user?.hasResume && resumeURL ? (
                <iframe
                  src={resumeURL}
                  className="w-full h-[550px] border-0 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl"
                  title="Resume"
                ></iframe>
              ) : (
                <p className="text-slate-400">No resume uploaded.</p>
              )}
            </div>
           
          </CardContent>
        </Card>
        <div className="flex items-center justify-center p-4">

      
        <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Replace Your Resume</CardTitle>
          <CardDescription>
            {"We'll analyze your resume to match you with the perfect entry-level positions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-medium text-white">Resume Uploaded Successfully!</h3>
              <p className="text-slate-400 mt-2">Redirecting you to your dashboard...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  file ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"
                }`}
                onClick={() => document.getElementById("resume-upload")?.click()}
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
                    <p className="text-slate-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-slate-500 mb-2" />
                    <p className="text-white font-medium">Drag & drop your resume or click to browse</p>
                    <p className="text-slate-400 text-sm mt-1">Supports PDF, DOCX (Max 5MB)</p>
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
      </div>
    </div>
  );
} 