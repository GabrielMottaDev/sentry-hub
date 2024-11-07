import { RegisteredStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

export const boxShadows = (): ViewStyle => {
  // const finalConfig = {};
  return {
    // Shadow for iOS
    shadowColor: 'rgba(0, 0, 0, 0.75)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 5,
  };
};

export const textShadows: TextStyle = {
  textShadowColor: 'rgba(0, 0, 0, 0.75)',
  textShadowOffset: { width: -1, height: 1 },
  textShadowRadius: 10,
};