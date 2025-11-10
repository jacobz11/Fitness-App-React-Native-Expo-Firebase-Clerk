import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import StudentCard from "./StudentCard";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function StudentsList() {
  useEffect(() => {
    GetAllUsers();
  }, []);

  const { user } = useUser();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const GetAllUsers = async () => {
    setLoading(true);
    try {
      const users = [];
      const q = query(
        collection(db, "Users"),
        where("email", "!=", user.primaryEmailAddress.emailAddress)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setUsersList(users);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <AntDesign name="caret-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{strings.title}</Text>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.PRIMARY}
          style={styles.load}
        />
      ) : (
        <FlatList
          data={usersList}
          contentContainerStyle={styles.flat}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <StudentCard item={item} router={router} index={index} />
          )}
        />
      )}
    </View>
  );
}

const strings = {
  title: "רשימת המתאמנים שלי",
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 35,
  },
  title: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: 600,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  flat: {
    marginTop: 20,
    paddingBottom: 50,
    gap: 10,
  },
  btnBack: {
    left: -5,
    position: "absolute",
    backgroundColor: Colors.PRIMARY,
    width: hp(4.8),
    height: hp(4.8),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 99,
    display: "flex",
  },
  load: {
    marginTop: 15,
  },
});
