import { BlurView } from "expo-blur";
import React, { PropsWithChildren, useEffect } from "react";
import { BackHandler, Dimensions, Pressable, StatusBar, StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, interpolate, runOnJS, SlideInDown, SlideOutDown, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

type AnimatedModalProps = {
    visible?: boolean;
    onClose?: () => void;
    render?: () => React.ReactNode;
}

// const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// const insets = useSafeAreaInsets();
const SCREEN_HEIGHT = Dimensions.get('screen').height; // device height
const WINDOW_HEIGHT = Dimensions.get('window').height;
const STATUS_BAR_HEIGHT = /*insets.top || */StatusBar.currentHeight || 24;
let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;


export const HEIGHT = 225+NAV_BAR_HEIGHT;
export const OVERDRAG = 40;


// export const HEIGHT = 220;
// export const OVERDRAG = 20;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
// const SCREEN_HEIGHT = Dimensions.get('screen').height;

const AnimatedModal = ({
    children,
    visible,
    onClose,
    render
    // close
}: AnimatedModalProps & PropsWithChildren) => {

    // const insets = useSafeAreaInsets();
    // const SCREEN_HEIGHT = Dimensions.get('screen').height; // device height
    // const WINDOW_HEIGHT = Dimensions.get('window').height;
    // const STATUS_BAR_HEIGHT = insets.top || StatusBar.currentHeight || 24;
    // let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;

    // const [isOpen, setOpen] = useState(false);
    const handleClose = () => {
        // setOpen(false);
        onClose?.();
    }

    const offset = useSharedValue(0);
    const blur = useSharedValue(0);

    const pan = Gesture.Pan()
        .onChange((event) => {
            const offsetDelta = event.changeY + offset.value;

            const clamp = Math.max(-OVERDRAG, offsetDelta);
            offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp);
        })
        .onFinalize(() => {
            if (offset.value < HEIGHT / 4) {
                offset.value = withSpring(0);
            } else {
                offset.value = withTiming(HEIGHT, {}, () => {
                    //   runOnJS(toggleSheet)();
                    runOnJS(handleClose)();
                });
            }
        });

    const translateY = useAnimatedStyle(() => ({
        transform: [{ translateY: offset.value }],
    }));

    // Intercept native back button, close the modal if it's open
    useEffect(() => {
        const backAction = () => {
            if (visible) {
                handleClose();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [visible, handleClose]);

    const MAX_BLUR = 10;

    const animatedProps = useAnimatedProps(() => {
        return {
            // intensity: blur.value
            intensity: offset.value ? interpolate(offset.value, [-20, HEIGHT], [MAX_BLUR, 0]) : blur.value
            // intensity: 1,
        };
    }, [offset.value]);

    const animatedViewStyle = useAnimatedStyle(() => {
        return {
            opacity: 0.5
            // intensity: offset.value ? interpolate(offset.value, [-20, HEIGHT], [MAX_BLUR, 0]) : MAX_BLUR
            // intensity: 1,
        };
    }, [offset.value]);

    useEffect(() => {
        if(!visible) return;
        console.log("BLUR IN")
        offset.value = 0;
        blur.value = 0;
        blur.value = withTiming(MAX_BLUR, {duration: 2*1000 });
        // offset.value = withSpring(MAX_BLUR, {
        //     duration: 1500,
        //     dampingRatio: 0.5,
        //     stiffness: 100,
        //     overshootClamping: false,
        //     restDisplacementThreshold: 0.01,
        //     restSpeedThreshold: 2,
        //     reduceMotion: ReduceMotion.System,
        //   });
    }, [visible]);

    return (
        visible &&
        <AnimatedBlurView
            animatedProps={animatedProps}
            entering={
                FadeIn
                    .duration(500)
            }
            tint={"dark"} experimentalBlurMethod="dimezisBlurView" style={styles.container}>
            <GestureHandlerRootView >
                <AnimatedPressable
                    style={styles.backdrop}
                    entering={FadeIn}
                    exiting={FadeOut}
                    onPress={handleClose}
                />
                {/* <Pressable style={styles.backdrop} onPress={handleClose} /> */}
                <GestureDetector gesture={pan}>
                    <Animated.View
                        style={[styles.sheet, translateY]}
                        // animatedProps={animatedViewProps}
                        // s
                        entering={
                            SlideInDown // Slide bottom to top
                                .springify() // Spring
                                .damping(18) // How quickly the spring should stop
                                .stiffness(100) // How bouncy the spring should be, default 100
                                .overshootClamping(0) // 1 = Dont bounce over final position
                        }
                        exiting={SlideOutDown}
                    >
                        {children}
                        {render && render()}
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
        </AnimatedBlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: '#000000a2',
        // width: 50,
        height: SCREEN_HEIGHT,
        zIndex: 99999
    },
    sheet: {
        backgroundColor: "#ff2c2c5a",

        // backgroundColor: "#ffffff8d",
        // backgroundColor: "#ff2c2c5a",
        // backgroundColor: "white",
        padding: 16,
        height: HEIGHT,
        width: "100%",
        position: "absolute",
        // bottom: (-OVERDRAG * 1.1)+NAV_BAR_HEIGHT,
        bottom: (-OVERDRAG * 1.1),
        // bottom: 0,
        left: 0,
        right: 0,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        zIndex: 999,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        // backgroundColor: "green",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 1,
    },
});

export default AnimatedModal;
