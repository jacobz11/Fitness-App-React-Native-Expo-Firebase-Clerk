import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import BodyParts from "./../../components/BodyParts";
// import ImageSlider from "./../../components/ImageSlider";

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.txt}>{strings.title}</Text>
          <Text style={[styles.txt, styles.txtBelow]}>{strings.subTitle}</Text>
        </View>
        <View style={styles.profile}>
          <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
          <TouchableOpacity style={styles.logout} onPress={() => signOut()}>
            <AntDesign name="logout" color={Colors.PRIMARY} size={17} />
          </TouchableOpacity>
        </View>
      </View>
      {/* <View>
        <ImageSlider />
      </View> */}
      <View style={styles.bodyPartCont}>
        <BodyParts />
      </View>
    </SafeAreaView>
  );
}
const strings = {
  title: "נתחיל את",
  subTitle: "האימונים",
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  title: {
    marginVertical: 2,
    alignItems: "flex-end",
  },
  txt: {
    fontSize: hp(4.5),
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#404040",
  },
  txtBelow: {
    color: Colors.PRIMARY,
    letterSpacing: 2.3,
  },
  profile: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  avatar: {
    height: hp(6),
    width: hp(6),
    borderRadius: 99,
  },
  logout: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 99,
    borderWidth: 0.2,
    borderColor: "gray",
  },
  bodyPartCont: {
    flex: 1,
  },
});
