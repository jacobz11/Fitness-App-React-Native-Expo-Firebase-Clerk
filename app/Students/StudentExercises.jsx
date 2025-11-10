import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "../../constants/Colors";
import { useEffect, useState } from "react";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function StudentExercises() {
  const item = useLocalSearchParams();
  const router = useRouter();
  const [bodyPartsList, setBodyPartsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedExercises, setSelectedExercises] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    GetBodyParts();
    LoadUserExercises();
  }, []);

  const GetBodyParts = async () => {
    setLoading(true);
    setBodyPartsList([]);
    try {
      const q = query(collection(db, "BodyParts"));
      const querySnapshot = await getDocs(q);
      const bodyParts = [];
      querySnapshot.forEach((doc) => {
        bodyParts.push({ id: doc.id, ...doc.data() });
      });
      setBodyPartsList(bodyParts);
    } catch (error) {
      console.error("Error fetching body parts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load existing exercises for the user
  const LoadUserExercises = async () => {
    try {
      const userRef = doc(db, "Users", item.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.assignedExercises) {
          setSelectedExercises(userData.assignedExercises);
        }
      }
    } catch (error) {
      console.error("Error loading user exercises:", error);
    }
  };

  const toggleSection = (bodyPartId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [bodyPartId]: !prev[bodyPartId],
    }));
  };

  const toggleExerciseSelection = (bodyPartId, exerciseIndex) => {
    setSelectedExercises((prev) => {
      const currentExercises = prev[bodyPartId] || [];

      if (currentExercises.includes(exerciseIndex)) {
        // Remove index from array
        const updatedExercises = currentExercises.filter(
          (idx) => idx !== exerciseIndex
        );

        if (updatedExercises.length === 0) {
          // Remove bodyPartId key if no exercises left
          const { [bodyPartId]: removed, ...rest } = prev;
          return rest;
        } else {
          return {
            ...prev,
            [bodyPartId]: updatedExercises,
          };
        }
      } else {
        // Add index to array
        return {
          ...prev,
          [bodyPartId]: [...currentExercises, exerciseIndex],
        };
      }
    });
  };

  const isExerciseSelected = (bodyPartId, exerciseIndex) => {
    return selectedExercises[bodyPartId]?.includes(exerciseIndex) || false;
  };

  const OnDeletePress = () => {
    Alert.alert(strings.deleteAll, strings.message, [
      {
        text: strings.ok,
        onPress: () => {
          DeleteStudentExercises();
          router.back();
        },
      },
      {
        text: strings.cancelDel,
        onPress: () => {
          return;
        },
      },
    ]);
  };
  const DeleteStudentExercises = async () => {
    try {
      const userRef = doc(db, "Users", item.id);
      setSelectedExercises({});
      // Delete assignedExercises from the database
      await updateDoc(userRef, {
        assignedExercises: deleteField(),
        lastUpdated: new Date().toISOString(),
      });
      router.back();
    } catch (error) {
      Alert.alert(strings.error, strings.delError, [
        {
          text: strings.ok,
          onPress: () => router.back(),
        },
      ]);
      console.error("Error:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const userRef = doc(db, "Users", item.id);

      // Check if selectedExercises is empty
      if (Object.keys(selectedExercises).length === 0) {
        // Delete assignedExercises from the database
        await updateDoc(userRef, {
          assignedExercises: deleteField(),
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Save the grouped exercises
        await updateDoc(userRef, {
          assignedExercises: selectedExercises,
          lastUpdated: new Date().toISOString(),
        });
      }

      Alert.alert(strings.success, strings.saveSuccess, [
        {
          text: strings.ok,
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving exercises:", error);
      Alert.alert(strings.error, strings.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <AntDesign name="caret-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{strings.subTitle}</Text>
      </View>
      <Text style={styles.subTitle}>
        {strings.for}
        <Text style={styles.subTitleName}>{item.name}</Text>
      </Text>
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={styles.loader}
          />
        ) : (
          bodyPartsList.map((bodyPart) => (
            <View key={bodyPart.id} style={styles.bodyPartSection}>
              <TouchableOpacity
                style={styles.bodyPartHeader}
                onPress={() => toggleSection(bodyPart.id)}
              >
                <MaterialIcons
                  name={
                    expandedSections[bodyPart.id]
                      ? "keyboard-arrow-up"
                      : "keyboard-arrow-down"
                  }
                  size={24}
                  color={Colors.PRIMARY}
                />
                <View style={styles.bodyPartTitleContainer}>
                  <View>
                    {selectedExercises[bodyPart.id]?.length > 0 && (
                      <Text style={styles.exerciseCount}>
                        {selectedExercises[bodyPart.id].length}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.bodyPartTitle}>
                      {bodyPart.bodyPart}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {expandedSections[bodyPart.id] && (
                <View style={styles.exercisesList}>
                  {bodyPart.exercises && bodyPart.exercises.length > 0 ? (
                    bodyPart.exercises.map((exercise, index) => {
                      const selected = isExerciseSelected(bodyPart.id, index);
                      return (
                        <Pressable
                          key={index}
                          style={[
                            styles.exerciseItem,
                            selected && styles.exerciseItemSelected,
                          ]}
                          onPress={() =>
                            toggleExerciseSelection(bodyPart.id, index)
                          }
                        >
                          <Text
                            style={[selected && styles.exerciseTextSelected]}
                          ></Text>
                          <Text
                            style={[
                              styles.exerciseName,
                              selected && styles.exerciseTextSelected,
                            ]}
                          >
                            {exercise.name}
                          </Text>
                        </Pressable>
                      );
                    })
                  ) : (
                    <Text style={styles.noExercises}>
                      {strings.noExercises}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btns, styles.saveBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.txtBtn, styles.txtSaveBtn]}>
                {strings.save}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btns, styles.cancelBtn]}
            onPress={OnDeletePress}
            disabled={saving}
          >
            <Text style={[styles.txtBtn, styles.txtCancelBtn]}>
              {strings.cancel}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const strings = {
  noExercises: "אין תרגילים זמינים",
  subTitle: "בחירת תרגילים",
  for: "עבור: ",
  save: "שמור שינויים",
  cancel: "מחק הכל",
  success: "נשמר",
  saveSuccess: "תכנית האימונים נשמרה",
  error: "שגיאה",
  saveError: "לא הצלחנו לשמור את תכנית האימון",
  ok: "אישור",
  deleteAll: "למחוק את כל האימונים?",
  message: "פעולה זו איננה ניתנת לביטול",
  delError: "לא הצלחנו למחוק",
  cancelDel: "ביטול",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
    paddingHorizontal: 15,
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
  subTitle: {
    fontSize: 20,
    textAlign: "right",
    fontWeight: 600,
    marginBottom: 10,
  },
  subTitleName: {
    color: Colors.PRIMARY,
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
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  bodyPartSection: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  bodyPartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  bodyPartTitle: {
    fontSize: hp(2.5),
    fontWeight: "600",
    color: "#404040",
    flex: 1,
    textAlign: "right",
    marginRight: 10,
  },
  bodyPartTitleContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
  },
  exerciseCount: {
    fontSize: hp(2.2),
    fontWeight: "700",
    color: Colors.PRIMARY,
  },
  exercisesList: {
    padding: 15,
    paddingTop: 10,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 5,
  },
  exerciseItemSelected: {
    // borderBottomWidth: 0,
    backgroundColor: Colors.PRIMARY,
  },
  exerciseName: {
    fontSize: hp(2),
    color: "#404040",
    textAlign: "right",
  },
  exerciseTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  noExercises: {
    fontSize: hp(2),
    color: "#999",
    textAlign: "center",
    paddingVertical: 10,
  },
  buttons: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  btns: {
    paddingBlock: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#f3f3f3",
    borderRadius: 10,
  },
  saveBtn: {
    backgroundColor: Colors.PRIMARY,
  },
  txtBtn: {
    fontSize: 15,
    fontWeight: "600",
  },
  txtSaveBtn: {
    color: "#fff",
  },
  txtCancelBtn: {
    color: "#000",
  },
  cancelBtn: {
    backgroundColor: "#fff",
  },
});
