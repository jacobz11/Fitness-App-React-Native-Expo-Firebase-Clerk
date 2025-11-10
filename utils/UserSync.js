import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";

// Helper function to format date as DD/MM/YYYY | HH:MM
const formatDate = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year} | ${hours}:${minutes}`;
};

export const syncUserToFirebase = async (user) => {
  if (!user) return;

  const userRef = doc(db, "Users", user.id);
  const currentLoginTime = formatDate(new Date());

  try {
    // Check if user already exists
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // User doesn't exist, create new document
      await setDoc(userRef, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName,
        imgUrl: user.imageUrl,
        createdAt: currentLoginTime,
      });
    } else {
      // User exists, update last login time
      await setDoc(
        userRef,
        {
          createdAt: currentLoginTime,
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error syncing user to Firebase:", error);
  }
};
