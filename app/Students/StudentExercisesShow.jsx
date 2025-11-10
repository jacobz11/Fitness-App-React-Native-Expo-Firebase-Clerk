import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BodyParts from "../../components/BodyParts";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function StudentExercisesShow() {
  const title = "רשימת התרגילים שלי";
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <AntDesign name="caret-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{strings.headerTitle}</Text>
      </View>
      <View style={styles.bodyPartCont}>
        <BodyParts title={title} isStudentExercisesShow={true} />
      </View>
      {/* Temp code for debug */}
      <TouchableOpacity
        style={{ borderWidth: 1, borderRadius: 25 }}
        onPress={() => router.push("/Students/StudentOnboarding")}
      >
        <Text style={{ fontSize: 20, fontWeight: "700" }}>
          To Student Onboarding
        </Text>
      </TouchableOpacity>
      {/* End temp code debug */}
    </SafeAreaView>
  );
}
const strings = {
  headerTitle: "רשימת תרגילים",
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyPartCont: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: 600,
  },
  btnBack: {
    left: 10,
    position: "absolute",
    backgroundColor: Colors.PRIMARY,
    width: hp(4.8),
    height: hp(4.8),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 99,
  },
});
