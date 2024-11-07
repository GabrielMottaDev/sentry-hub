import React, { useEffect, useState } from 'react';
import { View, Text as RNText, Button, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import DragSelector from './DragSelector';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './ui/Text';

type ConfirmationOptions = {
    disableBiometric?: boolean
}

type ConfirmationViewProps = {
    onConfirm?: () => void,
    options?: ConfirmationOptions
}

const ConfirmationView = ({
    onConfirm,
    options
}: ConfirmationViewProps) => {

    // When true, forces to use the drag selector instead of biometric authentication
    // const DEBUG_DISABLE_BIOMETRIC = true;

    const [hasAuthFailed, setHasAuthFailed] = useState<boolean>(false);
    const [authAvailable, setAuthAvailable] = useState<boolean | null>(null);

    const styles = createStyles();

    const verifyAvailableAuth = async () => {
        if (options?.disableBiometric) {
            return false;
        }
        // Determine whether a face or fingerprint scanner is available on the device.
        const compatible = await LocalAuthentication.hasHardwareAsync();
        // console.log("compatible", compatible);
        // Determine what kinds of authentications are available on the device.
        // Fingerprints = 1
        // Face ID = 2
        // Iris scanner = 3
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        // console.log("types", types);

        // Determine what kind of authentication is enrolled on the device.
        // None = 0 - No auth
        // Secret = 1 - Non biometric (PIN, password, pattern, etc.)
        // Biometric Week = 2 - Weak biometric auth (2D image-based face auth, etc.), IOS doesnt have weak option
        // Biometric Strong = 3 - Strong biometric auth (3D face auth, fingerprint auth, etc.)
        const security = await LocalAuthentication.getEnrolledLevelAsync();
        // console.log("security", security);

        // Determine if there is any biometric data enrolled/registered on the device.
        const hasAuthData = await LocalAuthentication.isEnrolledAsync();
        // console.log("hasAuthData", hasAuthData);
        return (
            compatible
            && (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) || types.includes(LocalAuthentication.AuthenticationType.IRIS))
            && ([LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG].includes(security))
            && hasAuthData
        )
    };

    const doAuth = async () => {
        setHasAuthFailed(false);

        const authResult = await LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to confirm action",
            cancelLabel: "Cancel",
            fallbackLabel: "Use passcode",
            disableDeviceFallback: true, // Disabled passcode fallback when authentication fails
            biometricsSecurityLevel: 'strong'
        });
        // console.log("authResult", authResult);


        if (authResult.success === true) {
            setHasAuthFailed(false);
            onConfirm?.();
            return true;
        } else {
            setHasAuthFailed(true);
            return false;
        }
    };

    useEffect(() => {
        (async () => {
            // Check if biometric authentication is available on the device
            const available = await verifyAvailableAuth();
            // console.log("available", available);
            setAuthAvailable(available);
            if (available) {
                // Starts component requesting biometric authentication
                doAuth();
            }
        })();
    }, []);

    const renderAuth = () => {

        // If the information about the device's biometric authentication is not available yet
        // return an empty component
        if (authAvailable === null) {
            return <></>;
        }

        // If the device have biometric authentication available
        if (authAvailable === true) {
            if (hasAuthFailed) {
                return <View>
                    <Text style={styles.modalText}>Authentication failed</Text>
                    <Button color={"#ff4646"} title="Retry" onPress={doAuth} />
                </View>
            }
            return <Text style={styles.modalText}>Please authenticate using fingerprint</Text>
        } else {
            return <View>
                <Text style={styles.modalText}>Slide to confirm</Text>
                <DragSelector
                    textOff={
                        <FontAwesome6 name="fingerprint" size={24} color="white" />
                    }
                    textOn={
                        <FontAwesome6 name="check" size={24} color="white" />
                    }
                    onSwitch={(switched) => {
                        if (switched === true) {
                            onConfirm?.();
                        }
                    }}
                />
            </View>
        }

    };

    return (
        <View>
            {renderAuth()}
        </View>
    );
};

const createStyles = () => {
    const insets = useSafeAreaInsets();

    const textShadow = {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    }

    return StyleSheet.create({
        modalText: {
            ...textShadow,
            marginBottom: 15,
            textAlign: 'center',
            color: 'white',
            fontSize: 15,
        },
    });
}

export default ConfirmationView;