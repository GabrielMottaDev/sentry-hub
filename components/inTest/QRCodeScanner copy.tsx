import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useSession } from '@/contexts/SessionProvider';

type QRCodeScannerProps = {

};

const QRCodeScanner = ({}: QRCodeScannerProps) => {

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { setSessionId } = useSession();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    console.log("QR_CODE_SCANNED", data);
    setScanned(true);
    // The QRCode data will be the authcode
    try {
      const response = await fetch('https://4b65-2804-13c-612-4f00-1d3a-fac2-e6b0-ccbc.ngrok-free.app/auth/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: 'test_api_key', auth_code: data }),
      });
      const result = await response.json();
      if (result.auth_result === 'success') {
        setSessionId(result.session.id);
        console.log("SUCCESS", result);
      } else {
        console.log("FAILED", result);
        alert('Authentication failed');
      }
    } catch (error) {
      alert('Error completing authentication');
      console.log(error);
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View> */}
      </CameraView>
      {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default QRCodeScanner;
