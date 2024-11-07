import React, { forwardRef } from "react";
import { StyleSheet, Text as RNText, View } from "react-native";
import Head from "./skin/Head";
import Text from "./ui/Text";

export type PlayerHeadButtonProps = {
  debug?: boolean;
  uuid: string;
  name: string;
};

const HEAD_PX = 50;

const PlayerHeadButton = forwardRef<View, PlayerHeadButtonProps>(
  (props, ref) => {
    const { uuid, name, debug } = props;

    return (
      <View style={styles.button} ref={ref}>
        <Head style={styles.head} uuid={uuid} headSize={64} overlay={true} />
        <Text font={"Regular"} style={styles.text}>{name}</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    // width: 350,
    // height: 80,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#00000075",
  },
  head: {},
  text: {
    marginLeft: 20,
    fontSize: 25,
    color: "white",
  },
});

export default PlayerHeadButton;
