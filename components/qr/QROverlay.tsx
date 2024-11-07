import { BarcodeScanningResult } from "expo-camera";
import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  LayoutChangeEvent,
  ViewProps,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  createWorkletRuntime,
  dispatchCommand,
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  runOnRuntime,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import QRCodeView, { QRCodeViewHandle } from "./QRCodeView";
import { QROverlayReading } from "./QROverlayReading";

// function scaleNumber(value: number, base: number = 500) {
//   return value / base;
// }

type Dimensions = {
  width: number;
  height: number;
  x: number;
  y: number;
};

function calculateDimensions(result: BarcodeScanningResult): Dimensions | null {
  const { cornerPoints, bounds, raw, type, data } = result;

  if (cornerPoints && cornerPoints.length === 4) {
    // Pega as coordenadas dos pontos
    const [topLeft, topRight, bottomRight, bottomLeft] = cornerPoints;

    // Calcula a largura e altura
    const width = Math.sqrt(
      Math.pow(topRight.x - topLeft.x, 2) + Math.pow(topRight.y - topLeft.y, 2)
    );

    const height = Math.sqrt(
      Math.pow(bottomLeft.x - topLeft.x, 2) +
        Math.pow(bottomLeft.y - topLeft.y, 2)
    );

    // Define x e y como a posição do ponto superior esquerdo
    const x = topLeft.x;
    const y = topLeft.y;

    return { width: height, height: width, x, y };
  }

  return null; // Retorna nulo se os pontos não estiverem disponíveis
}

interface QROverlayProps {}

export interface QROverlayHandle {
  reset: () => void;
  setBarcode: (barcode: BarcodeScanningResult, callback?: () => void) => void;
  setLayout: (event: LayoutChangeEvent) => void;
  setLoading: (loading: boolean) => void;
}

