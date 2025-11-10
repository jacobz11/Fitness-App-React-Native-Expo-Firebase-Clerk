import { View, Text, Image, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Colors } from "../../constants/Colors";

export default function UserIntro({ user }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    GetAdminEmailsList();
  }, []);

  const GetAdminEmailsList = async () => {
    const q = query(
      collection(db, "Admins"),
      where("email", "==", user?.primaryEmailAddress.emailAddress)
    );
    const querySnapShot = await getDocs(q);
    const admins = querySnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (admins.length === 0) {
      setIsAdmin(false);
    } else setIsAdmin(true);
  };
  return (
    <View style={styles.container}>
      <Image source={{ uri: user?.imageUrl }} style={styles.imgProf} />
      {isAdmin ? (
        <View>
          <View style={styles.usrNmeWithAdmin}>
            <Text style={styles.usrNme}>{user?.fullName}</Text>
            <Text style={styles.usrNmeAdmn}>{"(" + strings.admin + ")"}</Text>
          </View>
          <Text style={styles.usrEmail}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      ) : (
        <View style={styles.contNoAdmin}>
          <Text style={styles.usrNme}>{user?.fullName}</Text>
          <Text style={styles.usrEmail}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      )}
    </View>
  );
}

const strings = {
  admin: "מנהל",
};
const styles = StyleSheet.create({
  imgProf: {
    width: 100,
    height: 100,
    borderRadius: 99,
  },
  container: {
    width: "60%",
    display: "flex",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
    backgroundColor: Colors.light.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingBlock: 10,
  },

  usrNme: {
    fontSize: 20,
    fontWeight: "700",
  },

  usrEmail: {
    fontSize: 16,
  },
  usrNmeAdmn: {
    fontSize: 18,
  },
  usrNmeWithAdmin: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
  },

  contNoAdmin: {
    alignItems: "center",
  },
});
