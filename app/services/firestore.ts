import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Presentation } from "@/app/types/presentation";

export interface FirestorePresentation
  extends Omit<Presentation, "id" | "createdAt" | "updatedAt"> {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PresentationWithId extends FirestorePresentation {
  id: string;
}

const PRESENTATIONS_COLLECTION = "presentations";

/**
 * Save a presentation to Firestore
 */
export async function savePresentation(
  userId: string,
  presentation: Presentation
): Promise<string> {
  try {
    console.log("Saving presentation for user:", userId);
    console.log("Presentation ID:", presentation.id);

    const presentationData: Omit<
      FirestorePresentation,
      "createdAt" | "updatedAt"
    > = {
      title: presentation.title,
      slides: presentation.slides,
      theme: presentation.theme,
      currentSlideIndex: presentation.currentSlideIndex,
      userId,
    };

    if (presentation.id && presentation.id !== "new") {
      // Update existing presentation
      console.log("Updating existing presentation:", presentation.id);
      const docRef = doc(db, PRESENTATIONS_COLLECTION, presentation.id);

      // First check if document exists and user has permission
      try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.log("Document does not exist, creating new one");
          // Document doesn't exist, create it instead
          const newDocRef = await addDoc(
            collection(db, PRESENTATIONS_COLLECTION),
            {
              ...presentationData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          );
          return newDocRef.id;
        }

        // Document exists, update it
        await updateDoc(docRef, {
          ...presentationData,
          updatedAt: serverTimestamp(),
        });
        return presentation.id;
      } catch (error) {
        console.error("Error updating document, trying to create new:", error);
        // If update fails, create a new document
        const newDocRef = await addDoc(
          collection(db, PRESENTATIONS_COLLECTION),
          {
            ...presentationData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
        return newDocRef.id;
      }
    } else {
      // Create new presentation
      const docRef = await addDoc(collection(db, PRESENTATIONS_COLLECTION), {
        ...presentationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving presentation:", error);
    throw new Error("Failed to save presentation");
  }
}

/**
 * Get all presentations for a user
 */
export async function getUserPresentations(
  userId: string
): Promise<PresentationWithId[]> {
  try {
    console.log("Getting presentations for user:", userId);

    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, PRESENTATIONS_COLLECTION),
      where("userId", "==", userId)
    );

    console.log("Executing query...");
    const querySnapshot = await getDocs(q);
    console.log("Query successful, found", querySnapshot.size, "documents");
    const presentations: PresentationWithId[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestorePresentation;
      presentations.push({
        id: doc.id,
        ...data,
      });
    });

    // Sort client-side by updatedAt descending
    presentations.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis() || 0;
      const bTime = b.updatedAt?.toMillis() || 0;
      return bTime - aTime;
    });

    return presentations;
  } catch (error) {
    console.error("Error getting user presentations:", error);
    throw new Error("Failed to load presentations");
  }
}

/**
 * Get a specific presentation by ID
 */
export async function getPresentation(
  presentationId: string,
  userId: string
): Promise<PresentationWithId | null> {
  try {
    const docRef = doc(db, PRESENTATIONS_COLLECTION, presentationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as FirestorePresentation;

      // Verify the presentation belongs to the user
      if (data.userId !== userId) {
        throw new Error("Unauthorized access to presentation");
      }

      return {
        id: docSnap.id,
        ...data,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting presentation:", error);
    throw new Error("Failed to load presentation");
  }
}

/**
 * Delete a presentation
 */
export async function deletePresentation(
  presentationId: string,
  userId: string
): Promise<void> {
  try {
    // First verify the presentation belongs to the user
    const presentation = await getPresentation(presentationId, userId);
    if (!presentation) {
      throw new Error("Presentation not found or unauthorized");
    }

    const docRef = doc(db, PRESENTATIONS_COLLECTION, presentationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting presentation:", error);
    throw new Error("Failed to delete presentation");
  }
}

/**
 * Convert Firestore presentation to app presentation format
 */
export function convertFirestoreToPresentation(
  firestorePresentation: PresentationWithId
): Presentation {
  return {
    id: firestorePresentation.id,
    title: firestorePresentation.title,
    slides: firestorePresentation.slides,
    theme: firestorePresentation.theme,
    currentSlideIndex: firestorePresentation.currentSlideIndex,
    createdAt: firestorePresentation.createdAt.toDate(),
    updatedAt: firestorePresentation.updatedAt.toDate(),
  };
}

/**
 * Auto-save functionality - directly saves without debouncing
 * Debouncing is handled by the calling component
 */
export async function autoSavePresentation(
  userId: string,
  presentation: Presentation
): Promise<string> {
  console.log('Auto-saving presentation:', presentation.id, 'for user:', userId);
  return await savePresentation(userId, presentation);
}
