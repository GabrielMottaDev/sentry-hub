import React, { forwardRef, memo, useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const convertWidthToFontSize = (widthValue: number): number => {
  const baseWidth = 375; // Base width (e.g., iPhone 6/7/8 width)
  return (widthValue / width) * baseWidth;
};

interface LoadingDotsProps {
  amount?: number;
  color?: string;
  size?: number;
}

const LoadingDots = memo(
  forwardRef<View, LoadingDotsProps>(
    ({ amount: cAmount = 3, color = "white", size = 25 }, ref) => {
      const [amount, setAmount] = useState(cAmount);

      useEffect(() => {
        var direction = true;
        const interval = setInterval(() => {
          setAmount((prev) => {
            const inc = prev+1;
            const dec = prev-1;
            if(inc > cAmount) direction = false;
            if(dec < 0) direction = true;
            
            return direction ? inc : dec;
          });
        }, 500);

        return () => clearInterval(interval);
      }, []);

      return (
        <View
          ref={ref}
          style={[
            styles.container,
            {
              height: size,
              width: (size/2) * cAmount,
              // backgroundColor: "blue",
              justifyContent: "flex-start"
            },
          ]}
        >
          {Array.from({ length: amount }).map((_, index) => (
            <Animated.View
              key={index}
              entering={FadeIn}
              exiting={FadeOut}
              layout={LinearTransition}
              style={{
                // backgroundColor: "purple",
                width: size/2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text key={index} style={[styles.dot, { color, fontSize: size }]}>
                •
              </Text>
            </Animated.View>
          ))}
        </View>
      );
    }
  )
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    marginHorizontal: 2,
  },
});

export default React.memo(LoadingDots);
