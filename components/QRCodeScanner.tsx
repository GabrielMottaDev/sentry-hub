import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Button,
  Image,
  PixelRatio,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  Camera,
  BarcodeScanningResult,
} from "expo-camera";
import { useSession } from "@/contexts/SessionProvider";
import { Asset } from "expo-asset";
import { captureRef } from "react-native-view-shot";
import {
  AntDesign,
  EvilIcons,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import TestBlur from "./TestBlur";
import { boxShadows } from "@/utils/shadows";
import Env from "@/constants/Env";

type QRCodeScannerProps = {
  onScan?: (barcode: BarcodeScanningResult) => Promise<boolean>;
  style?: StyleProp<any>;
};

export type QRCodeScannerHandle = {
  enable: () => void;
};

const QRCodeScanner = forwardRef<QRCodeScannerHandle, QRCodeScannerProps>(
  ({ style, onScan }, ref) => {
    const { sessionId, setSessionId } = useSession();

    const refTimeout = useRef<NodeJS.Timeout | null>(null);
    const snapshot = useRef<View>(null);
    const imageRef = useRef<Image>(null);
    const cameraViewRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [printed, setPrinted] = useState<string | null>(null);

    const enable = async () => {
      setPrinted(null);
      setScanned(false);
    };

    const disable = async () => {};

    useImperativeHandle(ref, () => ({
      enable: enable,
    }));

    useEffect(() => {
      // enable();
      // console.log("ASD");
      // console.log(cameraViewRef.current)
    }, [cameraViewRef]);

    // useEffect(() => {
    //   if (Env.DEBUG && Env.DEBUG_FORCE_LOGIN_QR) {
    //     setScanned(true);
    //     setSessionId(Env.DEBUG_FORCE_LOGIN_QR);
    //   }
    // }, []);

    if (!permission) {
      // Camera permissions are still loading.
      return <View />;
    }

    if (!permission.granted) {
      // Camera permissions are not granted yet.
      return (
        <View>
          <View style={[styles.askPermContainer, styles.container, style]}>
            <MaterialCommunityIcons
              name="qrcode"
              size={300}
              color="white"
              style={{ backgroundColor: "transparent" }}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "#111111d5",
                paddingHorizontal: 10,
                paddingVertical: 15,
                justifyContent: "flex-end",
                alignItems: "stretch",
              }}
            >
              <View
                style={{
                  flexGrow: 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.message}>
                  We need your permission to use the camera
                </Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <Button
              color={"#ff4646"}
              onPress={requestPermission}
              title="Grant Permission"
            />
          </View>
        </View>
      );
    }

    const handleBarCodeScanned = async (barcode: BarcodeScanningResult) => {
      console.log("QRCodeScanner => handleBarCodeScanned");
      if (scanned) return;
      // console.log("QR_CODE_SCANNED", barcode.data, barcode.cornerPoints);

      // await muteAudio();
      setScanned(true);
      refTimeout.current && clearTimeout(refTimeout.current);
      refTimeout.current = setTimeout(() => {
        enable();
      }, 5*1000);
      await takePhoto(async () => {
        // setScanned(true);
        // await unmuteAudio();
        refTimeout.current && clearTimeout(refTimeout.current);
        if (onScan) {
          const tryAgain = await onScan?.(barcode);
          if (tryAgain) {
            // disable();
          }
        } else {
          // disable();
        }
      });
    };

    const takePhoto = async (callback?: () => void) => {
      const photo = await cameraViewRef.current
        ?.takePictureAsync({
          quality: 1,
          base64: false,
          exif: false,
          skipProcessing: true,
          // imageType: 'png',
          // fastMode: false,
        })
        .then((photo) => {
          console.log("photo", photo);
          setPrinted(photo!.uri);
        })
        .catch((error) => {
          console.log("ERROR", error);
          setPrinted(null);
        })
        .finally(() => {
          if (callback) callback();
        });
    };

    function toggleCameraFacing() {
      setFacing((current) => (current === "back" ? "front" : "back"));
    }

    return (
      <View style={[styles.container, style]}>
        {printed ? (
          <Image
            resizeMode="cover"
            style={styles.image}
            source={{ uri: printed }}
          />
        ) : (
          <CameraView
            animateShutter={false}
            ref={cameraViewRef}
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: [
                // "aztec",
                // "ean13",
                // "ean8",
                "qr",
                // "pdf417",
                // "upc_e",
                // "datamatrix",
                // "code39",
                // "code93",
                // "itf14",
                // "codabar",
                // "code128",
                // "upc_a",
              ],
            }}
            enableTorch={false} // Flashlight
            mode="picture"
            mute={true}
            zoom={0}
            onBarcodeScanned={/*scanned ? undefined :*/ handleBarCodeScanned}
            onCameraReady={() => console.log("Camera ready")}
            onMountError={(error) => console.log("Camera error", error)}
          ></CameraView>
        )}
        {/* {scanned &&
        <View>
          <Button color={"#ff4646"} title="Scan Again" onPress={() => enable()} />
        </View>} */}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  askPermContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    // backgroundColor: '#292929',
    backgroundColor: "#686868",
    ...boxShadows,
  },
  image: {
    flex: 1,
    backgroundColor: "white",
  },
  message: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    color: "white",
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});

export default QRCodeScanner;
