import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const TestBlur: React.FC = () => {
  const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/eqMr3YAAAAASUVORK5CYII=';

  return (
    <Image
        source={{ uri: transparentPixel }}
        style={styles.image}
      />
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
    // width: '100%',
    // height: '100%',
    // backgroundColor: 'red',
  },
});

export default TestBlur;