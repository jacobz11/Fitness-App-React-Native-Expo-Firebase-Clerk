import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function ExerciseCard({ item, router, index, bodyPartId }) {
  return (
    <View>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/ExerciseDetails",
            params: {
              ...item,
              bodyPartId: bodyPartId,
              exerciseIndex: index,
            },
          })
        }
        style={styles.btn}
      >
        <View style={styles.container}>
          <Image
            source={{ uri: item?.gifUrl }}
            style={styles.img}
            contentFit="cover"
          />
          <View style={styles.textContainer}>
            <Text style={styles.txt} ellipsizeMode="tail" numberOfLines={1}>
              {item?.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    display: "flex",
    marginBottom: 13,
  },
  container: {
    width: wp(44),
    overflow: "hidden",
    borderRadius: 20,
  },
  img: {
    width: wp(44),
    height: wp(50),
  },
  textContainer: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  txt: {
    fontSize: hp(2),
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
