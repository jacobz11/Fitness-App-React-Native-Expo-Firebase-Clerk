import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView } from "react-native-virtualized-view";

export default function StudentOnboardingCard({
  item,
  birthday,
  setBirthday,
  selectedGoals,
  toggleGoalSelection,
}) {
  const { width } = useWindowDimensions();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(Platform.OS === "ios");
    setBirthday(currentDate);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isGoalSelected = (goal) => {
    return selectedGoals.includes(goal);
  };

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.contentContainer}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item?.imgUrl }}
            style={styles.img}
            resizeMode="contain"
          />
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item?.title}</Text>
          <Text style={styles.description}>{item?.description}</Text>

          {/* Birthday Input */}
          {item?.name && (
            <View style={styles.birthdayContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(birthday)}</Text>
                <MaterialIcons
                  name="edit-calendar"
                  size={20}
                  color={Colors.PRIMARY}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={birthday}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </View>
          )}

          {/* Goals Selection */}
          {item?.goals && (
            <ScrollView
              style={styles.goalsScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.selectGoalsCont}
            >
              {item?.goals?.split(". ").map((goal, index) => {
                const selected = isGoalSelected(goal);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.selectBtn,
                      selected && styles.selectBtnActive,
                    ]}
                    onPress={() => toggleGoalSelection(goal)}
                  >
                    <Text
                      style={[
                        styles.selectTxt,
                        selected && styles.selectTxtActive,
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  img: {
    width: wp(55),
    height: hp(28),
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    maxWidth: "100%",
  },
  title: {
    fontWeight: "700",
    fontSize: 26,
    textAlign: "center",
    color: "#404040",
    lineHeight: 32,
  },
  description: {
    fontWeight: "400",
    color: "#62656b",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 30,
  },
  birthdayContainer: {
    width: "100%",
    alignItems: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: wp(42),
  },
  dateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#404040",
    flex: 1,
  },
  goalsScrollView: {
    maxHeight: hp(28),
    width: "100%",
  },
  selectGoalsCont: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  selectBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 45,
    marginBottom: 8,
  },
  selectBtnActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  selectTxt: {
    fontSize: 16,
    textAlign: "center",
  },
  selectTxtActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
