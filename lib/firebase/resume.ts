import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";
import pdfToText from "react-pdftotext";

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

export const uploadResume = async (
  file: File,
  userId: string
): Promise<string> => {
  try {
    const resumeText = await extractTextFromPDF(file);
    const storageRef = ref(storage, `resumes/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      resumeFileName: file.name,
      resumeUploadedAt: new Date(),
      resumeText: resumeText,
      resumeURL: downloadURL,
      hasResume: true,
    });

    return resumeText;
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
};
