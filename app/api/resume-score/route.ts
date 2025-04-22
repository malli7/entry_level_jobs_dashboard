import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { job_description, user_id, job_id } = await req.json();

  try {
    const jobMatchingCollection = collection(db, "job_matching");
    const documentId = `${user_id}_${job_id}`;
    const jobDocRef = doc(jobMatchingCollection, documentId);
    const jobDoc = await getDoc(jobDocRef);

    if (jobDoc.exists()) {
      const existingData = jobDoc.data();
      return NextResponse.json({
        match_score: existingData.match_score,
        feedback: existingData.feedback,
      });
    }

    // Proceed with the current logic if the document does not exist
    const userDocRef = doc(db, "users", user_id);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const resume_text = userDoc.data().resumeText;

    // Use resume_text as needed
    // For example, you might want to include it in the request to the external API

    const response = await fetch(
      "https://job-scraper.up.railway.app/evaluate-resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description,
          resume_text,
        }),
      }
    );

    const x:string = await response.json();
    console.log(x);
    let data = null;
    if (x.startsWith("{")) {
      data = await JSON.parse(x);
    }else{
      data = await JSON.parse(x.slice(7, -3));
    }

    if (data.score === undefined || data.review === undefined) {
      return NextResponse.json(
        { message: "Invalid response from external API" },
        { status: 500 }
      );
    }

    // Store in Firestore with the constructed ID
    await setDoc(jobDocRef, {
      user_id,
      job_id,
      match_score: data.score,
      feedback: data.review,
    });

    return NextResponse.json({
      match_score: data.score,
      feedback: data.review,
    });
  } catch (error) {
    console.error("Error evaluating resume:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
