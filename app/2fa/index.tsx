import CustomProgress, { CustomProgressHandle } from '@/components/CustomProgress';
import ScreenView from '@/components/ScreenView';
import Text from '@/components/ui/Text';
import { useDimensions } from '@/contexts/DimensionsProvider';
import { useAlert } from '@/contexts/alert/AlertProvider';
import { OtpService } from '@/services/otpService';
import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, FlipInEasyX } from 'react-native-reanimated';

const TwoFactorAuth = memo(() => {

    // const { navbarOffset } = useDimensions();

    const AnimatedText = Animated.createAnimatedComponent(Text);
    const { setAlert } = useAlert();

    // Prevent screen capture
    // usePreventScreenCapture();

    // Copy token to clipboard
    const copyToClipboard = async () => {
        setAlert({
            direction: 'up',
            type: 'success',
            message: 'Código copiado para a área de transferência',
        })
        // if (token)
        //     await Clipboard.setStringAsync(token);
    };

    // OTP Service
    // TODO: maybe swith to useOtpService as hook?
    const otpService = new OtpService(
        "JBSWY3DPEHPK3PXP"
    );
    // Token state
    const [token, setToken] = useState<string | null>("");
    // Ref to custom progress component, allows to control progress and animation
    const progressHandle = useRef<CustomProgressHandle>(null);

    // Animation task to handle token refresh
    // useRef necessary to prevent component re-render
    const animationTaskId = useRef<number | null>(null);
    const animationTask = (callback: () => void, timeout: number) => {
        if (animationTaskId.current)
            cancelAnimationFrame(animationTaskId.current);

        const animationEnd = Date.now() + timeout;
        const tick = () => {
            if (Date.now() >= animationEnd) {
                if (animationTaskId.current)
                    cancelAnimationFrame(animationTaskId.current);
                callback();
                return;
            }
            animationTaskId.current = requestAnimationFrame(tick);
        };
        animationTaskId.current = requestAnimationFrame(tick);
    };

    // Token grabber function
    const tokenGrabber = () => {
        const token = otpService.generateAlphanumericOtp();
        const timeUsed = otpService.timeUsed();
        const timeRemaining = otpService.timeRemaining();
        setToken(token);
        progressHandle.current?.changeValue(timeUsed, 250);
        animationTask(() => {
            tokenGrabber();
        }, timeRemaining * 1000);
    };

    // On dismont cancel animation frame
    useEffect(() => {
        if (animationTaskId.current)
            cancelAnimationFrame(animationTaskId.current);
        tokenGrabber();

        return () => {
            if (animationTaskId.current)
                cancelAnimationFrame(animationTaskId.current);
        }
    }, []);

    const { navbarOffset, setNavbarOffset } = useDimensions();

    console.log("2FA RENDER");

    // return (
    //     <ScreenView>
    //         <View>
    //         </View>
    //     </ScreenView>
    // )
    return (
        <ScreenView>
            <View style={[styles.container, { marginBottom: 0 }]}>
                {/* <Text>{navbarOffset}</Text>
                <Button title="LALA" onPress={()=>{setNavbarOffset(500)}} /> */}
                {/* <Text style={styles.text}>Two Factor Authentication</Text> */}
                <View style={styles.progressContainer}>
                    <CustomProgress
                        keyRender={token}
                        ref={progressHandle}
                        maxValue={30}
                    >
                        <TouchableOpacity
                            style={styles.progressContent}
                            activeOpacity={0.7}
                            onPress={copyToClipboard}
                        >
                            <AnimatedText
                                font={"Medium"}
                                style={styles.codeText}
                                entering={
                                    FlipInEasyX
                                        .duration(250)
                                        .delay(250)
                                }
                                exiting={
                                    FadeOutDown
                                        .duration(250)
                                        .delay(0)
                                }
                            >
                                {token ? token : ""}
                            </AnimatedText>
                            <AnimatedText
                                font={"Italic"}
                                style={styles.copyText}
                                entering={
                                    FadeInUp
                                        .duration(250)
                                        .delay(250)
                                }
                                exiting={
                                    FadeOut
                                        .duration(250)
                                        .delay(0)
                                }
                            >
                                Toque para copiar
                            </AnimatedText>
                        </TouchableOpacity>
                    </CustomProgress>
                </View>
            </View>
        </ScreenView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressContainer: {

    },
    progressContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 360,
        // backgroundColor: 'red',
        overflow: 'hidden',
    },
    codeText: {
        color: 'white',
        fontSize: 45,
        letterSpacing: 15,
        // fontWeight: '400',
    },
    copyText: {
        color: '#d3d3d3',
        fontSize: 18,
    },
    text: {
        marginTop: 50,
        fontSize: 20,
        // fontWeight: 'bold',
        color: 'white'
    },
});

export default TwoFactorAuth;