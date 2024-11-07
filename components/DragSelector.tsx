import React, { ReactNode, useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedReaction,
  ReduceMotion,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const SLIDER_WIDTH = 300;
const SLIDER_HEIGHT = 60;
const BOX_WIDTH = 150;

export type DragSelectorProps = {
  textOff?: ReactNode | string,
  textOn?: ReactNode | string,
  onSwitch?: (newState: boolean) => void
}

const DragSelector = (props: DragSelectorProps) => {

  const lastInteractionTime = useSharedValue<number>(Date.now()); // Date.now();
  const AFK_TIME_TO_HINT = 5 * 1000;
  const animatingHint = useSharedValue<boolean>(false);

  // Scale size of the box when dragging
  const boxScaleSize = useSharedValue(1);
  // const boxTranslate

  const prevTranslateX = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isEnabled = useSharedValue(false);
  const [enabled, setEnabled] = useState(false);
  const [willBeOn, setWillBeOn] = useState<boolean>(false);

  const toggle = (newState: boolean) => {
    if (enabled === newState) {
      return;
    }
    setEnabled(newState);
    props.onSwitch?.(newState);
  }

  function divideRange(min: number, max: number, n: number) {
    const step = (max - min) / n;
    const points = [];

    for (let i = 0; i <= n; i++) {
      points.push(min + i * step);
    }

    return points;
  }

  const findClosestPoint = (x: number, points: number[]) => {
    'worklet';
    let closestPoint = points[0];
    let minDistance = Math.abs(x - closestPoint);

    for (let i = 1; i < points.length; i++) {
      const distance = Math.abs(x - points[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = points[i];
      }
    }

    let isStartPoint = closestPoint === points[0];
    let isEndPoint = closestPoint === points[points.length - 1];

    return { isEndPoint, isStartPoint, closestPoint, distance: minDistance };
  }

  const vibrationPoints = divideRange(0, (SLIDER_WIDTH - BOX_WIDTH), 5);

  useAnimatedReaction(
    () => translateX.value,
    (currentValue, previousValue) => {
      if (currentValue === previousValue)
        return;
      if (!willBeOn && currentValue > ((SLIDER_WIDTH - BOX_WIDTH) / 2)) {
        runOnJS(setWillBeOn)(true);
      } else if (willBeOn && currentValue < ((SLIDER_WIDTH - BOX_WIDTH) / 2)) {
        runOnJS(setWillBeOn)(false);
      }
    }
  );

  const gestureHandler = Gesture.Pan()
    .onStart((event) => {
      // console.log("TESTE");
      // translateX.value = 500;
    })
    .onBegin((event) => {
      if (animatingHint.value == true) {
        return;
      }
      lastInteractionTime.value = Date.now();

      // console.log("TESTE");
      prevTranslateX.value = translateX.value;
      boxScaleSize.value = withSpring(1.25, {
        mass: 0.5, // | 1
        damping: 10, // Higher damping means the spring will come to rest faster. | 10
        stiffness: 100, // bouncy | 100
        // dampingRatio: 1,
        overshootClamping: true, // dont extrapolate to value
      });
      runOnJS(Haptics.impactAsync)();
    })
    .onChange((event) => {
      if (animatingHint.value == true) {
        return;
      }
      lastInteractionTime.value = Date.now();

      const newTranslateX = Math.min(
        Math.max(prevTranslateX.value + event.translationX, 0),
        SLIDER_WIDTH - BOX_WIDTH
      );

      const { closestPoint, distance, isStartPoint, isEndPoint } = findClosestPoint(newTranslateX, vibrationPoints);

      if (distance < 1 && Math.abs(newTranslateX - translateX.value) > 0.5) {
        if (isStartPoint) {
          runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        } else if (isEndPoint) {
          runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Warning);
        } else {
          runOnJS(Haptics.selectionAsync)();
        }
      }

      translateX.value = newTranslateX;

      if (translateX.value > ((SLIDER_WIDTH - BOX_WIDTH) / 2)) {

      } else {

      }
    })
    .onFinalize(() => {
      if (animatingHint.value == true) {
        return;
      }
      lastInteractionTime.value = Date.now();

      boxScaleSize.value = withSpring(1, {
        mass: 0.5, // | 1
        damping: 10, // Higher damping means the spring will come to rest faster. | 10
        stiffness: 100, // bouncy | 100
        // dampingRatio: 1,
        overshootClamping: true, // dont extrapolate to value
      });
      runOnJS(Haptics.impactAsync)();

      if (translateX.value > ((SLIDER_WIDTH - BOX_WIDTH) / 2)) {
        // Snap to the right (ON)
        runOnJS(Haptics.selectionAsync)();

        translateX.value = withSpring(SLIDER_WIDTH - BOX_WIDTH, {
          duration: 500
        });
        // translateX.value = SLIDER_WIDTH - BOX_WIDTH;
        isEnabled.value = true;
        // setTest(true);
        runOnJS(setWillBeOn)(true);
        runOnJS(toggle)(true);
      } else {
        // Snap to the left (OFF)
        runOnJS(Haptics.selectionAsync)();

        translateX.value = withSpring(0, {
          duration: 500
        });
        // translateX.value = 0;
        isEnabled.value = false;
        runOnJS(setWillBeOn)(false);
        runOnJS(toggle)(false);
      }
    });


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: boxScaleSize.value }
      ],
      backgroundColor:
        !isEnabled.value && translateX.value > ((SLIDER_WIDTH - BOX_WIDTH) / 2)
          ? '#4CAF50'
          : isEnabled.value && translateX.value < ((SLIDER_WIDTH - BOX_WIDTH) / 2)
            ? '#F44336'
            : isEnabled.value
              ? '#4CAF50'
              : '#F44336'
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    };
  });



  const animateHint = (callback?: () => void) => {
    boxScaleSize.value = withRepeat(
      withSpring(1.15, {
        mass: 8,
        stiffness: 100
      }), 5, true, () => {
        translateX.value = withRepeat(
          withSequence(
            withSpring(((SLIDER_WIDTH - BOX_WIDTH)), {
              mass: 0.25,
              damping: 5,
              stiffness: 100
            }),
            withSpring(0, {
              mass: 0.25,
              damping: 5,
              stiffness: 100
            }),
          ), 1, true, () => {
            boxScaleSize.value = withSpring(1, {
              mass: 2,
              stiffness: 100
            }, () => {
              if(callback){
                runOnJS(callback)();
              }
            });
          }
        );
      }
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if(animatingHint.value == true){
        return;
      }
      const now = Date.now();

      if (
        translateX.value === 0
        && now - lastInteractionTime.value > AFK_TIME_TO_HINT
      ) {
        animatingHint.value = true;
        animateHint(() => {
          animatingHint.value = false;
          lastInteractionTime.value = Date.now();
        });
      }
      // lastInteractionTime.value = now;
    }, 500);
    return () => clearInterval(interval);
  }, []);




  return (
    <GestureHandlerRootView style={styles.container}>
      {/* <View style={styles.test}>

      </View> */}
      <View style={styles.slider}>
        <GestureDetector gesture={gestureHandler}>
          <Animated.View style={[styles.box, animatedStyle]}>
            <Animated.Text style={textStyle} >
              {
                willBeOn
                  ? props.textOn
                  : props.textOff
              }
            </Animated.Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',

  },
  slider: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: '#ddd',
    borderRadius: 30,
    overflow: 'hidden',
    transform: [
      { translateY: 0 }
    ],

    // Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  box: {
    width: BOX_WIDTH,
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,

    // Shadow
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DragSelector;
