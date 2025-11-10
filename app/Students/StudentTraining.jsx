import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function StudentTraining() {
  const router = useRouter();
  const item = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exercisesList, setExercisesList] = useState([]);
  const [bodyPartsData, setBodyPartsData] = useState({});

  useEffect(() => {
    LoadStudentExercises();
  }, []);

  const LoadStudentExercises = async () => {
    setLoading(true);
    try {
      // Get student's assigned exercises
      const userRef = doc(db, "Users", item.id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert(strings.error, strings.studentNotFound);
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const assignedExercises = userData.assignedExercises || {};
      const exerciseOrder = userData.exerciseOrder || [];

      // Get all body parts data
      const q = query(collection(db, "BodyParts"));
      const querySnapshot = await getDocs(q);
      const bodyParts = {};
      querySnapshot.forEach((doc) => {
        bodyParts[doc.id] = { id: doc.id, ...doc.data() };
      });
      setBodyPartsData(bodyParts);

      // Build the exercises list
      const exercises = [];
      const addedExerciseIds = new Set();

      // Helper function to check if an exercise is still assigned
      const isExerciseStillAssigned = (bodyPartId, exerciseIndex) => {
        return (
          assignedExercises[bodyPartId] &&
          assignedExercises[bodyPartId].includes(exerciseIndex)
        );
      };

      // If there's an existing order, use it for exercises that are still assigned
      if (exerciseOrder.length > 0) {
        exerciseOrder.forEach((orderItem) => {
          const { bodyPartId, exerciseIndex } = orderItem;

          // Only include if exercise is still in assignedExercises
          if (!isExerciseStillAssigned(bodyPartId, exerciseIndex)) {
            return; // Skip this exercise as it's no longer assigned
          }

          const bodyPart = bodyParts[bodyPartId];
          if (
            bodyPart &&
            bodyPart.exercises &&
            bodyPart.exercises[exerciseIndex]
          ) {
            const exercise = bodyPart.exercises[exerciseIndex];
            const exerciseId = `${bodyPartId}-${exerciseIndex}`;
            exercises.push({
              id: exerciseId,
              bodyPartId,
              exerciseIndex,
              bodyPartName: bodyPart.bodyPart,
              ...exercise,
            });
            addedExerciseIds.add(exerciseId);
          }
        });
      }

      // Add any new exercises from assignedExercises that aren't in the order yet
      Object.keys(assignedExercises).forEach((bodyPartId) => {
        const exerciseIndices = assignedExercises[bodyPartId];
        const bodyPart = bodyParts[bodyPartId];

        if (bodyPart && bodyPart.exercises) {
          exerciseIndices.forEach((exerciseIndex) => {
            const exerciseId = `${bodyPartId}-${exerciseIndex}`;

            // Only add if not already added from exerciseOrder
            if (!addedExerciseIds.has(exerciseId)) {
              const exercise = bodyPart.exercises[exerciseIndex];
              if (exercise) {
                exercises.push({
                  id: exerciseId,
                  bodyPartId,
                  exerciseIndex,
                  bodyPartName: bodyPart.bodyPart,
                  ...exercise,
                });
              }
            }
          });
        }
      });

      setExercisesList(exercises);
    } catch (error) {
      console.error("Error loading exercises:", error);
      Alert.alert(strings.error, strings.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);

      // Create the exerciseOrder array
      const exerciseOrder = exercisesList.map((exercise) => ({
        bodyPartId: exercise.bodyPartId,
        exerciseIndex: exercise.exerciseIndex,
      }));

      // Update the user document
      const userRef = doc(db, "Users", item.id);
      await updateDoc(userRef, {
        exerciseOrder: exerciseOrder,
        lastUpdated: new Date().toISOString(),
      });

      Alert.alert(strings.success, strings.saveSuccess, [
        {
          text: strings.ok,
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving exercise order:", error);
      Alert.alert(strings.error, strings.saveError);
    } finally {
      setSaving(false);
    }
  };

  const renderExerciseItem = ({ item, drag, isActive }) => {
    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[styles.exerciseCard, isActive && styles.exerciseCardActive]}
      >
        {isActive ? (
          <AntDesign
            style={styles.exerciseIconOnDrag}
            name="drag"
            size={20}
            color={Colors.PRIMARY}
          />
        ) : (
          <MaterialIcons
            name="drag-indicator"
            size={27}
            color={Colors.PRIMARY}
          />
        )}

        <Image
          source={{ uri: item.gifUrl }}
          style={[styles.exerciseImage, isActive && styles.exerciseImageDrag]}
          resizeMode="cover"
        />

        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.bodyPartLabel}>{item.bodyPartName}</Text>
          {item.difficulty && (
            <Text style={styles.difficultyText}>
              {strings.difficulty} {item.difficulty}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.btnBack}
          >
            <AntDesign name="caret-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>{strings.subTitle}</Text>
        </View>

        <Text style={styles.subTitle}>
          {strings.for}
          <Text style={styles.subTitleName}>{item.name}</Text>
        </Text>

        {!loading && exercisesList.length > 0 && (
          <View style={styles.instructionContainer}>
            <MaterialIcons
              name="info-outline"
              size={20}
              color={Colors.PRIMARY}
            />
            <Text style={styles.instructionText}>{strings.instruction}</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={styles.loader}
          />
        ) : exercisesList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="fitness-center" size={60} color="#ccc" />
            <Text style={styles.emptyText}>{strings.noExercises}</Text>
            <Text style={styles.emptySubText}>{strings.noExercisesHint}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <DraggableFlatList
              data={exercisesList}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => setExercisesList(data)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSaveOrder}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <AntDesign name="check" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>{strings.save}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const strings = {
  subTitle: "בניית תכנית אימונים",
  for: "עבור: ",
  difficulty: "רמת קושי:",
  instruction: "לחץ לחיצה ארוכה וגרור כדי לשנות סדר",
  noExercises: "אין תרגילים מוקצים",
  noExercisesHint: "יש להקצות תרגילים תחילה",
  save: "שמור סדר",
  success: "נשמר בהצלחה",
  saveSuccess: "סדר התרגילים נשמר בהצלחה",
  error: "שגיאה",
  saveError: "לא הצלחנו לשמור את סדר התרגילים",
  loadError: "לא הצלחנו לטעון את התרגילים",
  studentNotFound: "המתאמן לא נמצא",
  ok: "אישור",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
    paddingHorizontal: 20,
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
    fontWeight: "600",
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
  subTitle: {
    fontSize: 20,
    textAlign: "right",
    fontWeight: "600",
    marginBottom: 10,
  },
  subTitleName: {
    color: Colors.PRIMARY,
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: "#404040",
    fontWeight: "500",
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#404040",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 100,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "space-between",
    borderRadius: 15,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  exerciseCardActive: {
    backgroundColor: "#edede9",
  },
  exerciseImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 10,
  },
  exerciseImageDrag: {
    left: 7,
  },
  exerciseIconOnDrag: {
    left: 3,
  },
  exerciseInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#404040",
    textAlign: "right",
    marginBottom: 4,
  },
  bodyPartLabel: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: "500",
    marginBottom: 2,
  },
  difficultyText: {
    fontSize: 12,
    color: "#666",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 75,
    right: 75,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
