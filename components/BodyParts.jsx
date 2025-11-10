import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BodyPartCard from "./BodyPartCard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";
import { Colors } from "../constants/Colors";
import { useUser } from "@clerk/clerk-expo";

export default function BodyParts({ title, isStudentExercisesShow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bodyPartsList, setBodyPartsList] = useState([]);
  const [userDetailsList, setUserDetailsList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    GetBodyParts();
  }, []);

  const GetBodyParts = async () => {
    setLoading(true);
    setBodyPartsList([]);
    try {
      let assignedExercises = {};

      if (isStudentExercisesShow) {
        const q2 = query(
          collection(db, "Users"),
          where("email", "==", user.primaryEmailAddress.emailAddress)
        );
        const querySnapshot2 = await getDocs(q2);
        const userDetails = [];
        querySnapshot2.forEach((doc) => {
          userDetails.push({ id: doc.id, ...doc.data() });
        });
        setUserDetailsList(userDetails);

        // Get the assignedExercises object
        if (userDetails.length > 0 && userDetails[0].assignedExercises) {
          assignedExercises = userDetails[0].assignedExercises;
        }
      }
      const q = query(collection(db, "BodyParts"));
      const querySnapshot = await getDocs(q);
      const bodyParts = [];
      querySnapshot.forEach((doc) => {
        bodyParts.push({ id: doc.id, ...doc.data() });
      });

      // Filter body parts and their exercises if isStudentExercisesShow and user has assigned exercises
      if (isStudentExercisesShow && Object.keys(assignedExercises).length > 0) {
        const filteredBodyParts = bodyParts
          .filter((bodyPart) => assignedExercises[bodyPart.id]) // Only body parts with assigned exercises
          .map((bodyPart) => {
            // Filter exercises to only include assigned indices
            const assignedIndices = assignedExercises[bodyPart.id];
            const filteredExercises = bodyPart.exercises
              ? bodyPart.exercises.filter((_, index) =>
                  assignedIndices.includes(index)
                )
              : [];

            return {
              ...bodyPart,
              exercises: filteredExercises,
            };
          });

        setBodyPartsList(filteredBodyParts);
      } else if (
        isStudentExercisesShow &&
        Object.keys(assignedExercises).length === 0
      ) {
        setBodyPartsList([]);
      } else {
        setBodyPartsList(bodyParts);
      }
    } catch (error) {
      console.error("Error fetching body parts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title ? title : strings.exercises}</Text>
      {loading ? (
        <ActivityIndicator
          size={"large"}
          color={Colors.PRIMARY}
          style={styles.load}
        />
      ) : bodyPartsList.length > 0 ? (
        <FlatList
          data={bodyPartsList}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flat}
          columnWrapperStyle={styles.flat2}
          renderItem={({ item, index }) => (
            <BodyPartCard item={item} index={index} router={router} />
          )}
        />
      ) : (
        <View style={styles.emptyCont}>
          <Text style={styles.emptyTxt}>{strings.noExercises}</Text>
        </View>
      )}
    </View>
  );
}
const strings = {
  exercises: "תרגילים",
  noExercises: "אין תכנית אימונים להצגה",
};
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4,
    flex: 1,
  },
  emptyCont: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "30%",
  },
  emptyTxt: {
    fontSize: 25,
    fontWeight: "700",
    color: "#404040",
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "right",
    marginRight: 10,
  },
  flat: {
    paddingBottom: 50,
    paddingTop: 10,
  },
  flat2: {
    justifyContent: "space-between",
  },
  load: {
    marginTop: 20,
  },
});
