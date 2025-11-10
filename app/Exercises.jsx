import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../constants/Colors";
import { StatusBar } from "expo-status-bar";
import ExerciseList from "../components/ExerciseList";
import { ScrollView } from "react-native-virtualized-view";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";

export default function Exercises() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [imgUrl, setImgUrl] = useState(params?.imgUrl);
  const [loading, setLoading] = useState([]);

  // Parse exercises from params (they come as a JSON string)
  const exercises = params.exercises
    ? typeof params.exercises === "string"
      ? JSON.parse(params.exercises)
      : params.exercises
    : [];

  // Fallback: fetch image if not in params
  useEffect(() => {
    fetchImageUrl();
  }, [params.id]);

  const fetchImageUrl = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "BodyParts", params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setImgUrl(data.imgUrl);
      }
    } catch (error) {
      console.error("Error fetching image URL:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <Image style={styles.img} source={{ uri: imgUrl }} />
      )}
      <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
        <AntDesign name="caret-left" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.exeCont}>
        <Text style={styles.txtExe}> תרגילי {params?.bodyPart}</Text>
        <View style={styles.exeList}>
          {exercises.length > 0 ? (
            <ExerciseList item={exercises} bodyPartId={params.id} />
          ) : (
            <Text style={styles.noExercises}>לא נמצאו תרגילים</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  img: {
    width: "100%",
    height: hp(45),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  btnBack: {
    padding: 7,
    backgroundColor: Colors.PRIMARY,
    width: hp(5.5),
    height: hp(5.5),
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(6),
    marginLeft: 10,
    borderRadius: 99,
    position: "absolute",
    display: "flex",
  },
  exeCont: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  txtExe: {
    fontSize: hp(3),
    fontWeight: "700",
    color: "#404040",
    textAlign: "right",
  },
  exeList: {
    marginTop: 10,
  },
  noExercises: {
    textAlign: "center",
    fontSize: hp(2),
    color: "#999",
    marginTop: 20,
  },
});
