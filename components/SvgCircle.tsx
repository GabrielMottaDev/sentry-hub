import React, { useEffect } from "react";
import { SafeAreaView, View, TextInput } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
    interpolateColor,
    useAnimatedProps,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(TextInput);

const radius = 45;
const circumference = radius * Math.PI * 2;
const duration = 3000;

const SvgCircle = () => {
    const strokeOffset = useSharedValue(circumference);

    const percentage = useDerivedValue(() => {
        const number = ((circumference - strokeOffset.value) / circumference) * 100;

        return withTiming(number, { duration: duration });
    });

    const strokeColor = useDerivedValue(() => {
        return interpolateColor(
            percentage.value,
            [0, 50, 100],
            ["rgb(246, 79, 89)", "rgb(246, 246, 89)", "rgb(79, 246, 89)"]
        );
    });

    const animatedCircleProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: withTiming(strokeOffset.value, { duration: duration }),
            stroke: strokeColor.value,
        };
    });

    useEffect(() => {
        strokeOffset.value = 0;
    }, []);

    return (
        <Svg height="50%" width="50%" viewBox="0 0 100 100">
            <AnimatedCircle
                animatedProps={animatedCircleProps}
                cx="50"
                cy="50"
                r="45"
                stroke="rgb(246, 79, 89)"
                strokeWidth="5"
                fill="rgba(255,255,255,0.2)"
                strokeDasharray={`${radius * Math.PI * 2}`}
            />
        </Svg>
    );
};

export default SvgCircle;