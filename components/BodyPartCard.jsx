import { View, TouchableOpacity, StyleSheet, Image, Text } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";

export default function BodyPartCard({ item, index, router }) {
  const handlePress = () => {
    router.push({
      pathname: "/Exercises",
      params: {
        id: item.id,
        bodyPart: item.bodyPart,
        imgUrl: item.imgUrl,
        exercises: JSON.stringify(item.exercises || []),
      },
    });
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        index={index}
        style={[styles.size, styles.btn]}
      >
        <Image
          source={{ uri: item?.imgUrl }}
          resizeMode="cover"
          style={[styles.size, styles.img]}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.sizeLine}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Text style={styles.txt}>{item?.bodyPart}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  size: {
    width: wp(46),
    height: wp(52),
  },
  sizeLine: {
    width: wp(46),
    height: hp(15),
    position: "absolute",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  btn: {
    display: "flex",
    justifyContent: "flex-end",
    margin: 5,
  },
  img: {
    borderRadius: 35,
    position: "absolute",
  },
  txt: {
    fontSize: hp(2.5),
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 1,
    color: "#fff",
    marginBottom: 4,
  },
});