const QROverlay = memo(
  forwardRef<QROverlayHandle, QROverlayProps>((props, ref) => {
    // const animatedCodeViewRef = useRef<QRCodeViewHandle>(null);
    const qrCodeViewRef = useRef<QRCodeViewHandle>(null);

    const CAMERA_SIZE = 300;
    const IMAGE_DIV_FACTOR = 2;

    const animatedMaxSize = useSharedValue<number>(0);
    const animatedCode = useSharedValue<string | null>(null);
    const animatedOffsetLocation = useSharedValue({ x: 0, y: 0 });
    const animatedLocation = useSharedValue({
      x: CAMERA_SIZE / 2,
      y: CAMERA_SIZE / 2,
    });
    const animatedSize = useSharedValue({ width: 0, height: 0 });
    const animatedTimingMove = useSharedValue(0);
    const animatedTimingScale = useSharedValue(0.05);

    const [loading, setLoading] = useState(false); // loading state, to bar animation

    var test = false;
    useEffect(() => {
      // animatedTimingScale.value = 0.05;
      // animatedTimingScale.value = withRepeat(withTiming(1, { duration: 1250, easing: Easing.inOut(Easing.quad) }), -1, true);
      // animatedTimingScale.value = 1;
      // animatedTimingMove.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }), -1, true);
    }, []);
    const handleOnScan = async (
      barcode: BarcodeScanningResult,
      callback?: () => void,
      debug: boolean = false
    ) => {
      console.log("QROverlay => handleOnScan");

      const {
        height = 0,
        width = 0,
        x = 0,
        y = 0,
      } = calculateDimensions(barcode) || {};

      qrCodeViewRef.current?.updateQRCode(barcode.data);
      qrCodeViewRef.current?.updateSize(Math.max(height, width));
      animatedCode.value = barcode.data;
      animatedSize.value = {
        width: Math.max(height, width),
        height: Math.max(height, width),
      };
      animatedLocation.value = { x: x + width / 2, y: y + height / 2 };

      if (debug) {
        animatedTimingScale.value = withRepeat(
          withTiming(1, { duration: 1250, easing: Easing.inOut(Easing.quad) }),
          -1,
          true
        );
      } else {
        animatedTimingScale.value = withTiming(
          1,
          { duration: 600, easing: Easing.inOut(Easing.quad) },
          () => {
            if (callback) runOnJS(callback)();
          }
        );
      }
    };

    const minMaxWidth = useDerivedValue(() => {
      return [animatedSize.value.width, CAMERA_SIZE];
    });

    const minMaxHeight = useDerivedValue(() => {
      return [animatedSize.value.height, CAMERA_SIZE];
    });

    const animatedStyle = useAnimatedStyle(() => {
      // const baseTop = interpolate(animatedTimingScale.value, [0, 1], [((animatedOffsetLocation.value.y + animatedLocation.value.y)), animatedOffsetLocation.value.y]);
      // const baseLeft = interpolate(animatedTimingScale.value, [0, 1], [((animatedOffsetLocation.value.x + CAMERA_SIZE) - animatedLocation.value.x - animatedSize.value.width), animatedOffsetLocation.value.x]);
      // const baseWidth = interpolate(animatedTimingScale.value, [0, 1], [animatedSize.value.width, CAMERA_SIZE]);
      // const baseHeight = interpolate(animatedTimingScale.value, [0, 1], [animatedSize.value.height, CAMERA_SIZE]);

      var [minWidth, maxWidth] = minMaxWidth.value;
      const scaleWidth = interpolate(
        animatedTimingScale.value,
        [0, 1],
        [minWidth, maxWidth]
      );
      var [minHeight, maxHeight] = minMaxHeight.value;
      const scaleHeight = interpolate(
        animatedTimingScale.value,
        [0, 1],
        [minHeight, maxHeight]
      );

      var [minTop, maxTop] = [
        animatedOffsetLocation.value.y +
          animatedLocation.value.y -
          scaleHeight / 2,
        animatedOffsetLocation.value.y,
      ];
      var [minLeft, maxLeft] = [
        animatedOffsetLocation.value.x +
          CAMERA_SIZE -
          animatedLocation.value.x -
          scaleWidth / 2,
        animatedOffsetLocation.value.x,
      ];

      const test1 = interpolate(
        animatedTimingScale.value,
        [0, 0.8, 1],
        [minTop, minTop, maxTop]
      );
      const scaleTop = interpolate(
        animatedTimingScale.value,
        [0, 1],
        [minTop, test1]
      );
      const test2 = interpolate(
        animatedTimingScale.value,
        [0, 0.8, 1],
        [minLeft, minLeft, maxLeft]
      );
      const scaleLeft = interpolate(
        animatedTimingScale.value,
        [0, 1],
        [minLeft, test2]
      );

      animatedMaxSize.value = Math.max(scaleHeight, scaleWidth);

      return {
        zIndex: 2,
        position: "absolute",
        top: scaleTop,
        left: scaleLeft,
        width: scaleWidth,
        height: scaleHeight,
        backgroundColor: interpolateColor(
          animatedTimingScale.value,
          [0, 1],
          ["#ffffff1d", "#ffffff60"]
        ),
        opacity: interpolate(animatedTimingScale.value, [0, 1], [0, 0.7]),
        // opacity: interpolate(animatedTimingScale.value, [0, 1], [0, 1]),
        borderRadius: interpolate(animatedTimingScale.value, [0, 1], [0, 9]),
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      };
    });

    const animatedTransformScaleStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: interpolate(
              animatedMaxSize.value,
              [0, CAMERA_SIZE],
              [0, IMAGE_DIV_FACTOR]
            ),
          },
          // { scale: interpolate(animatedMaxSize.value, [0, CAMERA_SIZE], [0, IMAGE_DIV_FACTOR]) + (0.00005*IMAGE_DIV_FACTOR) }
        ],
        // borderRadius: 10 / IMAGE_DIV_FACTOR
      };
    });

    const animatedCodeProps = useAnimatedProps(() => ({
      value: animatedCode.value || "test",
    }));

    const handleLayout = (event: LayoutChangeEvent) => {
      event.currentTarget.measure((x, y, width, height, pageX, pageY) => {
        console.log(pageX, pageY);
        animatedOffsetLocation.value = { x: pageX, y: pageY };
      });
    };

    // Define uma função que queremos expor
    const reset = () => {
      console.log("Função reset foi chamada!");
      // animatedOffsetLocation.value = { x: 0, y: 0 };
      qrCodeViewRef.current?.updateQRCode(null);
      // qrCodeViewRef.current?.updateSize(Math.max(height, width));
      animatedCode.value = null;
      animatedMaxSize.value = 0;
      animatedLocation.value = { x: CAMERA_SIZE / 2, y: CAMERA_SIZE / 2 };
      animatedSize.value = { width: 0, height: 0 };
      animatedTimingMove.value = 0;
      animatedTimingScale.value = 0.05;
    };

    const handleLoading = (loading: boolean) => {
      setLoading(loading);
    };

    // Usa o useImperativeHandle para expor a função para o componente pai
    useImperativeHandle(ref, () => ({
      reset,
      setBarcode: handleOnScan,
      setLayout: handleLayout,
      setLoading: handleLoading,
    }));

    return (
      <Animated.View
        style={[animatedStyle, { position: "relative", overflow: "hidden" }]}
      >
        <QRCodeView
          ref={qrCodeViewRef}
          size={CAMERA_SIZE / IMAGE_DIV_FACTOR}
          style={animatedTransformScaleStyle}
        ></QRCodeView>
        {/* <View style={{
        position: 'absolute',
        backgroundColor: 'red',
        width: 5,
        height: 5,
        borderRadius: 360,
      }}></View> */}
        {loading && <QROverlayReading />}
      </Animated.View>
    );
  })
);

export default QROverlay;
