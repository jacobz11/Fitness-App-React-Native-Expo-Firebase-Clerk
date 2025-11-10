import React from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import Carousel from "react-native-snap-carousel-v4";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { sliderImages } from "../constants/Sliders";

export default function ImageSlider() {
  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.slideItemCardCont}>
        <Image key={index} source={item} style={styles.image} />
        {/* <Text>{""}</Text> */}
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        data={sliderImages}
        loop={true}
        autoplay={true}
        firstItem={1}
        autoplayInterval={4000}
        slideStyle={styles.slide}
        sliderWidth={wp(100)}
        itemWidth={wp(100) - 70}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    width: wp(100),
    paddingVertical: 10,
  },
  slide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  slideItemCardCont: {
    width: wp(100) - 70,
    height: hp(25),
    borderRadius: 30,
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 30,
  },
});
