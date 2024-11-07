import React, { useEffect } from "react";
import { TextInput, View } from "react-native";
import Animated, { interpolateColor, useAnimatedProps, useDerivedValue, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const radius = 45;
const circumference = radius * Math.PI * 2;
const duration = 6000;

const ProgressCircle = () => {

  const strokeOffset = useSharedValue(circumference);

  const percentage = useDerivedValue(() => {
    const number = ((circumference - strokeOffset.value) / circumference) * 100;
    return withTiming(number, { duration: duration });
  });

  const strokeColor = "#FF0000";

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: withTiming(strokeOffset.value, { duration: duration }),
      stroke: strokeColor
    };
  });

  useEffect(() => {
    strokeOffset.value = 0;
    // strokeOffset.value = withTiming(circumference, { duration: duration })
  }, []);

  return (
    <View style={{
      flex: 1,
      width: '100%',
      // backgroundColor: 'yellow',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Svg height="50%" width="50%" viewBox="0 0 100 100" >
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke="#E7E7E7"
          strokeWidth="10"
          fill="transparent"
        />
        <AnimatedCircle
          animatedProps={animatedCircleProps}
          cx="50"
          cy="50"
          r="45"
          strokeDasharray={`${radius * Math.PI * 2}`}
          strokeWidth="10"
          fill="transparent"
        />
      </Svg>
    </View>
  );
};

export default ProgressCircle;