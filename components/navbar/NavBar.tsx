import { useNavBarAnimation } from "@/contexts/atoms";
import { useDimensions } from "@/contexts/DimensionsProvider";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef } from "react";
import { LayoutChangeEvent, StyleProp, StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  interpolate,
  Keyframe,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MemoView } from "../memo/MemoView";
import NavItem from "./NavItem";

type NavBarProps = {
  style?: StyleProp<any>;
};

const shadowHeight = 45;

const NavBar = ({ style }: NavBarProps) => {
  const { NAV_BAR_HEIGHT } = useDimensions();

  const iconSize = 22;

  const { setNavbarOffset, navbarOffset } = useDimensions();

  const styles = createStyles(NAV_BAR_HEIGHT, navbarOffset);

  const keyframe = new Keyframe({
    0: {
      transform: [{ translateY: 100 }],
    },
    100: {
      transform: [{ translateY: 0 }],
      easing: Easing.bezier(0.25, 0.1, 0.25, 1).factory(),
    },
  })
    .reduceMotion(ReduceMotion.Never)
    .duration(1000);

  const { finished, setFinished } = useNavBarAnimation();

  const animationProgress = useSharedValue(finished ? 1 : 0);
  const animationNavbarOffset = useSharedValue(finished ? navbarOffset : 0);

  const hasUpdatedOnMount = useRef(false);
  var animatedBottom = useAnimatedStyle(() => {
    if (finished) {
      return { bottom: 0 };
    }
    return {
      bottom: interpolate(
        animationProgress.value,
        [0, 1],
        [-animationNavbarOffset.value, 0]
      ),
    };
  });
  var animatedTransform = useAnimatedStyle(() => {
    if (finished) {
      return {
        transform: [{ translateY: 0 }],
      };
    }
    return {
      transform: [
        {
          translateY: interpolate(
            animationProgress.value,
            [0, 1],
            [animationNavbarOffset.value, 0]
          ),
        },
        // { translateY: navbarOffset }
      ],
    };
  });
  var animatedMargin = useAnimatedStyle(() => {
    // return {};
    if (finished) {
      return {
        // height: navbarOffset,
        marginBottom: navbarOffset,
      };
      // return { marginBottom: navbarOffset };
    }
    return {
      marginBottom: interpolate(
        animationProgress.value,
        [0, 1],
        [0, animationNavbarOffset.value]
      ),
      //   height: interpolate(
      //     animationProgress.value,
      //     [0, 1],
      //     [0, animationNavbarOffset.value]
      //   ),
    };
  });

  useEffect(() => {
    if (finished) {
      return;
    }
    animationProgress.value = withTiming(1, { duration: 1000 }, () => {
      runOnJS(setFinished)(true);
    });
  }, [setFinished]);

  const navLoaded = useRef(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    if (!navLoaded.current) {
      setNavbarOffset(event.nativeEvent.layout.height);
      animationNavbarOffset.value = event.nativeEvent.layout.height;
      navLoaded.current = true;
    }
  }, []);

  return (
    <MemoView style={[{}]}>
      <Animated.View style={[animatedTransform]}>
        <Animated.View style={[animatedMargin]}></Animated.View>
        <Animated.View
          style={[style, styles.navbar, {}]}
          onLayout={handleLayout}
        >
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.3)"]}
            locations={[0.55, 1]}
            style={[{ height: shadowHeight }, styles.shadowOverlay]}
          />
          <NavItem
            href={`/player`}
            title="Players"
            icon={<FontAwesome5 name="list" size={iconSize} color="white" />}
          />
          <NavItem
            // href={`/server`}
            href={`/player`}
            title="Servers"
            icon={<FontAwesome5 name="server" size={iconSize} color="white" />}
          />
          <NavItem
            href={`/2fa`}
            title="2FA"
            icon={<FontAwesome6 name="shield" size={iconSize} color="white" />}
          />
        </Animated.View>
      </Animated.View>
    </MemoView>
  );
};

const createStyles = (NAV_BAR_HEIGHT: number, navbarOffset: number) =>
  StyleSheet.create({
    shadowOverlay: {
      position: "absolute",
      right: 0,
      left: 0,
      top: -shadowHeight,
    },
    navbar: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      padding: 0,
      paddingBottom: NAV_BAR_HEIGHT,
      columnGap: 15,

      position: "absolute",
      right: 0,
      left: 0,
      bottom: 0,
      backgroundColor: "#0000008f",
      // backgroundColor: '#f107078f'
    },
  });

export default NavBar;
