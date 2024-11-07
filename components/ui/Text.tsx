import React, { forwardRef } from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  StyleSheet,
  TextStyle,
} from "react-native";
import { useAnimatedProps } from "react-native-reanimated";

type FontType =
  | "Black"
  | "BlackItalic"
  | "Bold"
  | "BoldItalic"
  | "ExtraBold"
  | "ExtraBoldItalic"
  | "ExtraLight"
  | "ExtraLightItalic"
  | "Italic"
  | "Light"
  | "LightItalic"
  | "Medium"
  | "MediumItalic"
  | "Regular"
  | "SemiBold"
  | "SemiBoldItalic"
  | "Thin"
  | "ThinItalic";

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  font?: FontType;
}

const Text = forwardRef<RNText, TextProps>(
  ({ children, style, font = "Regular", ...props }, ref) => {
    const styles = getStyles(font);

    return (
      <RNText ref={ref} style={[styles.defaultStyle, style]} {...props}>
        {children}
      </RNText>
    );
  }
);

const getStyles = (fontType: FontType) =>
  StyleSheet.create({
    defaultStyle: {
      fontSize: 16,
      color: "#000",
      fontFamily: "Montserrat-" + fontType,
    },
  });

export default Text;
