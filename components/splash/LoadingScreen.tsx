import { transform } from "@babel/core";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PixelRatio,
  StatusBarProps,
  StatusBar,
  LayoutChangeEvent,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  FadeOut,
  runOnJS,
  withDelay,
  FadeIn,
  SharedValue,
  useDerivedValue,
  AnimateProps,
  AnimatedProps,
  useAnimatedReaction,
  runOnUI,
  dispatchCommand,
  useAnimatedRef,
} from "react-native-reanimated";
import { opacity, withBouncing } from "react-native-redash";
import Svg, { G, Path, PathProps, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoadingScreenState } from "@/contexts/atoms";
import LottieView from "lottie-react-native";

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const LoadingScreen = memo(() => {
  const { state, setState, setSingleState, getSingleState, getSetSingleState } =
    useLoadingScreenState();
  console.log("LOADING SCREEN RENDER STST", state);

  const insets = useSafeAreaInsets();
  const SCREEN_HEIGHT = Dimensions.get("screen").height; // device height
  const WINDOW_HEIGHT = Dimensions.get("window").height;
  const STATUS_BAR_HEIGHT = insets.top || StatusBar.currentHeight || 24;
  // *Use prefferebly navBarOffset instead.
  let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;
  // *In cases where the navbar is gesture based
  if (NAV_BAR_HEIGHT < 0) NAV_BAR_HEIGHT = 24;

  const lineSize = 250;

  // NEW
  const _enteringTiming = useSharedValue(0); // ENTERING ANIMATION
  const _exitingTiming = useSharedValue(0); // EXITING ANIMATION

  const _STiming = useSharedValue(0); // "S" ANIMATION
  const _entryTiming = useSharedValue(0); // "entry" ANIMATION
  const _hubTiming = useSharedValue(0); // "Hub" ANIMATION
  const _blinkingTiming = useSharedValue(0); // BLINKING ANIMATION ON LOADING
  const _SPulseTiming = useSharedValue(0); // "S" SVG PATH ANIMATION
  const _SPathTiming = useSharedValue(0); // "S" SVG PATH ANIMATION
  // NEW

  // LAYOUT VALUES
  const _entryWidth = useSharedValue(0);
  const _hubHeight = useSharedValue(0);
  const _hubWidth = useSharedValue(0);

  // Animate the progress value from 0 to 1 when the component mounts
  var debug:
    | null
    | "quick"
    | "loading"
    | "text-s"
    | "text-sentry"
    | "text-hub"
    | "text-full"
    | "entering"
    | "exiting" = null; // null = final code
  useEffect(() => {
    console.log("LOADING SCREEN ANIMATION STARTS");
    if (debug != null) {
      _exitingTiming.value = 0;
      _blinkingTiming.value = 0;
      _enteringTiming.value = 0;
      _STiming.value = 0;
      _SPulseTiming.value = 0;
      _SPathTiming.value = 0;
      _hubTiming.value = 0;
      _entryTiming.value = 0;
    }

    // DEBUG
    if (debug == "entering") {
      _enteringTiming.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.elastic(1) }),
        -1,
        true
      );
    } else if (debug == "exiting") {
      _enteringTiming.value = 1;
      _SPulseTiming.value = 0;
      _SPathTiming.value = 0;
      _STiming.value = 1;
      _entryTiming.value = 1;
      _hubTiming.value = 1;
      _exitingTiming.value = withRepeat(
        withTiming(0.75, { duration: 1000, easing: Easing.elastic(0) }),
        -1,
        true
      );
    } else if (debug == "loading") {
      // _enteringTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.elastic(1) }), -1, true);
      _enteringTiming.value = 1;
      _SPathTiming.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
      _SPulseTiming.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else if (debug == "text-full") {
      _enteringTiming.value = 0.95;
      _enteringTiming.value = withRepeat(
        withTiming(
          1,
          { duration: 1000, easing: Easing.elastic(1) },
          (finished) => {
            if (!finished) return;
            var nextValue =
              _enteringTiming.value < 0.99 &&
              _STiming.value == 0 &&
              _entryTiming.value == 0 &&
              _hubTiming.value == 0
                ? 1
                : _STiming.value == 1 &&
                  _entryTiming.value == 1 &&
                  _hubTiming.value == 1
                ? 0
                : null;
            if (nextValue == null) return;
            _STiming.value = withDelay(
              150,
              withTiming(nextValue, {
                duration: 800,
                easing: Easing.inOut(Easing.cubic),
              })
            );
            _entryTiming.value = withDelay(
              0,
              withTiming(nextValue, {
                duration: 1000,
                easing: Easing.elastic(0),
              })
            );
            _hubTiming.value = withDelay(
              800,
              withTiming(nextValue, {
                duration: 500,
                easing: Easing.elastic(1),
              })
            );
          }
        ),
        -1,
        true
      );
    } else if (debug == "text-s") {
      _enteringTiming.value = 1;

      _STiming.value = withRepeat(
        withTiming(1, {
          duration: 800,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true
      );
    } else if (debug == "text-sentry") {
      _enteringTiming.value = 1;

      _STiming.value = withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
      });
      _entryTiming.value = withDelay(
        0,
        withRepeat(
          withTiming(
            1,
            { duration: 1000, easing: Easing.elastic(0) },
            (finished) => {
              if (!finished) return;
              _STiming.value = withTiming(_STiming.value > 0.5 ? 0 : 1, {
                duration: 800,
                easing: Easing.inOut(Easing.cubic),
              });
            }
          ),
          -1,
          true
        )
      );
    } else if (debug == "text-hub") {
      _enteringTiming.value = 1;
      _STiming.value = 1;
      _entryTiming.value = 1;
      _hubTiming.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.elastic(1) }),
        -1,
        true
      );
    } else if (debug == "quick") {
      _enteringTiming.value = 1;
      _SPulseTiming.value = 0;
      _STiming.value = 1;
      _entryTiming.value = 1;
      _hubTiming.value = 1;
      _exitingTiming.value = withTiming(1, {
        duration: 1000,
        easing: Easing.elastic(0),
      });
    } else {
      // FINAL CODE
      _enteringTiming.value = withTiming(
        1,
        { duration: 1000, easing: Easing.elastic(1) },
        (finished) => {
          if (!finished) return;
          _SPathTiming.value = withRepeat(
            withTiming(1, { duration: 1800, easing: Easing.linear }),
            4,
            false
          );
          _SPulseTiming.value = withRepeat(
            withTiming(1, {
              duration: 1800,
              easing: Easing.inOut(Easing.ease),
            }),
            4,
            true,
            (finished) => {
              if (!finished) return;
              _SPulseTiming.value = 0;
              _STiming.value = withDelay(
                150,
                withTiming(1, {
                  duration: 800,
                  easing: Easing.inOut(Easing.cubic),
                })
              );
              _entryTiming.value = withDelay(
                0,
                withTiming(1, { duration: 1000, easing: Easing.elastic(0) })
              );
              _hubTiming.value = withDelay(
                800,
                withTiming(1, { duration: 500, easing: Easing.elastic(1) })
              );
              _exitingTiming.value = withDelay(
                800 + 1000,
                withTiming(
                  1,
                  { duration: 600, easing: Easing.elastic(0) },
                  (finished) => {
                    if (!finished) return;
                    // runOnJS(setSingleState)("_exitingTiming", 1);
                  }
                )
              );
            }
          );
        }
      );
    }
  }, []);

  const startAnimation = () => {
    _SPulseTiming.value = withRepeat(
      withTiming(1, { duration: 1800 }),
      -1,
      true
    );
    _blinkingTiming.value = withRepeat(
      withTiming(1, { duration: 2500 }),
      3,
      true,
      (finished) => {
        if (finished) {
          _SPulseTiming.value = 0;
          _entryTiming.value = withTiming(1, { duration: 1000 }, (finished) => {
            if (finished) {
              _exitingTiming.value = withDelay(
                800,
                withTiming(1, { duration: 1000 })
              );
            }
          });
        }
      }
    );
  };

  // Create animated props for the Path element
  const _SLottieProps = useAnimatedProps(() => {
    return {
      progress: _SPathTiming.value,
    };
  });

  const _loadingProps = useAnimatedProps(() => {
    const pointerEvents:
      | "box-none"
      | "none"
      | "box-only"
      | "auto"
      | SharedValue<"box-none" | "none" | "box-only" | "auto" | undefined>
      | undefined = _exitingTiming.value >= 1 ? "none" : "auto";
    return {
      // pointerEvents: _exitingTiming.value>=1?"none":"auto"
      pointerEvents: pointerEvents,
    };
  });

  const _loadingStyle = useAnimatedStyle(() => {
    const opacity = interpolate(_exitingTiming.value, [0, 0.5, 1], [1, 1, 0]);
    const scaleExiting = interpolate(_exitingTiming.value, [0, 1], [1, 180]);
    return {
      opacity: opacity,
      transform: [{ scale: scaleExiting }],
    };
  });

  const _containerStyle = useAnimatedStyle(() => {
    const scaleEntering = interpolate(_enteringTiming.value, [0, 1], [0.85, 1]);
    // const scaleEntering = 1;
    // const scaleExiting = interpolate(_exitingTiming.value, [0, 1], [1, 180]);
    const scaleExiting = 1;

    const scale = interpolate(
      _exitingTiming.value,
      [0, 1],
      [scaleEntering, scaleExiting]
    );
    const opacity = interpolate(_enteringTiming.value, [0, 1], [0.8, 1]);
    return {
      transform: [{ scale: scale }],
      opacity: opacity,
    };
  });

  const _SStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(_STiming.value, [0, 1], [0, 90 * 3]);
    // const svgScale = interpolate(_SSvgTiming.value, [0, 1], [1, 1.1]);
    // const entryScale = interpolate(_entryTiming.value, [0, 1], [1, 0.8]);
    const svgScale = interpolate(_SPulseTiming.value, [0, 1], [1, 1.1]);
    const entryScale = interpolate(_entryTiming.value, [0, 1], [1, 0.75]);

    const scale = interpolate(
      _entryTiming.value,
      [0, 1],
      [svgScale, entryScale]
    );
    return {
      transform: [{ rotateZ: `${rotateZ}deg` }, { scale: scale }],
    };
  });

  const sentrySpacement = -12;
  const hubSpacement = -75;

  const _entryStyle = useAnimatedStyle(() => {
    // APPLIED WHEN DISPLAY SENTRY
    const sentryRight = -_entryWidth.value - sentrySpacement;
    // =====
    const right = interpolate(_entryTiming.value, [0, 1], [0, sentryRight]);
    const opacity = interpolate(
      _entryTiming.value,
      [
        0,
        0.5, // THRESHOLD TO START FADE IN
        1,
      ],
      [0, 0, 1]
    );
    return {
      right: right, // APPLIED WHEN DISPLAY SENTRY
      top: 5,
      opacity: opacity,
    };
  });

  const _sentryStyle = useAnimatedStyle(() => {
    // const scaleEntering = interpolate(_enteringTiming.value, [0, 1], [0.8, 1]);
    const scaleEntering = interpolate(_enteringTiming.value, [0, 1], [1, 1]);

    // APPLIED WHEN DISPLAY SENTRY
    const sentryMarginRight = _entryWidth.value + sentrySpacement;
    // =====
    const marginRight = interpolate(
      _entryTiming.value,
      [0, 1],
      [0, sentryMarginRight]
    );
    const marginBottom = interpolate(
      _hubTiming.value,
      [0, 1],
      [0, _hubHeight.value + hubSpacement]
    );
    const scale = scaleEntering;
    return {
      marginBottom: marginBottom,
      marginRight: marginRight, // APPLIED WHEN DISPLAY SENTRY
      transform: [{ scale: scale }],
    };
  });

  const _hubStyle = useAnimatedStyle(() => {
    // APPLIED WHEN DISPLAY SENTRY
    const sentryTop = _hubHeight.value + hubSpacement;
    // =====
    const top = interpolate(_hubTiming.value, [0, 1], [0, sentryTop]);
    const opacity = interpolate(
      _hubTiming.value,
      [
        0,
        0.5, // THRESHOLD TO START FADE IN
        1,
      ],
      [0, 0, 1]
    );

    return {
      // width: _hubWidth.value, // MANTAIN HUB WIDTH SO ABSOLUTE PARENT DONT CLIP IT
      top: top,
      opacity: opacity,
    };
  });

  const pixelDensity = PixelRatio.get();
  const [originalWidth, originalHeight] = [449, 302];
  const width = originalWidth / pixelDensity;
  const height = originalHeight / pixelDensity;

  const entryLayout = (e: LayoutChangeEvent) => {
    _entryWidth.value = e.nativeEvent.layout.width;
  };

  const hubLayout = (e: LayoutChangeEvent) => {
    console.log("HUB LAYOUT", e.nativeEvent.layout);
    _hubHeight.value = e.nativeEvent.layout.height;
    _hubWidth.value = e.nativeEvent.layout.width;
  };

  return (
    <Animated.View
      sharedTransitionTag="loading-screen"
      animatedProps={_loadingProps}
      style={[styles.loadingScreen, _loadingStyle]}
      //   entering={FadeIn}
      //   exiting={FadeOut}
      //   pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.container,
          { paddingBottom: NAV_BAR_HEIGHT },
          _containerStyle,
        ]}
      >
        <Animated.View style={[styles.sentry, _sentryStyle]}>
          <Animated.View
            style={[
              styles.s,
              {
                height: Math.min(height, width),
                width: Math.min(height, width),
                position: "relative",
              },
              _SStyle,
            ]}
          >
            <AnimatedLottieView
              // autoPlay
              // loop
              duration={2000}
              animatedProps={_SLottieProps}
              // progress={_SSvgTiming.value}
              // ref={animation}
              style={[
                {
                  position: "absolute",
                  flex: 1,
                  // top: 0,
                  height: height,
                  width: width,
                  backgroundColor: "#00000000",
                  // position: "absolute",
                  // width: 200,
                  // height: 200,
                  // backgroundColor: "#00000000",
                },
              ]}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={require("@/assets/lottie/S_Halo4.json")}
            />
          </Animated.View>
          <Animated.Text
            style={[styles.entry, _entryStyle]}
            onLayout={entryLayout}
          >
            entry
          </Animated.Text>
        </Animated.View>
        <Animated.View style={[styles.hub, _hubStyle]}>
          <Text onLayout={hubLayout} style={[styles.hubText]}>
            Hub
          </Text>
        </Animated.View>
        {/* _hubStyle */}
      </Animated.View>
      {/* </Animated.View> */}
    </Animated.View>
  );
});

