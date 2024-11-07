import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import QRCodeScanner from "../QRCodeScanner";
import ScreenView from "../ScreenView";
import { useSession } from "@/contexts/SessionProvider";
import { forwardRef, useEffect, useState } from "react";
import Env from "@/constants/Env";
import { BarcodeScanningResult } from "expo-camera";
import Animated, { Easing, interpolate, interpolateColor, ReduceMotion, runOnJS, useAnimatedProps, useAnimatedReaction, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { withBouncing } from "react-native-redash";
import QRCode, { QRCodeProps } from "react-native-qrcode-svg";

type Dimensions = {
    width: number;
    height: number;
    x: number;
    y: number;
};

function calculateDimensions(result: BarcodeScanningResult): Dimensions | null {
    const { cornerPoints, bounds, raw, type, data } = result;

    // console.log("BOUNDS", bounds);

    // return {
    //     width: bounds.size.width,
    //     height: bounds.size.height,
    //     x: bounds.origin.x,
    //     y: bounds.origin.y
    // }

    if (cornerPoints && cornerPoints.length === 4) {
        // Pega as coordenadas dos pontos
        const [topLeft, topRight, bottomRight, bottomLeft] = cornerPoints;

        // Calcula a largura e altura
        const width = Math.sqrt(
            Math.pow(topRight.x - topLeft.x, 2) + Math.pow(topRight.y - topLeft.y, 2)
        );

        const height = Math.sqrt(
            Math.pow(bottomLeft.x - topLeft.x, 2) + Math.pow(bottomLeft.y - topLeft.y, 2)
        );

        // Define x e y como a posição do ponto superior esquerdo
        const x = topLeft.x;
        const y = topLeft.y;

        return { width: height, height: width, x, y };
    }

    return null; // Retorna nulo se os pontos não estiverem disponíveis
}

type LoginScreenProps = {
};

const CAMERA_SIZE = 300;

const LoginScreen = ({ }: LoginScreenProps) => {

    const AnimatedMaterialCommunityIcons = Animated.createAnimatedComponent(MaterialCommunityIcons);
    const AnimatedQRCode = Animated.createAnimatedComponent(QRCode);

    const animatedCode = useSharedValue<string | null>(null);
    const animatedOffsetLocation = useSharedValue({ x: 0, y: 0 });
    const animatedLocation = useSharedValue({ x: CAMERA_SIZE / 2, y: CAMERA_SIZE / 2 });
    const animatedSize = useSharedValue({ width: 0, height: 0 });
    const animatedTimingMove = useSharedValue(0);
    const animatedTimingScale = useSharedValue(0);

    const { setSessionId, hasLogin: isLoggedIn } = useSession();
    const [errorText, setErrorText] = useState<string | null>(null);

    var test = false;
    useEffect(() => {
        animatedTimingScale.value = 0.05;
        animatedTimingScale.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }), -1, true);
        // animatedTimingMove.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }), -1, true);

    }, []);
    const handleOnScan = async (barcode: BarcodeScanningResult) => {
        // console.log("RESULTADO: ", barcode.data, barcode.bounds);
        // setSessionId(data);

        const { height = 0, width = 0, x = 0, y = 0 } = calculateDimensions(barcode) || {};

        console.log("BARCODE_DATA", barcode.data);
        animatedCode.value = barcode.data;
        animatedSize.value = {
            width: Math.max(height, width),
            height: Math.max(height, width)
        };
        animatedLocation.value = { x: x + (width / 2), y: y + (height / 2) };
        // console.log(animatedLocation.value.x, animatedLocation.value.y);
        // animatedTimingScale.value = withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.quad) }, () => {
        //     // animatedTimingMove.value = withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.quad) });
        // });
        // animatedTimingScale.value = 0.5;
        if (!test) {
            test = true;
        }


        // animatedTimingScale.value = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }, () => {
        // });
        // animatedTimingMove.value = withSpring(1, {
        //     duration: 1250,
        //     dampingRatio: 0.5,
        //     stiffness: 100,
        //     overshootClamping: false,
        //     restDisplacementThreshold: 0.01,
        //     restSpeedThreshold: 2,
        //     reduceMotion: ReduceMotion.Never,
        // })
        // animatedTiming.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),-1,true);
        // animatedTiming.value = withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) });
        // animatedTiming.value = withSequence(
        //     withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        //     withSpring(1, {
        //         duration: 1250,
        //         dampingRatio: 0.5,
        //         stiffness: 100,
        //         overshootClamping: false,
        //         restDisplacementThreshold: 0.01,
        //         restSpeedThreshold: 2,
        //         reduceMotion: ReduceMotion.Never,
        //     })
        // );
        if (true) {
            return false;
        }

        /////

        const data = barcode.data;
        try {
            const response = await fetch(`${Env.API_URL}/auth/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ api_key: `${Env.API_KEY}`, auth_code: data }),
            });
            // console.log("RESPONSE", response);
            const result = await response.json();
            console.log("RESULT", result);
            if (result.auth_result === 'success') {
                setErrorText(null);
                setSessionId(result.session.id);
                return false;
            } else if (result.auth_result === 'invalid') {
                setErrorText('Error: Invalid QR Code');
                return true;
            } else if (result.auth_result === 'expired') {
                setErrorText('Error: Expired QR Code');
                return true;
            } else {
                console.log(result);
                setErrorText('Try again');
                return true;
            }
        } catch (error) {
            // Request error
            // alert('Error completing authentication');
            console.log(error);
            setErrorText('Error: Connection problem');
            return true;
        }
    };

    useEffect(() => {
        if (Env.DEBUG && Env.DEBUG_FORCE_LOGIN_QR) {
            // handleOnScan(Env.DEBUG_FORCE_LOGIN_QR);
            // setSessionId(Env.DEBUG_FORCE_LOGIN_QR);
        }
    }, []);

    const animatedStyle = useAnimatedStyle(() => {

        // const baseTop = interpolate(animatedTimingScale.value, [0, 1], [((animatedOffsetLocation.value.y + animatedLocation.value.y)), animatedOffsetLocation.value.y]);
        // const baseLeft = interpolate(animatedTimingScale.value, [0, 1], [((animatedOffsetLocation.value.x + CAMERA_SIZE) - animatedLocation.value.x - animatedSize.value.width), animatedOffsetLocation.value.x]);
        // const baseWidth = interpolate(animatedTimingScale.value, [0, 1], [animatedSize.value.width, CAMERA_SIZE]);
        // const baseHeight = interpolate(animatedTimingScale.value, [0, 1], [animatedSize.value.height, CAMERA_SIZE]);

        var [minWidth, maxWidth] = [animatedSize.value.width, CAMERA_SIZE];
        const scaleWidth = interpolate(animatedTimingScale.value, [0, 1], [minWidth, maxWidth]);
        var [minHeight, maxHeight] = [animatedSize.value.height, CAMERA_SIZE];
        const scaleHeight = interpolate(animatedTimingScale.value, [0, 1], [minHeight, maxHeight]);


        var [minTop, maxTop] = [((animatedOffsetLocation.value.y + animatedLocation.value.y) - (scaleHeight / 2)), animatedOffsetLocation.value.y];
        var [minLeft, maxLeft] = [((animatedOffsetLocation.value.x + CAMERA_SIZE) - animatedLocation.value.x - (scaleWidth / 2)), animatedOffsetLocation.value.x];

        const test1 = interpolate(animatedTimingScale.value, [0, 0.8, 1], [minTop, minTop, maxTop]);
        const scaleTop = interpolate(animatedTimingScale.value, [0, 1], [minTop,
            test1
        ]);
        const test2 = interpolate(animatedTimingScale.value, [0, 0.8, 1], [minLeft, minLeft, maxLeft]);
        const scaleLeft = interpolate(animatedTimingScale.value, [0, 1], [minLeft,
            test2
        ]);

        return {
            zIndex: 2,
            position: 'absolute',
            // top: animatedLocation.value.y + animatedOffsetLocation.value.y,
            top: scaleTop,
            left: scaleLeft,
            width: scaleWidth,
            height: scaleHeight,
            // backgroundColor: interpolateColor(animatedTiming.value, [0, 1], ['transparent', '#686868']),
            backgroundColor: interpolateColor(animatedTimingScale.value, [0, 1], ['#ffffff1d', '#ffffff60']),
            // opacity: animatedTiming.value,
            borderRadius: 10,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
        }
    });

    const animatedCodeProps = useAnimatedProps(() => ({
        value: animatedCode.value||"test",
    }));

    // const animatedProps = useAnimatedProps(() => {
    //     return {
    //         size: interpolate(animatedTiming.value, [0,1], [Math.max(animatedSize.value.height,animatedSize.value.width), CAMERA_SIZE]),
    //     }
    // });
    // const animatedTransform = useAnimatedStyle(() => {
    //     return {
    //         // transform: [
    //         //     {  scale : interpolate(animatedTiming.value, [0,1], [0.1, 1]) }
    //         // ]
    //         fontSize: interpolate(animatedTimingScale.value, [0, 1], [1, CAMERA_SIZE])
    //     }
    // });

    const handleLayout = (event: LayoutChangeEvent) => {
        event.currentTarget.measure((x, y, width, height, pageX, pageY) => {
            animatedOffsetLocation.value = { x: pageX, y: pageY };
        });
        // const { width, height, x, y } = event.nativeEvent.layout;
        // animatedOffsetLocation.value = { x: x, y: y };
        // console.log("X", event.nativeEvent.layout)
    };

    // const [iconScale, setIconScale] = useState(0);

    // useAnimatedReaction(
    //     () => animatedTimingScale.value,
    //     (currentScale) => {
    //         runOnJS(setIconScale)(currentScale);
    //     }
    // );

    return (
        <ScreenView style={styles.container} nav={false}>
            <View style={styles.cameraContainer}>
                <View
                    onLayout={handleLayout}
                    style={{ backgroundColor: 'blue' }}
                >
                    <QRCodeScanner style={styles.camera} onScan={handleOnScan} />
                </View>
                <Text style={styles.text}>Type /auth and point the camera</Text>
                <Text style={styles.errorText}>{errorText}</Text>
            </View>
            <Animated.View style={[animatedStyle, { position: 'relative' }]}>
                {/* <Animated.Text style={[animatedTransform]}> */}
                {/* <MaterialCommunityIcons name="qrcode" color="white" size={CAMERA_SIZE} style={[{ backgroundColor: 'transparent' }]} /> */}
                {/* </Animated.Text> */}
                <AnimatedQRCode
                    animatedProps={animatedCodeProps}
                    size={200}
                    color="black"
                    backgroundColor="white"
                />
                <View style={{
                    position: 'absolute',
                    backgroundColor: 'red',
                    width: 5,
                    height: 5,
                    borderRadius: 360,
                }}></View>
            </Animated.View>
        </ScreenView>
    );

};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: 'black',
    },
    cameraContainer: {
        flexShrink: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100
    },
    camera: {
        width: CAMERA_SIZE,
        height: CAMERA_SIZE,
        borderRadius: 10,
        overflow: 'hidden',
    },
    text: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
        marginTop: 20
    },
    errorText: {
        color: '#ff7777',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10
    }
});

export default LoginScreen;