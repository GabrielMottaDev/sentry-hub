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
// Animated.addWhitelistedUIProps

// Create the animated component
// const AnimatedPath2 = Animated.createAnimatedComponent(Path);

// Define the props interface

// Custom wrapper component
// const AnimatedPath: React.FC = Animated.createAnimatedComponent(({ ...props }: any) => {
//   return <AnimatedPath2 {...props} />;
// });

const LoadingScreen = memo(() => {
  const { state, setState, setSingleState, getSingleState, getSetSingleState } =
    useLoadingScreenState();
  console.log("LOADING SCREEN RENDER STST", state);
  // console.log("LOADING SCREEN RENDER TEST");
  // useEffect(() => {
  //   setSingleState("_exitingTiming", 1);
  //   // setState({ _exitingTiming: 1 });
  // }, []);

  const insets = useSafeAreaInsets();
  const SCREEN_HEIGHT = Dimensions.get("screen").height; // device height
  const WINDOW_HEIGHT = Dimensions.get("window").height;
  const STATUS_BAR_HEIGHT = insets.top || StatusBar.currentHeight || 24;
  // *Use prefferebly navBarOffset instead.
  let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;
  // *In cases where the navbar is gesture based
  if (NAV_BAR_HEIGHT < 0) NAV_BAR_HEIGHT = 24;

  const lineSize = 250;

  // const animationStarted = useRef<boolean>(false);

  // // NEW
  // const _enteringTiming = getSetSingleState('_enteringTiming', useSharedValue<number>(0)); // ENTERING ANIMATION
  // const _exitingTiming = getSetSingleState('_exitingTiming', useSharedValue<number>(0)); // EXITING ANIMATION
  // console.log("LALALA", _exitingTiming.value);
  // // const _exitingTiming = useSharedValue(0); // EXITING ANIMATION

  // const _STiming = getSetSingleState('_STiming', useSharedValue<number>(0)); // "S" ANIMATION
  // const _entryTiming = getSetSingleState('_entryTiming', useSharedValue<number>(0)); // "entry" ANIMATION
  // const _hubTiming = getSetSingleState('_hubTiming', useSharedValue<number>(0)); // "Hub" ANIMATION
  // const _blinkingTiming = getSetSingleState('_blinkingTiming', useSharedValue<number>(0)); // BLINKING ANIMATION ON LOADING
  // const _SSvgTiming = getSetSingleState('_SSvgTiming', useSharedValue<number>(0)); // "S" SVG PATH ANIMATION
  // // NEW

  // // LAYOUT VALUES
  // const _entryWidth = getSetSingleState('_entryWidth', useSharedValue<number>(0));
  // const _hubHeight = getSetSingleState('_hubHeight', useSharedValue<number>(0));
  // const _hubWidth = getSetSingleState('_hubWidth', useSharedValue<number>(0));

  // NEW
  const _enteringTiming = useSharedValue(0); // ENTERING ANIMATION
  // const _exitingTiming = getSetSingleState('_exitingTiming', useSharedValue<number>(0)); // EXITING ANIMATION
  // console.log("LALALA", _exitingTiming.value);
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
    | "exiting" = "loading"; // null = final code
  useEffect(() => {
    // if(getSingleState("animationStarted") == true) return;
    // setSingleState("animationStarted", true);
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
      // _STiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.cubic) }), -1, true);
      // _hubTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.elastic(1) }), -1, true);
      // _entryTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.elastic(1) }), -1, true);
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
              // _STiming.value = withDelay(50, withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) }));
              // _entryTiming.value = withDelay(0, withTiming(1, { duration: 1000, easing: Easing.elastic(0) }));
              // _hubTiming.value = withDelay(500, withTiming(1, { duration: 800, easing: Easing.elastic(0) }));
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

    // _enteringTiming.value = withTiming(1, { duration: 800 }, (finished) => {
    //   //   if (finished) runOnJS(startAnimation)();
    // });
  }, []);

  const startAnimation = () => {
    _SPulseTiming.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true);
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

  const [strokeWidth, setStrokeWidth] = useState<number>();
  const [strokeOpacity, setStrokeOpacity] = useState<number>();
  const [strokeDashoffset, setStrokeDashoffset] = useState<number>();
  const [rawOpacity, setRawOpacity] = useState<number>();

  // useAnimatedReaction(
  //   () => _SSvgTiming.value,
  //   (currentValue, previousValue) => {
  //     if(!currentValue || !previousValue) return;
  //     const max = Math.max(currentValue, previousValue);
  //     const min = Math.min(currentValue, previousValue);
  //     if(max-min<0.01) return;
  //     console.log("ANIMATE", max-min);
  //     requestAnimationFrame(() => {
  //       runOnJS(setStrokeWidth)(interpolate(currentValue, [0, 1], [0, 2]));
  //       runOnJS(setStrokeOpacity)(
  //         interpolate(currentValue, [0, 0.5, 1], [0, 1, 0])
  //       );
  //       runOnJS(setStrokeDashoffset)(lineSize - currentValue * lineSize);
  //       runOnJS(setRawOpacity)(interpolate(currentValue, [0, 1], [1, 0.7]));
  //     });
  //   }
  // );

  // Create animated props for the Path element
  const _SLottieProps = useAnimatedProps(() => {
    return {
      progress: _SPathTiming.value,
    }
  });

  const _SSvgProps = useAnimatedProps<Partial<AnimatedProps<PathProps>>>(() => {
    return {
      strokeWidth: interpolate(_SPulseTiming.value, [0, 1], [0, 2]),
      strokeOpacity: interpolate(_SPulseTiming.value, [0, 0.5, 1], [0, 1, 0]),
      strokeDashoffset: lineSize - _SPulseTiming.value * lineSize, // This can animate a stroke dash offset
      opacity: interpolate(_SPulseTiming.value, [0, 1], [1, 0.7]),
      //   transform: [{ scale: interpolate(_SSvgTiming.value, [0, 1], [1, 1.1]) }],
    };
  });

  const _SSvgStyle = useAnimatedStyle(() => {
    return {
      strokeWidth: interpolate(_SPulseTiming.value, [0, 1], [0, 2]),
      strokeOpacity: interpolate(_SPulseTiming.value, [0, 0.5, 1], [0, 1, 0]),
      strokeDashoffset: lineSize - _SPulseTiming.value * lineSize, // This can animate a stroke dash offset
      opacity: interpolate(_SPulseTiming.value, [0, 1], [1, 0.7]),
      //   transform: [{ scale: interpolate(_SSvgTiming.value, [0, 1], [1, 1.1]) }],
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
      {/* <Animated.View
            exiting={ZoomOut.withInitialValues({ transform: [{ scale: 1.2 }] })}
          > */}
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
                position: 'relative'
              },
              _SStyle,
            ]}
          >
            {/* <Svg
              width={width}
              height={height}
              viewBox={`0 0 ${originalWidth} ${originalHeight}`}
              fill="none"
              style={{
                // backgroundColor: "blue"
              }}
            >
              <AnimatedPath
                animatedProps={_SSvgProps}
                fill="#9f7fff"
                fillRule="evenodd"
                stroke="#FFFFFF"
                strokeLinecap="butt"
                strokeDasharray={lineSize}
                //   stroke="#ffffff66"
                d="M448.566 147.466C448.566 176.484 443.368 202.617 432.974 225.868C422.482 249.118 407.42 267.517 387.785 281.065C368.15 294.612 344.906 301.569 318.053 301.935L318.053 212.412C336.051 211.222 350.296 205.18 360.787 194.287C371.278 183.303 376.524 168.291 376.524 149.251C376.524 129.754 371.567 114.421 361.653 103.254C351.836 92.0863 338.987 86.5026 323.106 86.5026C310.112 86.5026 299.477 90.3014 291.2 97.8989C282.826 105.497 276.233 114.925 271.421 126.184C266.608 137.534 261.266 153.187 255.395 173.142C247.022 200.146 238.744 222.115 230.563 239.049C222.382 255.983 210.062 270.492 193.604 282.575C177.049 294.749 154.96 300.837 127.337 300.837C101.446 300.837 78.8756 294.658 59.6259 282.3C40.3762 269.943 25.6021 252.642 15.3035 230.399C5.10118 208.064 -5.21758e-06 182.571 -6.46996e-06 153.92C-8.34653e-06 110.989 10.9723 76.1131 32.917 49.2927C54.8616 22.3808 85.5167 7.55185 124.882 4.80573L124.882 96.6632C109.771 97.487 97.3072 103.574 87.4898 114.925C77.6725 126.275 72.7638 141.288 72.7638 159.961C72.7638 176.255 77.1431 189.299 85.9017 199.093C94.7566 208.796 107.509 213.648 124.16 213.648C135.903 213.648 145.672 209.986 153.468 202.663C161.168 195.249 167.424 186.095 172.237 175.202C177.049 164.218 182.583 148.794 188.839 128.93C197.213 101.835 205.587 79.7746 213.96 62.7487C222.334 45.6313 234.894 30.8938 251.641 18.5363C268.389 6.1788 290.333 5.22365e-05 317.475 5.105e-05C340.864 5.00277e-05 362.616 5.76688 382.732 17.3005C402.848 28.8342 418.873 45.7686 430.808 68.1036C442.646 90.3471 448.566 116.801 448.566 147.466Z"
                vectorEffect="non-scaling-stroke"
                
              />

              <Path
                id={"loading-s-path"}
                testID={"loading-s-path"}
                key={"loading-s-path"}
                // animatedProps={_SSvgProps}

                strokeWidth={0}
                strokeOpacity={0}
                strokeDashoffset={0}
                opacity={1}
                fill="#9f7fff"
                fillRule="evenodd"
                //   stroke="#ffffff66"
                stroke="#FFFFFF"
                // strokeInternal="#FFFFFF"
                strokeLinecap="butt"
                strokeDasharray={lineSize}
                d="M448.566 147.466C448.566 176.484 443.368 202.617 432.974 225.868C422.482 249.118 407.42 267.517 387.785 281.065C368.15 294.612 344.906 301.569 318.053 301.935L318.053 212.412C336.051 211.222 350.296 205.18 360.787 194.287C371.278 183.303 376.524 168.291 376.524 149.251C376.524 129.754 371.567 114.421 361.653 103.254C351.836 92.0863 338.987 86.5026 323.106 86.5026C310.112 86.5026 299.477 90.3014 291.2 97.8989C282.826 105.497 276.233 114.925 271.421 126.184C266.608 137.534 261.266 153.187 255.395 173.142C247.022 200.146 238.744 222.115 230.563 239.049C222.382 255.983 210.062 270.492 193.604 282.575C177.049 294.749 154.96 300.837 127.337 300.837C101.446 300.837 78.8756 294.658 59.6259 282.3C40.3762 269.943 25.6021 252.642 15.3035 230.399C5.10118 208.064 -5.21758e-06 182.571 -6.46996e-06 153.92C-8.34653e-06 110.989 10.9723 76.1131 32.917 49.2927C54.8616 22.3808 85.5167 7.55185 124.882 4.80573L124.882 96.6632C109.771 97.487 97.3072 103.574 87.4898 114.925C77.6725 126.275 72.7638 141.288 72.7638 159.961C72.7638 176.255 77.1431 189.299 85.9017 199.093C94.7566 208.796 107.509 213.648 124.16 213.648C135.903 213.648 145.672 209.986 153.468 202.663C161.168 195.249 167.424 186.095 172.237 175.202C177.049 164.218 182.583 148.794 188.839 128.93C197.213 101.835 205.587 79.7746 213.96 62.7487C222.334 45.6313 234.894 30.8938 251.641 18.5363C268.389 6.1788 290.333 5.22365e-05 317.475 5.105e-05C340.864 5.00277e-05 362.616 5.76688 382.732 17.3005C402.848 28.8342 418.873 45.7686 430.808 68.1036C442.646 90.3471 448.566 116.801 448.566 147.466Z"
                vectorEffect="non-scaling-stroke"
              />
            </Svg> */}
            <AnimatedLottieView
              // autoPlay
              // loop
              duration={2000}
              animatedProps={_SLottieProps}
              // progress={_SSvgTiming.value}
              // ref={animation}
              style={[{
                position: 'absolute',
                flex: 1,
                // top: 0,
                height: height,
                width: width,
                backgroundColor: "#00000000"
                // position: "absolute",
                // width: 200,
                // height: 200,
                // backgroundColor: "#00000000",
              }]}
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

// const AnimatedLoadingScreen = memo(() => {

//   const { state, setState, setSingleState, getSingleState, getSetSingleState } = useLoadingScreenState();
//   console.log("LOADING SCREEN RENDER STST", state);
//   // console.log("LOADING SCREEN RENDER TEST");
//   // useEffect(() => {
//   //   setSingleState("_exitingTiming", 1);
//   //   // setState({ _exitingTiming: 1 });
//   // }, []);

//   const insets = useSafeAreaInsets();
//   const SCREEN_HEIGHT = Dimensions.get("screen").height; // device height
//   const WINDOW_HEIGHT = Dimensions.get("window").height;
//   const STATUS_BAR_HEIGHT = insets.top || StatusBar.currentHeight || 24;
//   // *Use prefferebly navBarOffset instead.
//   let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;
//   // *In cases where the navbar is gesture based
//   if (NAV_BAR_HEIGHT < 0) NAV_BAR_HEIGHT = 24;

//   const lineSize = 250;

//   // const animationStarted = useRef<boolean>(false);

//   // // NEW
//   // const _enteringTiming = getSetSingleState('_enteringTiming', useSharedValue<number>(0)); // ENTERING ANIMATION
//   // const _exitingTiming = getSetSingleState('_exitingTiming', useSharedValue<number>(0)); // EXITING ANIMATION
//   // console.log("LALALA", _exitingTiming.value);
//   // // const _exitingTiming = useSharedValue(0); // EXITING ANIMATION

//   // const _STiming = getSetSingleState('_STiming', useSharedValue<number>(0)); // "S" ANIMATION
//   // const _entryTiming = getSetSingleState('_entryTiming', useSharedValue<number>(0)); // "entry" ANIMATION
//   // const _hubTiming = getSetSingleState('_hubTiming', useSharedValue<number>(0)); // "Hub" ANIMATION
//   // const _blinkingTiming = getSetSingleState('_blinkingTiming', useSharedValue<number>(0)); // BLINKING ANIMATION ON LOADING
//   // const _SSvgTiming = getSetSingleState('_SSvgTiming', useSharedValue<number>(0)); // "S" SVG PATH ANIMATION
//   // // NEW

//   // // LAYOUT VALUES
//   // const _entryWidth = getSetSingleState('_entryWidth', useSharedValue<number>(0));
//   // const _hubHeight = getSetSingleState('_hubHeight', useSharedValue<number>(0));
//   // const _hubWidth = getSetSingleState('_hubWidth', useSharedValue<number>(0));

//   // NEW
//   const _enteringTiming = useSharedValue(0); // ENTERING ANIMATION
//   const _exitingTiming = getSetSingleState('_exitingTiming', useSharedValue<number>(0)); // EXITING ANIMATION
//   console.log("LALALA", _exitingTiming.value);
//   // const _exitingTiming = useSharedValue(0); // EXITING ANIMATION

//   const _STiming = useSharedValue(0); // "S" ANIMATION
//   const _entryTiming = useSharedValue(0); // "entry" ANIMATION
//   const _hubTiming = useSharedValue(0); // "Hub" ANIMATION
//   const _blinkingTiming = useSharedValue(0); // BLINKING ANIMATION ON LOADING
//   const _SSvgTiming = useSharedValue(0); // "S" SVG PATH ANIMATION
//   // NEW

//   // LAYOUT VALUES
//   const _entryWidth = useSharedValue(0);
//   const _hubHeight = useSharedValue(0);
//   const _hubWidth = useSharedValue(0);

//   // Animate the progress value from 0 to 1 when the component mounts
//   var debug:
//     | null
//     | "quick"
//     | "loading"
//     | "text-s"
//     | "text-sentry"
//     | "text-hub"
//     | "text-full"
//     | "entering"
//     | "exiting" = null; // null = final code
//   useEffect(() => {
//     // if(getSingleState("animationStarted") == true) return;
//     // setSingleState("animationStarted", true);
//     console.log("LOADING SCREEN ANIMATION STARTS")
//     if(debug != null){
//       _exitingTiming.value = 0;
//       _blinkingTiming.value = 0;
//       _enteringTiming.value = 0;
//       _STiming.value = 0;
//       _SSvgTiming.value = 0;
//       _hubTiming.value = 0;
//       _entryTiming.value = 0;
//     }

//     // DEBUG
//     if (debug == "entering") {
//       _enteringTiming.value = withRepeat(
//         withTiming(1, { duration: 1000, easing: Easing.elastic(1) }),
//         -1,
//         true
//       );
//     } else if (debug == "exiting") {
//       _enteringTiming.value = 1;
//       _SSvgTiming.value = 0;
//       _STiming.value = 1;
//       _entryTiming.value = 1;
//       _hubTiming.value = 1;
//       _exitingTiming.value = withRepeat(
//         withTiming(0.75, { duration: 1000, easing: Easing.elastic(0) }),
//         -1,
//         true
//       );
//     } else if (debug == "loading") {
//       // _enteringTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.elastic(1) }), -1, true);
//       _enteringTiming.value = 1;
//       _SSvgTiming.value = withRepeat(
//         withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
//         -1,
//         true
//       );
//       // _STiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.cubic) }), -1, true);
//       // _hubTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.elastic(1) }), -1, true);
//       // _entryTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.elastic(1) }), -1, true);
//     } else if (debug == "text-full") {
//       _enteringTiming.value = 0.99;
//       _enteringTiming.value = withRepeat(
//         withTiming(
//           1,
//           { duration: 1000, easing: Easing.elastic(1) },
//           (finished) => {
//             if (!finished) return;
//             var nextValue =
//               _enteringTiming.value < 0.99 &&
//               _STiming.value == 0 &&
//               _entryTiming.value == 0 &&
//               _hubTiming.value == 0
//                 ? 1
//                 : _STiming.value == 1 &&
//                   _entryTiming.value == 1 &&
//                   _hubTiming.value == 1
//                 ? 0
//                 : null;
//             if (nextValue == null) return;
//             _STiming.value = withDelay(
//               150,
//               withTiming(nextValue, {
//                 duration: 800,
//                 easing: Easing.inOut(Easing.cubic),
//               })
//             );
//             _entryTiming.value = withDelay(
//               0,
//               withTiming(nextValue, {
//                 duration: 1000,
//                 easing: Easing.elastic(0),
//               })
//             );
//             _hubTiming.value = withDelay(
//               800,
//               withTiming(nextValue, {
//                 duration: 500,
//                 easing: Easing.elastic(1),
//               })
//             );
//           }
//         ),
//         -1,
//         true
//       );
//     } else if (debug == "text-s") {
//       _enteringTiming.value = 1;

//       _STiming.value = withRepeat(
//         withTiming(1, {
//           duration: 800,
//           easing: Easing.inOut(Easing.cubic),
//         }),
//         -1,
//         true
//       );
//     } else if (debug == "text-sentry") {
//       _enteringTiming.value = 1;

//       _STiming.value = withTiming(1, {
//         duration: 800,
//         easing: Easing.inOut(Easing.cubic),
//       });
//       _entryTiming.value = withDelay(
//         0,
//         withRepeat(
//           withTiming(
//             1,
//             { duration: 1000, easing: Easing.elastic(0) },
//             (finished) => {
//               if (!finished) return;
//               _STiming.value = withTiming(_STiming.value > 0.5 ? 0 : 1, {
//                 duration: 800,
//                 easing: Easing.inOut(Easing.cubic),
//               });
//             }
//           ),
//           -1,
//           true
//         )
//       );
//     } else if (debug == "text-hub") {
//       _enteringTiming.value = 1;
//       _STiming.value = 1;
//       _entryTiming.value = 1;
//       _hubTiming.value = withRepeat(
//         withTiming(1, { duration: 1000, easing: Easing.elastic(1) }),
//         -1,
//         true
//       );
//     } else if (debug == "quick") {
//       _enteringTiming.value = 1;
//       _SSvgTiming.value = 0;
//       _STiming.value = 1;
//       _entryTiming.value = 1;
//       _hubTiming.value = 1;
//       _exitingTiming.value = withTiming(1, {
//         duration: 1000,
//         easing: Easing.elastic(0),
//       });
//     } else {
//       // FINAL CODE
//       _enteringTiming.value = withTiming(
//         1,
//         { duration: 1000, easing: Easing.elastic(1) },
//         (finished) => {
//           if (!finished) return;
//           _SSvgTiming.value = withRepeat(
//             withTiming(1, {
//               duration: 1800,
//               easing: Easing.inOut(Easing.ease),
//             }),
//             4,
//             true,
//             (finished) => {
//               if (!finished) return;
//               _SSvgTiming.value = 0;
//               // _STiming.value = withDelay(50, withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) }));
//               // _entryTiming.value = withDelay(0, withTiming(1, { duration: 1000, easing: Easing.elastic(0) }));
//               // _hubTiming.value = withDelay(500, withTiming(1, { duration: 800, easing: Easing.elastic(0) }));
//               _STiming.value = withDelay(
//                 150,
//                 withTiming(1, {
//                   duration: 800,
//                   easing: Easing.inOut(Easing.cubic),
//                 })
//               );
//               _entryTiming.value = withDelay(
//                 0,
//                 withTiming(1, { duration: 1000, easing: Easing.elastic(0) })
//               );
//               _hubTiming.value = withDelay(
//                 800,
//                 withTiming(1, { duration: 500, easing: Easing.elastic(1) })
//               );
//               _exitingTiming.value = withDelay(
//                 800 + 1000,
//                 withTiming(1, { duration: 600, easing: Easing.elastic(0) }, (finished) => {
//                   if (!finished) return;
//                   // runOnJS(setSingleState)("_exitingTiming", 1);
//               })
//               );
//             }
//           );
//         }
//       );
//     }

//     // _enteringTiming.value = withTiming(1, { duration: 800 }, (finished) => {
//     //   //   if (finished) runOnJS(startAnimation)();
//     // });
//   }, []);

//   const startAnimation = () => {
//     _SSvgTiming.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true);
//     _blinkingTiming.value = withRepeat(
//       withTiming(1, { duration: 2500 }),
//       3,
//       true,
//       (finished) => {
//         if (finished) {
//           _SSvgTiming.value = 0;
//           _entryTiming.value = withTiming(1, { duration: 1000 }, (finished) => {
//             if (finished) {
//               _exitingTiming.value = withDelay(
//                 800,
//                 withTiming(1, { duration: 1000 })
//               );
//             }
//           });
//         }
//       }
//     );
//   };

//   const [strokeWidth, setStrokeWidth] = useState<number>();
//   const [strokeOpacity, setStrokeOpacity] = useState<number>();
//   const [strokeDashoffset, setStrokeDashoffset] = useState<number>();
//   const [rawOpacity, setRawOpacity] = useState<number>();

//   // useAnimatedReaction(
//   //   () => _SSvgTiming.value,
//   //   (currentValue, previousValue) => {
//   //     if(!currentValue || !previousValue) return;
//   //     const max = Math.max(currentValue, previousValue);
//   //     const min = Math.min(currentValue, previousValue);
//   //     if(max-min<0.01) return;
//   //     console.log("ANIMATE", max-min);
//   //     requestAnimationFrame(() => {
//   //       runOnJS(setStrokeWidth)(interpolate(currentValue, [0, 1], [0, 2]));
//   //       runOnJS(setStrokeOpacity)(
//   //         interpolate(currentValue, [0, 0.5, 1], [0, 1, 0])
//   //       );
//   //       runOnJS(setStrokeDashoffset)(lineSize - currentValue * lineSize);
//   //       runOnJS(setRawOpacity)(interpolate(currentValue, [0, 1], [1, 0.7]));
//   //     });
//   //   }
//   // );

//   // Create animated props for the Path element
//   const _SSvgProps = useAnimatedProps<Partial<AnimatedProps<PathProps>>>(() => {
//     return {
//       strokeWidth: interpolate(_SSvgTiming.value, [0, 1], [0, 2]),
//       strokeOpacity: interpolate(_SSvgTiming.value, [0, 0.5, 1], [0, 1, 0]),
//       strokeDashoffset: lineSize - _SSvgTiming.value * lineSize, // This can animate a stroke dash offset
//       opacity: interpolate(_SSvgTiming.value, [0, 1], [1, 0.7]),
//       //   transform: [{ scale: interpolate(_SSvgTiming.value, [0, 1], [1, 1.1]) }],
//     };
//   });

//   const _loadingProps = useAnimatedProps(() => {
//     const pointerEvents:
//       | "box-none"
//       | "none"
//       | "box-only"
//       | "auto"
//       | SharedValue<"box-none" | "none" | "box-only" | "auto" | undefined>
//       | undefined = _exitingTiming.value >= 1 ? "none" : "auto";
//     return {
//       // pointerEvents: _exitingTiming.value>=1?"none":"auto"
//       pointerEvents: pointerEvents,
//     };
//   });

//   const _loadingStyle = useAnimatedStyle(() => {
//     const opacity = interpolate(_exitingTiming.value, [0, 0.5, 1], [1, 1, 0]);
//     const scaleExiting = interpolate(_exitingTiming.value, [0, 1], [1, 180]);
//     return {
//       opacity: opacity,
//       transform: [{ scale: scaleExiting }],
//     };
//   });

//   const _containerStyle = useAnimatedStyle(() => {
//     const scaleEntering = interpolate(_enteringTiming.value, [0, 1], [0.85, 1]);
//     // const scaleEntering = 1;
//     // const scaleExiting = interpolate(_exitingTiming.value, [0, 1], [1, 180]);
//     const scaleExiting = 1;

//     const scale = interpolate(
//       _exitingTiming.value,
//       [0, 1],
//       [scaleEntering, scaleExiting]
//     );
//     const opacity = interpolate(_enteringTiming.value, [0, 1], [0.8, 1]);
//     return {
//       transform: [{ scale: scale }],
//       opacity: opacity,
//     };
//   });

//   const _SStyle = useAnimatedStyle(() => {
//     const rotateZ = interpolate(_STiming.value, [0, 1], [0, 90 * 3]);
//     // const svgScale = interpolate(_SSvgTiming.value, [0, 1], [1, 1.1]);
//     // const entryScale = interpolate(_entryTiming.value, [0, 1], [1, 0.8]);
//     const svgScale = interpolate(_SSvgTiming.value, [0, 1], [1, 1.1]);
//     const entryScale = interpolate(_entryTiming.value, [0, 1], [1, 0.8]);

//     const scale = interpolate(
//       _entryTiming.value,
//       [0, 1],
//       [svgScale, entryScale]
//     );
//     return {
//       transform: [{ rotateZ: `${rotateZ}deg` }, { scale: scale }],
//     };
//   });

//   const sentrySpacement = -6;
//   const hubSpacement = -80;

//   const _entryStyle = useAnimatedStyle(() => {
//     // APPLIED WHEN DISPLAY SENTRY
//     const sentryRight = -_entryWidth.value - sentrySpacement;
//     // =====
//     const right = interpolate(_entryTiming.value, [0, 1], [0, sentryRight]);
//     const opacity = interpolate(
//       _entryTiming.value,
//       [
//         0,
//         0.5, // THRESHOLD TO START FADE IN
//         1,
//       ],
//       [0, 0, 1]
//     );
//     return {
//       right: right, // APPLIED WHEN DISPLAY SENTRY
//       top: 0,
//       opacity: opacity,
//     };
//   });

//   const _sentryStyle = useAnimatedStyle(() => {
//     // const scaleEntering = interpolate(_enteringTiming.value, [0, 1], [0.8, 1]);
//     const scaleEntering = interpolate(_enteringTiming.value, [0, 1], [1, 1]);

//     // APPLIED WHEN DISPLAY SENTRY
//     const sentryMarginRight = _entryWidth.value + sentrySpacement;
//     // =====
//     const marginRight = interpolate(
//       _entryTiming.value,
//       [0, 1],
//       [0, sentryMarginRight]
//     );
//     const marginBottom = interpolate(
//       _hubTiming.value,
//       [0, 1],
//       [0, _hubHeight.value + hubSpacement]
//     );
//     const scale = scaleEntering;
//     return {
//       marginBottom: marginBottom,
//       marginRight: marginRight, // APPLIED WHEN DISPLAY SENTRY
//       transform: [{ scale: scale }],
//     };
//   });

//   const _hubStyle = useAnimatedStyle(() => {
//     // APPLIED WHEN DISPLAY SENTRY
//     const sentryTop = _hubHeight.value + hubSpacement;
//     // =====
//     const top = interpolate(_hubTiming.value, [0, 1], [0, sentryTop]);
//     const opacity = interpolate(
//       _hubTiming.value,
//       [
//         0,
//         0.5, // THRESHOLD TO START FADE IN
//         1,
//       ],
//       [0, 0, 1]
//     );

//     return {
//       // width: _hubWidth.value, // MANTAIN HUB WIDTH SO ABSOLUTE PARENT DONT CLIP IT
//       top: top,
//       opacity: opacity,
//     };
//   });

//   const pixelDensity = PixelRatio.get();
//   const [originalWidth, originalHeight] = [449, 302];
//   const width = originalWidth / pixelDensity;
//   const height = originalHeight / pixelDensity;

//   const entryLayout = (e: LayoutChangeEvent) => {
//     _entryWidth.value = e.nativeEvent.layout.width;
//   };

//   const hubLayout = (e: LayoutChangeEvent) => {
//     console.log("HUB LAYOUT", e.nativeEvent.layout);
//     _hubHeight.value = e.nativeEvent.layout.height;
//     _hubWidth.value = e.nativeEvent.layout.width;
//   };

//   return (
//     <Animated.View
//       sharedTransitionTag="loading-screen"
//       animatedProps={_loadingProps}
//       style={[styles.loadingScreen, _loadingStyle]}
//       //   entering={FadeIn}
//       //   exiting={FadeOut}
//       //   pointerEvents="none"
//     >
//       {/* <Animated.View
//             exiting={ZoomOut.withInitialValues({ transform: [{ scale: 1.2 }] })}
//           > */}
//       <Animated.View
//         style={[
//           styles.container,
//           { paddingBottom: NAV_BAR_HEIGHT },
//           _containerStyle,
//         ]}
//       >
//         <Animated.View style={[styles.sentry, _sentryStyle]}>
//           <Animated.View
//             style={[
//               styles.s,
//               {
//                 height: Math.min(height, width),
//                 width: Math.min(height, width),
//               },
//               _SStyle,
//             ]}
//           >
//             <Svg
//               width={width}
//               height={height}
//               viewBox={`0 0 ${originalWidth} ${originalHeight}`}
//               fill="none"
//             >
//               <AnimatedPath
//                 animatedProps={_SSvgProps}
//                 fill="#9f7fff"
//                 fillRule="evenodd"
//                 stroke="#FFFFFF"
//                 strokeLinecap="butt"
//                 strokeDasharray={lineSize}
//                 //   stroke="#ffffff66"
//                 d="M448.566 147.466C448.566 176.484 443.368 202.617 432.974 225.868C422.482 249.118 407.42 267.517 387.785 281.065C368.15 294.612 344.906 301.569 318.053 301.935L318.053 212.412C336.051 211.222 350.296 205.18 360.787 194.287C371.278 183.303 376.524 168.291 376.524 149.251C376.524 129.754 371.567 114.421 361.653 103.254C351.836 92.0863 338.987 86.5026 323.106 86.5026C310.112 86.5026 299.477 90.3014 291.2 97.8989C282.826 105.497 276.233 114.925 271.421 126.184C266.608 137.534 261.266 153.187 255.395 173.142C247.022 200.146 238.744 222.115 230.563 239.049C222.382 255.983 210.062 270.492 193.604 282.575C177.049 294.749 154.96 300.837 127.337 300.837C101.446 300.837 78.8756 294.658 59.6259 282.3C40.3762 269.943 25.6021 252.642 15.3035 230.399C5.10118 208.064 -5.21758e-06 182.571 -6.46996e-06 153.92C-8.34653e-06 110.989 10.9723 76.1131 32.917 49.2927C54.8616 22.3808 85.5167 7.55185 124.882 4.80573L124.882 96.6632C109.771 97.487 97.3072 103.574 87.4898 114.925C77.6725 126.275 72.7638 141.288 72.7638 159.961C72.7638 176.255 77.1431 189.299 85.9017 199.093C94.7566 208.796 107.509 213.648 124.16 213.648C135.903 213.648 145.672 209.986 153.468 202.663C161.168 195.249 167.424 186.095 172.237 175.202C177.049 164.218 182.583 148.794 188.839 128.93C197.213 101.835 205.587 79.7746 213.96 62.7487C222.334 45.6313 234.894 30.8938 251.641 18.5363C268.389 6.1788 290.333 5.22365e-05 317.475 5.105e-05C340.864 5.00277e-05 362.616 5.76688 382.732 17.3005C402.848 28.8342 418.873 45.7686 430.808 68.1036C442.646 90.3471 448.566 116.801 448.566 147.466Z"
//                 vectorEffect="non-scaling-stroke"
//               />
//               {/* <Path
//                 id={"loading-s-path"}
//                 testID={"loading-s-path"}
//                 key={"loading-s-path"}
//                 // animatedProps={_SSvgProps}

//                 strokeWidth={0}
//                 strokeOpacity={0}
//                 strokeDashoffset={0}
//                 opacity={1}

//                 fill="#9f7fff"
//                 fillRule="evenodd"
//                 //   stroke="#ffffff66"
//                 stroke="#FFFFFF"
//                 // strokeInternal="#FFFFFF"
//                 strokeLinecap="butt"
//                 strokeDasharray={lineSize}
//                 d="M448.566 147.466C448.566 176.484 443.368 202.617 432.974 225.868C422.482 249.118 407.42 267.517 387.785 281.065C368.15 294.612 344.906 301.569 318.053 301.935L318.053 212.412C336.051 211.222 350.296 205.18 360.787 194.287C371.278 183.303 376.524 168.291 376.524 149.251C376.524 129.754 371.567 114.421 361.653 103.254C351.836 92.0863 338.987 86.5026 323.106 86.5026C310.112 86.5026 299.477 90.3014 291.2 97.8989C282.826 105.497 276.233 114.925 271.421 126.184C266.608 137.534 261.266 153.187 255.395 173.142C247.022 200.146 238.744 222.115 230.563 239.049C222.382 255.983 210.062 270.492 193.604 282.575C177.049 294.749 154.96 300.837 127.337 300.837C101.446 300.837 78.8756 294.658 59.6259 282.3C40.3762 269.943 25.6021 252.642 15.3035 230.399C5.10118 208.064 -5.21758e-06 182.571 -6.46996e-06 153.92C-8.34653e-06 110.989 10.9723 76.1131 32.917 49.2927C54.8616 22.3808 85.5167 7.55185 124.882 4.80573L124.882 96.6632C109.771 97.487 97.3072 103.574 87.4898 114.925C77.6725 126.275 72.7638 141.288 72.7638 159.961C72.7638 176.255 77.1431 189.299 85.9017 199.093C94.7566 208.796 107.509 213.648 124.16 213.648C135.903 213.648 145.672 209.986 153.468 202.663C161.168 195.249 167.424 186.095 172.237 175.202C177.049 164.218 182.583 148.794 188.839 128.93C197.213 101.835 205.587 79.7746 213.96 62.7487C222.334 45.6313 234.894 30.8938 251.641 18.5363C268.389 6.1788 290.333 5.22365e-05 317.475 5.105e-05C340.864 5.00277e-05 362.616 5.76688 382.732 17.3005C402.848 28.8342 418.873 45.7686 430.808 68.1036C442.646 90.3471 448.566 116.801 448.566 147.466Z"
//                 vectorEffect="non-scaling-stroke"
//               /> */}
//             </Svg>
//           </Animated.View>
//           <Animated.Text
//             style={[styles.entry, _entryStyle]}
//             onLayout={entryLayout}
//           >
//             entry
//           </Animated.Text>
//         </Animated.View>
//         <Animated.View style={[styles.hub, _hubStyle]}>
//           <Text onLayout={hubLayout} style={[styles.hubText]}>
//             Hub
//           </Text>
//         </Animated.View>
//         {/* _hubStyle */}
//       </Animated.View>
//       {/* </Animated.View> */}
//     </Animated.View>
//   );
// });

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
