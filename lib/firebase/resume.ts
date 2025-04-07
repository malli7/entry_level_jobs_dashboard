import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";


export const uploadResume = async (
  file: File,
  userId: string,
  resumeText:string
): Promise<string> => {
  try {
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
