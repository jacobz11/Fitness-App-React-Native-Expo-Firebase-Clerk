import {
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  View,
  Animated,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import StudentOnboardingCard from "./StudentOnboardingCard";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useUser } from "@clerk/clerk-expo";
import StudentOnboardingButton from "./StudentOnboardingButton";

export default function StudentOnboarding() {
  const router = useRouter();
  const { user } = useUser();
  const [boardingList, setBoardingList] = useState([]);
  const { width } = useWindowDimensions();
  const flatListRef = useRef(null);

  // Shared state for birthday and goals
  const [birthday, setBirthday] = useState(new Date());
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    GetOnboardingList();
  }, []);

  const GetOnboardingList = async () => {
    try {
      const boarding = [];
      const q = query(collection(db, "Onboarding"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        boarding.push({ id: doc.id, ...doc.data() });
      });

      // Sort by the numeric id field
      boarding.sort((a, b) => a.id - b.id);

      setBoardingList(boarding);
    } catch (error) {
      console.error("Error fetch Onboarding", error);
    }
  };

  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const scrollToNext = () => {
    if (currentIndex < boardingList.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleStart = async () => {
    try {
      setSaving(true);

      // Find the user document
      const q = query(
        collection(db, "Users"),
        where("email", "==", user.primaryEmailAddress.emailAddress)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "Users", userDoc.id);

        // Prepare boarding data
        const boardingData = {
          birthday: formatDate(birthday),
          preferredGoals: selectedGoals, // Always include, even if empty array
        };

        // Update user document with boarding dictionary
        await updateDoc(userRef, {
          boarding: boardingData,
          lastUpdated: new Date().toISOString(),
        });

        // Navigate to home
        Alert.alert(strings.sent, strings.wait, [
          {
            text: strings.ok,
            onPress: () => {
              router.replace("/Home");
            },
          },
        ]);
      } else {
        Alert.alert(strings.error, strings.userNotFound);
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      Alert.alert(strings.error, strings.saveError);
    } finally {
      setSaving(false);
    }
  };

  const toggleGoalSelection = (goal) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) {
        // Remove goal if already selected
        return prev.filter((g) => g !== goal);
      } else {
        // Add goal if not selected
        return [...prev, goal];
      }
    });
  };

  // Pagination Dots Component
  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {boardingList.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[styles.dot, { width: dotWidth, opacity }]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === boardingList.length - 1;
  const isFirstSlide = currentIndex === 0;

  const scrollTo = () => {
    if (currentIndex < boardingList.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleStart();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Content */}
      <View style={styles.flatCont}>
        <FlatList
          ref={flatListRef}
          data={boardingList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StudentOnboardingCard
              item={item}
              birthday={birthday}
              setBirthday={setBirthday}
              selectedGoals={selectedGoals}
              toggleGoalSelection={toggleGoalSelection}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
          snapToInterval={width}
          decelerationRate="fast"
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            });
          }}
        />
      </View>

      {/* Pagination Dots */}
      {boardingList.length > 0 && <Paginator />}
      <StudentOnboardingButton
        percentage={(currentIndex + 1) * (100 / boardingList.length)}
        scrollTo={scrollTo}
      />
    </SafeAreaView>
  );
}

const strings = {
  previous: "הקודם",
  next: "הבא",
  start: "התחלה",
  error: "שגיאה",
  userNotFound: "משתמש לא נמצא",
  saveError: "לא הצלחנו לשמור את הנתונים",
  sent: "העדפותיך נשלחו אל המאמן",
  wait: "בקרוב תקבל/י הודעה מהמאמן שלך",
  ok: "אישור",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatCont: {
    flex: 1,
  },
  paginatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 80,
    marginBottom: 10,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: 4,
  },
});
