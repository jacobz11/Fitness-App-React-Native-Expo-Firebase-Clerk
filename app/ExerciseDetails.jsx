import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "../constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";

export default function ExerciseDetails() {
  const item = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Real-time exercise data
  const [currentExercise, setCurrentExercise] = useState({
    name: item?.name || "",
    difficulty: item?.difficulty || "",
    equipment: item?.equipment || "",
    secondaryMuscles: item?.secondaryMuscles || "",
    target: item?.target || "",
    description: item?.description || "",
    instructions: item?.instructions || "",
    gifUrl: item?.gifUrl || "",
  });

  // Edit state for all fields
  const [editedName, setEditedName] = useState(currentExercise.name);
  const [editedDifficulty, setEditedDifficulty] = useState(
    currentExercise.difficulty
  );
  const [editedEquipment, setEditedEquipment] = useState(
    currentExercise.equipment
  );
  const [editedSecondaryMuscles, setEditedSecondaryMuscles] = useState(
    currentExercise.secondaryMuscles
  );
  const [editedTarget, setEditedTarget] = useState(currentExercise.target);
  const [editedDescription, setEditedDescription] = useState(
    currentExercise.description
  );
  const [editedInstructions, setEditedInstructions] = useState(
    currentExercise.instructions
  );

  useEffect(() => {
    GetAdminsList();
  }, []);

  // Real-time listener for exercise updates
  useEffect(() => {
    const bodyPartId = item.bodyPartId;
    const exerciseIndex = parseInt(item.exerciseIndex);

    if (!bodyPartId || exerciseIndex === undefined) {
      return;
    }

    const bodyPartRef = doc(db, "BodyParts", bodyPartId);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      bodyPartRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const bodyPartData = docSnap.data();
          const exercises = bodyPartData.exercises || [];
          const updatedExercise = exercises[exerciseIndex];

          if (updatedExercise) {
            // Update current exercise data
            setCurrentExercise({
              name: updatedExercise.name || "",
              difficulty: updatedExercise.difficulty || "",
              equipment: updatedExercise.equipment || "",
              secondaryMuscles: updatedExercise.secondaryMuscles || "",
              target: updatedExercise.target || "",
              description: updatedExercise.description || "",
              instructions: updatedExercise.instructions || "",
              gifUrl: updatedExercise.gifUrl || item?.gifUrl || "",
            });

            // Update edit fields if not currently editing
            if (!isEdit) {
              setEditedName(updatedExercise.name || "");
              setEditedDifficulty(updatedExercise.difficulty || "");
              setEditedEquipment(updatedExercise.equipment || "");
              setEditedSecondaryMuscles(updatedExercise.secondaryMuscles || "");
              setEditedTarget(updatedExercise.target || "");
              setEditedDescription(updatedExercise.description || "");
              setEditedInstructions(updatedExercise.instructions || "");
            }
          }
        }
      },
      (error) => {
        console.error("Error listening to exercise updates: ", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [item.bodyPartId, item.exerciseIndex, isEdit]);

  // Use gifUrl if available, fallback to videoUrl prop
  const mediaUrl = currentExercise.gifUrl;

  // Check if it's a video or gif
  const isVideo = mediaUrl?.includes(".mp4") || mediaUrl?.includes(".mov");

  const player = isVideo
    ? useVideoPlayer(mediaUrl, (player) => {
        player.loop = true;
      })
    : null;

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

  const EditExerciseDetails = async () => {
    try {
      // Get the BodyPart document ID and exercise index from params
      const bodyPartId = item.bodyPartId;
      const exerciseIndex = parseInt(item.exerciseIndex);

      if (!bodyPartId || exerciseIndex === undefined) {
        Alert.alert("שגיאה", "נסה שוב");
        return;
      }

      // Get the current BodyPart document
      const bodyPartRef = doc(db, "BodyParts", bodyPartId);
      const bodyPartSnap = await getDoc(bodyPartRef);

      if (!bodyPartSnap.exists()) {
        Alert.alert("שגיאה", "נסה שוב");
        return;
      }

      // Get the exercises array
      const bodyPartData = bodyPartSnap.data();
      const exercises = bodyPartData.exercises || [];

      // Update the specific exercise in the array
      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        name: editedName,
        difficulty: editedDifficulty,
        equipment: editedEquipment,
        secondaryMuscles: editedSecondaryMuscles,
        target: editedTarget,
        description: editedDescription,
        instructions: editedInstructions,
      };

      // Update the document with the modified exercises array
      await updateDoc(bodyPartRef, {
        exercises: exercises,
      });

      setIsEdit(false);
      Alert.alert("הפרטים עודכנו", "פרטי התרגיל עודכנו");
    } catch (error) {
      console.error("Error updating exercise: ", error);
      Alert.alert("שגיאה", "לא הצלחנו לעדכן פרטים");
    }
  };

  const handleEditPress = () => {
    setIsEdit(true);
  };

  const handleCancelEdit = () => {
    // Reset all fields to current real-time values
    setEditedName(currentExercise.name);
    setEditedDifficulty(currentExercise.difficulty);
    setEditedEquipment(currentExercise.equipment);
    setEditedSecondaryMuscles(currentExercise.secondaryMuscles);
    setEditedTarget(currentExercise.target);
    setEditedDescription(currentExercise.description);
    setEditedInstructions(currentExercise.instructions);
    setIsEdit(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <VideoView
              style={styles.media}
              nativeControls
              player={player}
              fullscreenOptions={{ enabled: true }}
              allowsPictureInPicture
            />
          ) : (
            <Image
              source={{ uri: mediaUrl }}
              style={styles.media}
              contentFit="cover"
            />
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="caret-left" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.detailsContainer}>
          {isAdmin && (
            <View style={styles.header}>
              {!isEdit ? (
                <TouchableOpacity onPress={handleEditPress}>
                  <AntDesign name="edit" size={24} color={Colors.PRIMARY} />
                </TouchableOpacity>
              ) : (
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <AntDesign name="close" size={20} color="#fff" />
                    <Text style={styles.buttonText}>ביטול</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={EditExerciseDetails}
                  >
                    <AntDesign name="check" size={20} color="#fff" />
                    <Text style={styles.buttonText}>שמור</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Title/Name Field */}
          {isEdit ? (
            <View style={styles.editFieldContainer}>
              <Text style={styles.fieldLabel}>שם התרגיל:</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder={strings.name}
                placeholderTextColor={Colors.placeholder}
                multiline
              />
            </View>
          ) : (
            <Text style={styles.title}>{currentExercise.name}</Text>
          )}

          {/* Difficulty Field */}
          <View style={isEdit && styles.fieldRow}>
            {isEdit ? (
              <>
                <Text style={styles.subTitleText}>{strings.difficulty}</Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={editedDifficulty}
                  onChangeText={setEditedDifficulty}
                  placeholder={strings.difficulty}
                  placeholderTextColor={Colors.placeholder}
                />
              </>
            ) : (
              <Text style={styles.describeText}>
                <Text style={styles.subTitleText}>{strings.difficulty}</Text>
                {currentExercise.difficulty + "."}
              </Text>
            )}
          </View>

          {/* Equipment Field */}
          <View style={isEdit && styles.fieldRow}>
            {isEdit ? (
              <>
                <Text style={styles.subTitleText}>{strings.equipment}</Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={editedEquipment}
                  onChangeText={setEditedEquipment}
                  placeholder={strings.equipment}
                  placeholderTextColor={Colors.placeholder}
                />
              </>
            ) : (
              <Text style={styles.describeText}>
                <Text style={styles.subTitleText}>{strings.equipment}</Text>
                {currentExercise.equipment + "."}
              </Text>
            )}
          </View>
          {/* Secondary Muscles */}
          <View style={isEdit && styles.fieldRow}>
            {isEdit ? (
              <>
                <Text style={styles.subTitleText}>
                  {strings.secondaryMuscles}
                </Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={editedSecondaryMuscles}
                  onChangeText={setEditedSecondaryMuscles}
                  placeholder={strings.secondaryMuscles}
                  placeholderTextColor={Colors.placeholder}
                />
              </>
            ) : (
              <Text style={styles.describeText}>
                <Text style={styles.subTitleText}>
                  {strings.secondaryMuscles}
                </Text>
                {currentExercise.secondaryMuscles + "."}
              </Text>
            )}
          </View>
          {/* Target Field */}
          <View style={isEdit && styles.fieldRow}>
            {isEdit ? (
              <>
                <Text style={styles.subTitleText}>{strings.target}</Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={editedTarget}
                  onChangeText={setEditedTarget}
                  placeholder={strings.target}
                  placeholderTextColor={Colors.placeholder}
                />
              </>
            ) : (
              <Text style={styles.describeText}>
                <Text style={styles.subTitleText}>{strings.target}</Text>
                {currentExercise.target + "."}
              </Text>
            )}
          </View>
          {/* Description Field */}
          <View style={isEdit && styles.fieldRow}>
            {isEdit ? (
              <>
                <Text style={styles.subTitleText}>{strings.describe}</Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  placeholder={strings.describe}
                  placeholderTextColor={Colors.placeholder}
                />
              </>
            ) : (
              <Text style={styles.describeText}>
                <Text style={styles.subTitleText}>{strings.describe}</Text>
                {currentExercise.description + "."}
              </Text>
            )}
          </View>
          {/* Instructions Field */}
          <Text
            style={[
              styles.subTitleText,
              styles.titleInst,
              isEdit && styles.titleInstEdit,
            ]}
          >
            {strings.instructions}
          </Text>
          {isEdit ? (
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={editedInstructions}
              onChangeText={setEditedInstructions}
              placeholder={strings.instructions}
              placeholderTextColor={Colors.placeholder}
              multiline
              numberOfLines={6}
            />
          ) : (
            currentExercise.instructions
              ?.split(". ")
              .map((instruction, index) => {
                return (
                  <Text key={index} style={styles.textInstructions}>
                    {index + 1 + ". " + instruction + "."}
                  </Text>
                );
              })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const strings = {
  name: "שם התרגיל:",
  equipment: "ציוד: ",
  secondaryMuscles: "שרירים משניים: ",
  target: "שריר ראשי: ",
  describe: "תיאור: ",
  instructions: "הוראות ביצוע: ",
  difficulty: "רמת קושי: ",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollview: {
    paddingBottom: 30,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  editButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#999",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "600",
  },
  mediaContainer: {
    width: "100%",
    marginTop: 29,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 10,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
    opacity: 0.8,
  },
  media: {
    width: "100%",
    height: wp(100),
    backgroundColor: "#f0f0f0",
  },
  detailsContainer: {
    padding: 15,
  },
  title: {
    textAlign: "right",
    fontSize: hp(3.2),
    fontWeight: "700",
    color: "#404040",
    marginBottom: 12,
  },
  subTitleText: {
    textAlign: "right",
    fontSize: hp(2.5),
    fontWeight: "600",
    color: "#404040",
    marginBottom: 8,
  },
  describeText: {
    fontSize: hp(2.5),
    fontWeight: "400",
  },
  titleInst: {
    marginTop: 8,
    marginBottom: 0,
  },
  titleInstEdit: {
    marginTop: 8,
    marginBottom: 8,
  },
  textInstructions: {
    fontSize: hp(2.3),
    color: "#404040",
    textAlign: "right",
    marginBottom: 2,
  },
  fieldRow: {
    marginBottom: 12,
  },
  editFieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: hp(2.5),
    fontWeight: "600",
    color: "#404040",
    marginBottom: 6,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: hp(2.2),
    backgroundColor: "#f9f9f9",
    textAlign: "right",
  },
  inlineInput: {
    marginTop: 4,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
