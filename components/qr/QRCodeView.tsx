import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import QRCode, { QRCodeProps } from 'react-native-qrcode-svg';
import Animated from 'react-native-reanimated';

type QRCodeViewProps = QRCodeProps & {
  animatedProps?: Partial<QRCodeProps>;
  style?: Animated.AnimateStyle<ViewStyle>;
  size: number;
};

export type QRCodeViewHandle = {
  updateQRCode: (value: string|null) => void;
  updateSize: (size: number) => void;
};

// const AnimatedQRCode = Animated.createAnimatedComponent(QRCode);
function scaleNumber(value: number, base: number = 500) {
  return value / base;
}
const QRCodeView = forwardRef<QRCodeViewHandle, QRCodeViewProps>(
  ({ size, style, animatedProps, ...props }, ref) => {
    // const [size, setSize] = useState<number | 0>(0);
    const [qrCode, setQrCode] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      updateQRCode: (value: string|null) => {
        setQrCode(value);
      },
      updateSize: (size: number) => {
        // setSize(size);
      },
    }));

    return (
      <Animated.View style={[styles.parent, style]}>
        {qrCode && qrCode.length > 0 && (
          <QRCode
            value={qrCode}
            size={size}
            color="black"
            backgroundColor="white"
          />
        )}
      </Animated.View>
      // Uncomment the line below if you wish to use the AnimatedQRCode with animatedProps
      // return <AnimatedQRCode {...animatedProps} {...props} />;
    );
  }
);

const styles = StyleSheet.create({
  parent: {
    // width: '100%', // Defina a largura desejada do elemento pai
    // height: '100%', // Defina a altura desejada do elemento pai
    // backgroundColor: 'red',
    transform: [
      { scale: 1 }
    ],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // padding: 0.2
  },
});

export default QRCodeView;