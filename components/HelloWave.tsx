import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  Easing,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

const EASING = Easing.elastic(0.1);

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  rotationAnimation.value = withRepeat(
    withSequence(
      withTiming(25, {
        duration: 150,
        easing: EASING
      }),
      withTiming(0, {
        duration: 150,
        easing: EASING
      })
    ), -1 // Run the animation -1 times - forever
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
