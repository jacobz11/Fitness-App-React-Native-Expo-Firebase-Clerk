import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "../constants/Colors";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "./../hooks/useWarmUpBrowser";
import { useOAuth } from "@clerk/clerk-expo";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Handle other cases
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        style={styles.img}
        source={require("../assets/images/welcome4.jpg")}
      />
      <LinearGradient
        colors={["transparent", "#18181b"]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.textContainer}
        >
          <Text style={styles.txt}>
            האימונים <Text style={styles.txt2}>הטובים</Text>
          </Text>
          <Text style={styles.txt}>ביותר בשבילך</Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.btnCont}
        >
          <TouchableOpacity onPress={onPress} style={styles.btn}>
            <Text style={styles.txtBtn}>התחל/י כאן</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  img: {
    height: "100%",
    width: "100%",
    position: "absolute",
  },
  gradient: {
    width: wp(100),
    height: hp(70),
    position: "absolute",
    bottom: 0,
    justifyContent: "flex-end",
    paddingBottom: hp(5),
  },
  textContainer: {
    alignItems: "center",
  },
  txt: {
    color: "#fff",
    fontSize: hp(5),
    fontWeight: "bold",
    letterSpacing: 1,
  },
  txt2: {
    color: Colors.PRIMARY,
  },
  txtBtn: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
    fontSize: hp(3),
  },
  btnCont: {
    marginTop: 20,
  },
  btn: {
    height: hp(7),
    width: wp(80),
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: "auto",
    borderWidth: 1,
    borderRadius: 99,
    borderColor: "#e5e5e5",
  },
});
