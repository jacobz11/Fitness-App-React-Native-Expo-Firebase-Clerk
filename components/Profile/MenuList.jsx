import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function MenuList({ router }) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    GetAdminsList();
  }, []);

  const GetAdminsList = async () => {
    try {
      const q = query(
        collection(db, "Admins"),
        where("email", "==", user.primaryEmailAddress.emailAddress)
      );
      const admins = [];
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        admins.push({ id: doc.id, ...doc.data() });
      });
      if (admins.length === 0) setIsAdmin(false);
      else setIsAdmin(true);
    } catch (error) {
      console.error("Cannot fetch admins: ", error);
    }
  };

  const menuAdmin = [
    {
      id: 1,
      name: strings.studentsList,
      nameLogo: "users",
      color: Colors.PRIMARY,
      path: "/Students/StudentsList",
    },
  ];
  const menuUser = [
    {
      id: 1,
      name: strings.studentExercises,
      nameLogo: "assignment",
      color: Colors.PRIMARY,
      path: "/Students/StudentExercisesShow",
    },
    {
      id: 2,
      name: strings.studentTraining,
      nameLogo: "fitness-center",
      color: Colors.PRIMARY,
      path: "/Students/StudentTrainingShow",
    },
  ];

  const onMenuClick = (item) => {
    router.push(item.path);
  };

  return (
    <View>
      {isAdmin ? (
        <View style={styles.flatCont}>
          <FlatList
            data={menuAdmin}
            key={1}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => onMenuClick(item)}
              >
                <Text style={styles.menuTxt}>{item.name}</Text>
                <FontAwesome
                  name={item.nameLogo}
                  size={20}
                  color={item.color}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <View style={styles.flatCont}>
          <FlatList
            data={menuUser}
            key={1}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemUser]}
                onPress={() => onMenuClick(item)}
              >
                <Text style={styles.menuTxt}>{item.name}</Text>
                <MaterialIcons
                  name={item.nameLogo}
                  size={20}
                  color={item.color}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
const strings = {
  studentsList: "רשימת המתאמנים שלי",
  studentExercises: "רשימת תרגילים",
  studentTraining: "התחילו אימון",
};
const styles = StyleSheet.create({
  menuItem: {
    width: wp(62),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 10,
    margin: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.light.border,
  },
  menuItemUser: {
    width: wp(48),
    position: "relative",
    justifyContent: "flex-end",
    gap: 10,
  },
  flatCont: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  menuTxt: {
    fontSize: 20,
    fontWeight: 600,
  },
});
