import AnimatedModal from "@/components/AnimatedModal";
import ConfirmationView from "@/components/ConfirmationView";
import Panorama from "@/components/Panorama";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import ScreenView from "@/components/ScreenView";
import BustSide, { BustSideFunctions } from "@/components/skin/BustSide";
import Text from "@/components/ui/Text";
import { Jail, useSocket } from "@/contexts/SocketProvider";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateUUID } from "three/src/math/MathUtils";

function formatEpoch(epoch: number) {
  const date = new Date(epoch);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} | ${hours}:${minutes}`;
}

export default function TabScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { data } = useLocalSearchParams<{
    data: string[];
  }>();

  var playerDataRaw: string = "" + data[0];
  // console.log("Player Data: " + playerDataRaw);
  var playerData = JSON.parse(atob(playerDataRaw));

  const {
    is_staffer: PLAYER_IS_STAFFER,
    name: PLAYER_NAME,
    uuid: PLAYER_UUID,
    version: PLAYER_VERSION,
    client: PLAYER_CLIENT,
    skin_image: SKIN_IMAGE,
    cape_image: CAPE_IMAGE,
  } = playerData;

  const handleBustPress = ({ toggleAnimation }: BustSideFunctions) => {
    console.log("Bust Pressed");
    toggleAnimation("flip");
  };

  const styles = createStyles();
  const socket = useSocket();

  const [modalVisible, setModalVisible] = useState<
    null | "ban" | "mute" | "jail"
  >();

  const renderHeader = () => {
    return (
      <View style={styles.container}>
        <Panorama style={styles.panorama} />
        <View style={styles.profile}>
          <BustSide
            debug={false}
            skinImage={SKIN_IMAGE}
            capeImage={CAPE_IMAGE}
            onPress={handleBustPress}
          />
        </View>
        <View style={styles.infosContainer}>
          <View style={styles.infos}>
            <View style={styles.info}>
              <Text style={styles.infoKey}>Name: </Text>
              <View style={styles.infoValue}>
                {
                  // Staffer Icon
                  PLAYER_IS_STAFFER && (
                    <AntDesign
                      style={{ marginRight: 3 }}
                      name="Safety"
                      size={12}
                      color="#00ff00"
                    />
                  )
                }
                <Text style={styles.infoValueText}>{PLAYER_NAME}</Text>
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoKey}>Version: </Text>
              <Text style={styles.infoValue}>{PLAYER_VERSION}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoKey}>Client: </Text>
              <Text style={styles.infoValue}>{PLAYER_CLIENT}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoKey}>UUID: </Text>
              <Text style={styles.infoValue}>{PLAYER_UUID}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    const { unhandle } = socket.handle("jail", (data: Jail) => {
      console.log("Received jail:", data);
    });
    return () => {
      unhandle();
    };
  }, []);

  const backgroundColor = useThemeColor({}, "background");

  return (
    <ScreenView style={{ position: "relative" }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={renderHeader()}
      >
        <View
          style={{ padding: 20, rowGap: 20, backgroundColor: backgroundColor }}
        >
          <Button
            color={"#ff4646"}
            key={1}
            title="Ban"
            onPress={(onTouch) => {
              console.log("Ban");
              setModalVisible("ban");
            }}
          />
          <Button
            color={"#ff4646"}
            key={2}
            title="Mute"
            onPress={(onTouch) => {
              console.log("Mute");
              setModalVisible("mute");
            }}
          />
          <Button
            color={"#ff4646"}
            key={3}
            title="Jail"
            onPress={(onTouch) => {
              console.log("Jail");
              setModalVisible("jail");
            }}
          />
          {/* Hack: Adds padding to make the ScrollView scroll */}
          <Text style={{ color: "white", fontSize: 18 }}>
            Debug player info:
          </Text>
          <View style={styles.playerDataList}>
            {(() => {
              const renderData = (key: string, value: string) => {
                const keyFormatted = key.replaceAll("_", " ");
                const valueFormatted = key.includes("login")
                  ? formatEpoch(parseInt(value))
                  : key.includes("locale") ? value.replaceAll("_", "/").toUpperCase() : value;
                return (
                  <View key={key} style={styles.playerData}>
                    {/* <Text style={styles.playerDataKey}>{key.replace("_", "\n")}</Text> */}
                    <Text style={styles.playerDataKey}>{keyFormatted}</Text>
                    <Text style={styles.playerDataValue}>{valueFormatted}</Text>
                  </View>
                );
              };

              return Object.keys(playerData).map((item: any, index: number) => {
                if (
                  item.includes("cape") ||
                  item.includes("skin") ||
                  item.includes("textures")
                )
                  return null;
                if (item.includes("extra_data")) {
                  return null;
                  return Object.keys(JSON.parse(playerData[item])).map(
                    (extraItem: any, index2: number) => {
                      return renderData(
                        extraItem,
                        JSON.parse(playerData[item])[extraItem]
                      );
                      // <Text key={`${index}_${index2}`} style={styles.debugText}>{extraItem + ": " + JSON.parse(playerData[item])[extraItem]}</Text>
                    }
                  );
                }
                return renderData(item, playerData[item]);
                // <Text key={`${index}`} style={styles.debugText}>{item + ": " + JSON.stringify(playerData[item])}</Text>
              });
            })()}
          </View>
          <View style={{ paddingBottom: 1000 }}></View>
        </View>
      </ParallaxScrollView>

      <AnimatedModal
        visible={modalVisible != null}
        onClose={() => {
          setModalVisible(null);
        }}
        render={() => {
          return (
            <View style={{ flexDirection: "column" }}>
              <Text key={generateUUID()} style={styles.titleText}>
                Do you want to {modalVisible?.capitalize()} {PLAYER_NAME}?
              </Text>
              <ConfirmationView
                options={{
                  disableBiometric: modalVisible === "jail",
                }}
                onConfirm={() => {
                  if (modalVisible === "ban") {
                    socket.emit("ban", {
                      player: {
                        uuid: PLAYER_UUID,
                      },
                      motive: "Teste",
                    });
                  } else if (modalVisible === "jail") {
                    socket.emit("jail", {
                      player: {
                        uuid: PLAYER_UUID,
                      },
                    });
                  }
                  console.log("Confirmado");
                  setModalVisible(null);
                }}
              />
            </View>
          );
        }}
      />
    </ScreenView>
  );
}

const createStyles = () => {
  const insets = useSafeAreaInsets();

  const textShadow = {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  };

  const boxShadow = {
    // Shadow
    // shadowColor: "#000",
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 2,
  };
  // const boxShadow = {
  //     // Shadow
  //     // shadowColor: "#000",
  //     shadowColor: "#fff",
  //     shadowOffset: {
  //         width: 0,
  //         height: 3,
  //     },
  //     shadowOpacity: 0.29,
  //     shadowRadius: 4.65,
  //     elevation: 7,
  // }

  return StyleSheet.create({
    debugText: {
      color: "white",
      fontSize: 20,
    },
    // HEADER
    headerImage: {
      color: "#808080",
      bottom: -90,
      left: -35,
      position: "absolute",
    },
    container: {
      // position: 'relative',
      height: "100%",
    },
    panorama: {
      position: "absolute",
      zIndex: -1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      flex: 1,
      height: "100%",
      width: "100%",
    },
    profile: {
      marginTop: insets.top,
      position: "absolute",
      bottom: 0,
      left: 0,
      // backgroundColor: 'red'
    },
    infosContainer: {
      paddingTop: insets.top * 1,
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      maxWidth: "60%",
      // backgroundColor: '#ff00006a',
      backgroundColor: "#0000006a",
      // backgroundColor: 'transparent',
    },
    infos: {
      // paddingTop: insets.top*1,
      // marginTop: insets.top,
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      paddingVertical: 20,
      paddingRight: 15,
      paddingLeft: 15,
    },
    info: {
      flex: 0,
      flexDirection: "row",
      // justifyContent: 'center'
      // alignItems: 'center',
      // backgroundColor: 'green',
      // overflow: 'hidden'
    },
    infoKey: {
      color: "white",
      fontSize: 13,
      fontWeight: "bold",
      marginRight: 1,
    },
    infoValue: {
      color: "white",
      fontSize: 12,
      fontWeight: "normal",
      flexShrink: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    infoValueText: {
      color: "white",
      fontSize: 12,
      fontWeight: "normal",
      flexShrink: 1,
    },
    // ACTIONS BUTTONS
    actionButton: {
      color: "black",
      backgroundColor: "#ff4646",
    },
    // PLAYER_DATA
    playerDataList: {
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 25,
      // columnGap: 15,
      justifyContent: "space-between",
      // backgroundColor: '#fff',
    },
    playerData: {
      ...boxShadow,
      width: "45%",
      // backgroundColor: '#ffffff2b',
      // backgroundColor: 'black',
      // marginVertical: 5,
      flexDirection: "column",

      backgroundColor: "#ff4646",
    },
    playerDataKey: {
      ...textShadow,
      // width: '50%',
      backgroundColor: "#0000009e",
      flex: 2,
      // Text
      textTransform: "uppercase",
      textAlign: "center",
      color: "white",
      fontSize: 14,
      fontWeight: "bold",
    },
    playerDataValue: {
      ...textShadow,
      // width: '50%',
      // backgroundColor: 'blue',
      flex: 3,
      padding: 10,
      // Text
      fontSize: 15,
      color: "white",
    },
    // MODAL
    titleText: {
      ...textShadow,
      color: "white",
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: 15,
      fontSize: 16,
    },
  });
};
