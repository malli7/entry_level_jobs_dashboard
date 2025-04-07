import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

const JOBS_PER_PAGE = 20

export const getJobsForPage = async (page: number) => {
  try {
    const jobsRef = collection(db, "jobs")
    let q = query(jobsRef, orderBy("date_posted", "desc"), limit(JOBS_PER_PAGE))

    if (page > 1) {
      const lastDoc = await getDocs(query(jobsRef, orderBy("date_posted", "desc"), limit((page - 1) * JOBS_PER_PAGE)))
      const lastVisible = lastDoc.docs[lastDoc.docs.length - 1]
      q = query(jobsRef, orderBy("date_posted", "desc"), startAfter(lastVisible), limit(JOBS_PER_PAGE))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return []
  }
}