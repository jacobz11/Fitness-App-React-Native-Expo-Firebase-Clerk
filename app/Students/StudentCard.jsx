import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";

export default function StudentCard({ item, router }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavigateToExercises = () => {
    router.push({ pathname: "/Students/StudentExercises", params: item });
  };

  const handleNavigateToTraining = () => {
    router.push({ pathname: "/Students/StudentTraining", params: item });
  };

  return (
    <View>
      <TouchableOpacity
        onPress={toggleDropdown}
        style={[styles.container, isExpanded && styles.containerExpanded]}
      >
        <Image source={{ uri: item?.imgUrl }} style={styles.img} />
        <View style={styles.userInfo}>
          <View style={styles.nameDateCont}>
            <Text style={[styles.user, styles.userName]}>{item?.name}</Text>
            <Text style={styles.user}>
              {"("}
              {item?.createdAt}
              {")"}
            </Text>
          </View>
          <Text style={styles.user}>{item?.email}</Text>
        </View>
        <AntDesign
          name={isExpanded ? "up" : "down"}
          size={20}
          color={Colors.PRIMARY}
          style={styles.icon}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={[styles.dropdownButton, styles.dropdownButtonFirst]}
            onPress={handleNavigateToExercises}
          >
            <Text style={styles.dropdownButtonText}>{strings.exercises}</Text>
            <MaterialIcons
              name="fitness-center"
              size={22}
              color={Colors.PRIMARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dropdownButton, styles.dropdownButtonLast]}
            onPress={handleNavigateToTraining}
          >
            <Text style={styles.dropdownButtonText}>{strings.training}</Text>
            <MaterialIcons name="assignment" size={22} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const strings = {
  exercises: "בחירת תרגילים",
  training: "בניית תכנית אימונים",
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 15,
    padding: 10,
    gap: 5,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  containerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  img: {
    width: wp(12),
    height: wp(12),
    borderRadius: 50,
  },
  userInfo: {
    flex: 1,
  },
  user: {
    fontSize: 15,
  },
  userName: {
    fontWeight: "600",
  },
  nameDateCont: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
  },
  icon: {
    right: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.light.border,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 15,
    padding: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderSecondary,
  },
  dropdownButtonFirst: {
    borderTopWidth: 0,
  },
  dropdownButtonLast: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#404040",
  },
});
