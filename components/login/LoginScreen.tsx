import {
  Button,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCodeScanner, { QRCodeScannerHandle } from "../QRCodeScanner";
import ScreenView from "../ScreenView";
import { useSession } from "@/contexts/SessionProvider";
import { forwardRef, useEffect, useRef, useState } from "react";
import Env from "@/constants/Env";
import { BarcodeScanningResult } from "expo-camera";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  ReduceMotion,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { withBouncing } from "react-native-redash";
import QRCode, { QRCodeProps } from "react-native-qrcode-svg";
import QROverlay, { QROverlayHandle } from "../qr/QROverlay";
import { useDimensions } from "@/contexts/DimensionsProvider";

type LoginScreenProps = {};

const CAMERA_SIZE = 300;

const LoginScreen = ({}: LoginScreenProps) => {
  const { navbarOffset } = useDimensions();

  const qrScannerRef = useRef<QRCodeScannerHandle>(null);
  const qrOverlayRef = useRef<QROverlayHandle>(null);

  const { setSessionId, hasLogin: isLoggedIn } = useSession();
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleBarCode = async (data: string) => {
    try {
      const response = await fetch(`${Env.API_URL}/auth/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api_key: `${Env.API_KEY}`, auth_code: data }),
      });
      const result = await response.json();
      console.log("RESULT", result);
      if (result.auth_result === "success") {
        setErrorText(null);
        setSessionId(result.session.id);
        return false;
      } else if (result.auth_result === "invalid") {
        setErrorText("Error: Invalid QR Code");
        return true;
      } else if (result.auth_result === "expired") {
        setErrorText("Error: Expired QR Code");
        return true;
      } else {
        console.log(result);
        setErrorText("Try again");
        return true;
      }
    } catch (error) {
      // Request error
      // alert('Error completing authentication');
      console.log(error);
      setErrorText("Error: Connection problem");
      return true;
    }
  };

  const handleOnScan = async (barcode: BarcodeScanningResult) => {
    console.log("LoginScreen => handleOnScan");
    const data = barcode.data;
    return (await new Promise((resolve) => {
      // setTimeout(resolve, 1000)
      qrOverlayRef.current?.setBarcode(barcode, async () => {
        qrOverlayRef.current?.setLoading(true);
        // wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 4000));
        handleBarCode(data);
        qrOverlayRef.current?.setLoading(false);
        resolve(false);
      });
    })) as boolean;
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    qrOverlayRef.current?.setLayout(event);
  };

  const [debugCode, setDebugCode] = useState<string | null>(null);

  return (
    <ScreenView style={styles.container} nav={false}>
      <View style={styles.cameraContainer}>
        <View
          onLayout={handleLayout}
          // style={{ backgroundColor: 'blue' }}
        >
          <QRCodeScanner
            style={styles.camera}
            onScan={handleOnScan}
            ref={qrScannerRef}
          />
        </View>
        <Text style={styles.text}>Type /auth and point the camera</Text>
        <Text style={styles.errorText}>{errorText}</Text>
        {errorText && (
          <View style={{ width: 300, marginTop: 15 }}>
            <Button
              color={"#ff4646"}
              title="Scan Again"
              onPress={() => {
                setErrorText(null);
                qrOverlayRef.current?.reset();
                qrScannerRef.current?.enable();
              }}
            />
          </View>
        )}
      </View>
      <QROverlay ref={qrOverlayRef} />
      {Env.DEBUG && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            paddingBottom: navbarOffset + 20,
            flexDirection: "column",
          }}
        >
          <TextInput
            style={{
              backgroundColor: "white",
              padding: 8,
              marginBottom: 8,
              borderRadius: 8,
            }}
            onChangeText={(text) => {
              // Env.DEBUG_FORCE_LOGIN_QR = text;
              setDebugCode(text);
            }}
            defaultValue="AUTH_CODE (DEBUG PURPOSES)"
          />
          <Button
            title="DEBUG CONNECT"
            color={"green"}
            onPress={() => {
              //   setSessionId(debugCode);
              if (debugCode) {
                handleBarCode(debugCode);
              } else {
                setSessionId("123");
              }
            }}
          />
        </View>
      )}
    </ScreenView>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'black',
  },
  cameraContainer: {
    flexShrink: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  camera: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 10,
    overflow: "hidden",
  },
  text: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: "#ff7777",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },
});

export default LoginScreen;
