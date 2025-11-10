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
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentTrainingShow() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [exercisesList, setExercisesList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    LoadStudentExercises();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const LoadStudentExercises = async () => {
    setLoading(true);
    try {
      // Get student's exercise order
      const q = query(collection(db, "Users"));
      const querySnapshot = await getDocs(q);
      let userData = null;

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.email === user.primaryEmailAddress.emailAddress) {
          userData = { id: docSnapshot.id, ...data };
        }
      });

      if (!userData) {
        Alert.alert(strings.error, strings.noData);
        setLoading(false);
        return;
      }

      const exerciseOrder = userData.exerciseOrder || [];
      const assignedExercises = userData.assignedExercises || {};

      // Get all body parts data
      const bodyPartsQuery = query(collection(db, "BodyParts"));
      const bodyPartsSnapshot = await getDocs(bodyPartsQuery);
      const bodyParts = {};
      bodyPartsSnapshot.forEach((doc) => {
        bodyParts[doc.id] = { id: doc.id, ...doc.data() };
      });

      // Build the exercises list
      const exercises = [];

      if (exerciseOrder.length > 0) {
        // Use the order defined by the trainer
        exerciseOrder.forEach((orderItem) => {
          const { bodyPartId, exerciseIndex } = orderItem;
          const bodyPart = bodyParts[bodyPartId];

          if (
            bodyPart &&
            bodyPart.exercises &&
            bodyPart.exercises[exerciseIndex]
          ) {
            const exercise = bodyPart.exercises[exerciseIndex];
            exercises.push({
              id: `${bodyPartId}-${exerciseIndex}`,
              bodyPartId,
              exerciseIndex,
              bodyPartName: bodyPart.bodyPart,
              ...exercise,
            });
          }
        });
      } else {
        // No order, use assigned exercises
        Object.keys(assignedExercises).forEach((bodyPartId) => {
          const exerciseIndices = assignedExercises[bodyPartId];
          const bodyPart = bodyParts[bodyPartId];

          if (bodyPart && bodyPart.exercises) {
            exerciseIndices.forEach((exerciseIndex) => {
              const exercise = bodyPart.exercises[exerciseIndex];
              if (exercise) {
                exercises.push({
                  id: `${bodyPartId}-${exerciseIndex}`,
                  bodyPartId,
                  exerciseIndex,
                  bodyPartName: bodyPart.bodyPart,
                  ...exercise,
                });
              }
            });
          }
        });
      }

      setExercisesList(exercises);
    } catch (error) {
      console.error("Error loading exercises:", error);
      Alert.alert(strings.error, strings.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (hasStarted) {
      Alert.alert(strings.quitTitle, strings.quitMessage, [
        {
          text: strings.cancel,
          style: "cancel",
        },
        {
          text: strings.quit,
          onPress: () => router.back(),
          style: "destructive",
        },
      ]);
    } else {
      router.back();
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    setIsTimerRunning(true);
  };

  const handleNext = () => {
    if (isResting) {
      // Moving from rest to next exercise
      setIsResting(false);
      setTimer(0);
      if (currentIndex < exercisesList.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsTimerRunning(true);
      } else {
        // Training completed
        Alert.alert(strings.completedTitle, strings.completedMessage, [
          {
            text: strings.ok,
            onPress: () => router.back(),
          },
        ]);
      }
    } else {
      // Finish current exercise and go to rest
      handleFinishExercise();
    }
  };

  const handlePrevious = () => {
    if (isResting) {
      // Go back to previous exercise
      setIsResting(false);
      setTimer(0);
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setIsTimerRunning(true);
      }
    } else {
      // Go to previous exercise
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setTimer(0);
        setIsTimerRunning(true);
      }
    }
  };

  const handleReset = () => {
    setTimer(0);
  };

  const handleFinishExercise = () => {
    setIsTimerRunning(false);
    setTimer(0);
    setIsResting(true);
    setIsTimerRunning(true);
  };

  const handleFinishRest = () => {
    setIsTimerRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (exercisesList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.btnBack}>
            <AntDesign name="caret-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>{strings.title}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{strings.noExercises}</Text>
          <Text style={styles.emptySubText}>{strings.noExercisesHint}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = exercisesList[currentIndex];
  const mediaUrl = currentExercise?.gifUrl;
  const isVideo = mediaUrl?.includes(".mp4") || mediaUrl?.includes(".mov");

  const player = isVideo
    ? useVideoPlayer(mediaUrl, (player) => {
        player.loop = true;
        player.play();
      })
    : null;

  // Start screen
  if (!hasStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.btnBack}>
            <AntDesign name="caret-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>{strings.title}</Text>
        </View>

        <View style={styles.startContainer}>
          <Text style={styles.startTitle}>{strings.ready}</Text>
          <Text style={styles.startSubtitle}>
            {exercisesList.length} {strings.exercises}
          </Text>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>{strings.startTraining}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Rest screen
  if (isResting) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Rest visual section */}
        <View style={styles.restVisualContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <AntDesign name="caret-left" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {exercisesList.length}
            </Text>
          </View>

          <View style={styles.restIconContainer}>
            <MaterialIcons name="bedtime" size={120} color={Colors.PRIMARY} />
          </View>
        </View>

        {/* Rest details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.restTitle}>{strings.rest}</Text>

          {/* Timer */}
          <View style={[styles.timerContainer, styles.timerContainerRest]}>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentIndex === 0 && styles.navButtonTextDisabled,
                ]}
              >
                {strings.previous}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex === exercisesList.length - 1
                  ? strings.complete
                  : strings.next}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Exercise screen
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Media section */}
      <View style={styles.mediaContainer}>
        {isVideo ? (
          <VideoView
            style={styles.media}
            player={player}
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode="cover"
          />
        )}

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <AntDesign name="caret-left" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {exercisesList.length}
          </Text>
        </View>
      </View>

      {/* Exercise details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text style={styles.bodyPartName}>{currentExercise.bodyPartName}</Text>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>

        {/* Timer controls */}
        <View style={styles.timerControls}>
          <TouchableOpacity style={styles.timerButton} onPress={handleReset}>
            <Text style={styles.timerButtonText}>{strings.reset}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timerButton, styles.finishButton]}
            onPress={handleFinishExercise}
          >
            <Text style={[styles.timerButtonText, styles.finishButtonText]}>
              {strings.finish}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                currentIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              {strings.previous}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === exercisesList.length - 1
                ? strings.complete
                : strings.next}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const strings = {
  title: "אימון",
  ready: "מוכן/ה להתחיל?",
  exercises: "תרגילים",
  startTraining: "התחל/י אימון",
  reset: "איפוס",
  finish: "סיימתי",
  rest: "מנוחה",
  previous: "לתרגיל הקודם",
  next: "לתרגיל הבא",
  complete: "סיום",
  quitTitle: "לצאת מהאימון?",
  quitMessage: "האם אתה בטוח שברצונך לצאת מהאימון?",
  cancel: "ביטול",
  quit: "צא",
  completedTitle: "כל הכבוד!",
  completedMessage: "סיימת את האימון בהצלחה",
  ok: "אישור",
  noExercises: "אין תרגילים מוקצים",
  noExercisesHint: "פנה למאמן שלך להקצאת תרגילים",
  error: "שגיאה",
  loadError: "לא הצלחנו לטעון את התרגילים",
  noData: "לא נמצאו נתונים",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  startTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#404040",
    marginBottom: 20,
    textAlign: "center",
  },
  startSubtitle: {
    fontSize: 20,
    color: "#666",
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: wp(60),
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  mediaContainer: {
    width: "100%",
    height: hp(45),
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  restVisualContainer: {
    width: "100%",
    height: hp(45),
    position: "relative",
    backgroundColor: "#fff",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  restIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 35,
    left: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  progressContainer: {
    position: "absolute",
    top: 35,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  exerciseName: {
    fontSize: 25,
    fontWeight: "700",
    textAlign: "right",
  },
  bodyPartName: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 12,
  },
  restTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  timerContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  timerContainerRest: {
    marginTop: 75,
    marginBottom: 0,
  },
  timerText: {
    fontSize: 50,
    fontWeight: "700",
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 20,
  },
  timerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    minWidth: wp(35),
    alignItems: "center",
  },
  finishButton: {
    backgroundColor: Colors.PRIMARY,
  },
  timerButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.PRIMARY,
  },
  finishButtonText: {
    color: "#fff",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    gap: 15,
    position: "absolute",
    bottom: 15,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#404040",
  },
  navButtonTextDisabled: {
    color: "#999",
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
