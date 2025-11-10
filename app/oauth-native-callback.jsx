import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";

export default function OAuthCallback() {
  const router = useRouter();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(null); // null = loading
  const [isChecking, setIsChecking] = useState(true);

  const GetAdminsList = async () => {
    try {
      const q = query(
        collection(db, "Admins"),
        where("email", "==", user.primaryEmailAddress.emailAddress)
      );
      const querySnapshot = await getDocs(q);
      const admins = [];
      querySnapshot.forEach((doc) => {
        admins.push({ id: doc.id, ...doc.data() });
      });
      setIsAdmin(admins.length > 0);
    } catch (error) {
      console.error("Cannot fetch admins: ", error);
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (user) {
      GetAdminsList();
    }
  }, [user]);

  // Separate effect to handle routing after admin check completes
  useEffect(() => {
    if (!isChecking && isAdmin !== null) {
      if (isAdmin) {
        router.replace("/Home");
      } else {
        router.replace("/Students/StudentOnboarding");
      }
    }
  }, [isAdmin, isChecking]);

  return null;
}
