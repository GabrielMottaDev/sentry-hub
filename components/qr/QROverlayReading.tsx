import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

type QROverlayReadingProps = {
};

const BAR_HEIGHT = 2;

export const QROverlayReading = memo(({ }: QROverlayReadingProps) => {

  const QR_SIZE = 300;

  const animatedContainerTiming = useSharedValue(0);
  const animatedBarTiming = useSharedValue(0);
  const animatedBarPosition = useSharedValue(0);

  useEffect(() => {
    animatedBarTiming.value = 0;
    animatedBarTiming.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true);
    animatedBarTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }), -1, true);
    // animatedBarPosition.value = 0;
    // animatedBarPosition.value = withRepeat(withTiming(QR_SIZE-BAR_HEIGHT, { duration: 1000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const BG_DARK = '#00000097';
    const BG_LIGHT = '#00000061';
    return {
      backgroundColor: interpolateColor(animatedBarTiming.value, [0, 0.5, 1], [BG_DARK, BG_LIGHT, BG_DARK]),
    }
  });

  const animatedBarStyle = useAnimatedStyle(() => {
    return {
      top: interpolate(animatedBarTiming.value, [0, 1], [0, QR_SIZE - BAR_HEIGHT]),
    };
  });

  return (
    <Animated.View
      style={[styles.container, animatedContainerStyle]}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <Animated.View style={[styles.bar, animatedBarStyle]}>
      </Animated.View>
    </Animated.View>
  )
});

const boxShadow = {
  // Shadow
  // shadowColor: "#000",
  shadowColor: "#000",
  shadowOffset: {
      width: 0,
      height: 3,
  },
  shadowOpacity: 0.29,
  shadowRadius: 4.65,
  elevation: 2,
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#0000009b',
    width: '100%',
    height: '100%',
  },
  bar: {
    ...boxShadow,
    position: 'absolute',
    backgroundColor: '#ffffff9e',
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: 360,
  }
});