const fontSize = 90;
const fontFamily = "Poppins-Bold";
const styles = StyleSheet.create({
  loadingScreen: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E2E2E",
    transformOrigin: "22% 48%", // horizontal vertical => try to find purple letter to smooth transition
    // backgroundColor: 'cian'
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    // transformOrigin: "16% 20%", // horizontal vertical => try to find purple letter to smooth transition
    transformOrigin: "center center",
    // height: '100%',

    // flex: 1,
    // backgroundColor: 'purple'
  },
  sentry: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    // backgroundColor: "green",
    // height: width,
    //   gap: 10,
  },
  s: {
    // transformOrigin: 'top',
    justifyContent: "flex-end",
    alignItems: "center",
    // transformOrigin: [0, '0%', 0],
    transformOrigin: "center",
    // backgroundColor: "yellow",
  },
  entry: {
    color: "#9F80FF",
    fontSize: fontSize,
    fontFamily: fontFamily,
    position: "absolute",
    // backgroundColor: "blue",
  },
  hub: {
    // backgroundColor: "red",
    position: "absolute",

    // zIndex: 500,
    // width: 500,
    // height: 500,
    // bottom: 0,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  hubText: {
    // backgroundColor: "white",
    color: "#9F80FF",
    fontSize: fontSize,
    fontFamily: fontFamily,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#fff",
  },
});

export default LoadingScreen;
