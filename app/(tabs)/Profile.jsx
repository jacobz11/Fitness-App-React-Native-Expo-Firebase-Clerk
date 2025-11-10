import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MenuList from "../../components/Profile/MenuList";
import UserIntro from "../../components/Profile/UserIntro";
import { useUser } from "@clerk/clerk-expo";

export default function Profile() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.title}</Text>
      <View style={styles.contentContainer}>
        <UserIntro user={user} />
        <MenuList router={router} />
      </View>
    </View>
  );
}

const strings = {
  title: "פרופיל",
  studentsList: "רשימת המתאמנים שלי",
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "right",
    paddingTop: 25,
  },
});
