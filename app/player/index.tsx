import CustomLink from "@/components/navigation/CustomLink";
import PlayerHeadButton from "@/components/PlayerHeadButton";
import ScreenView from "@/components/ScreenView";
import Env from "@/constants/Env";
import { useNavBarAnimation } from "@/contexts/atoms";
import { useDimensions } from "@/contexts/DimensionsProvider";
import { useSession } from "@/contexts/SessionProvider";
import { Href, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dimensions,
  FlatList,
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  SharedTransition,
  SharedTransitionType,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlayerList() {
  const { sessionId, hasLogin: isLoggedIn, setSessionId } = useSession();

  const [playerList, setPlayerList] = useState<any[]>([{}]);

  const loadPlayerList = () => {
    const createFetchPromise = (uuid: string) => {
      return new Promise((resolve) => {
        fetch(`${Env.API_URL}/player`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `${sessionId}`,
          },
          body: JSON.stringify({
            api_key: `${Env.API_KEY}`,
            uuid: `${uuid}`,
          }),
        })
          .then((response) => response.json())
          .then((json) => {
            console.log("Response: ", json);
            json.textures = JSON.parse(json.textures);
            resolve(json);
          })
          .catch((error) => {
            console.error(error);
            resolve(null);
          });
      });
    }
    Promise.all([
      createFetchPromise("b81c59fe-10b3-4cc2-94b9-8fe514975b6b"),
      createFetchPromise("949ab1e7-7059-4d5a-87b9-b4a5a646d963"),
    ]).then((values) => {
      setPlayerList(values.filter((value) => value !== null));
    });
  };

  useEffect(() => {
    loadPlayerList();
  }, []);

  useEffect(() => {
    console.log(playerList);
  }, [playerList]);

  const insets = useSafeAreaInsets();

  const SCREEN_HEIGHT = Dimensions.get("screen").height; // device height
  const WINDOW_HEIGHT = Dimensions.get("window").height;
  const STATUS_BAR_HEIGHT = insets.top || StatusBar.currentHeight || 24;
  let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;

  const { setNavbarOffset, navbarOffset } = useDimensions();

  const totalHeight = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetY.value = event.contentOffset.y;
  });

  // const ITEM_SIZE2 = 64 + 15 + 15;

  const RAW_ITEM_SIZE = 64 + 15 * 2;
  const ITEM_SIZE = useSharedValue(RAW_ITEM_SIZE);

  const RenderItem = ({ item, index }: { item: any; index: number }) => {
    const itemRef = useRef<View>(null);

    const animatedItemStyle = useAnimatedStyle(() => {
      const amount = Math.ceil(totalHeight.value / ITEM_SIZE.value); // 7

      const scale = interpolate(
        offsetY.value,
        [
          ITEM_SIZE.value * (index - (amount + 1)),
          ITEM_SIZE.value * (index - (amount - 0.75)),
          ITEM_SIZE.value * (index + 0.25), // starts
          ITEM_SIZE.value * (index + 2), // ends
        ],
        [0.4, 1, 1, 0.4]
      );

      const opacity = interpolate(
        offsetY.value,
        [
          ITEM_SIZE.value * (index - 9),
          ITEM_SIZE.value * (index - 8.25),
          ITEM_SIZE.value * (index + 0.25), // starts
          ITEM_SIZE.value * (index + 1), // ends
        ],
        [0, 1, 1, 0]
      );

      return {
        transformOrigin: [
          "50%",
          offsetY.value < ITEM_SIZE.value * index ? "0%" : "100%",
          // "50%",
          0,
        ],
        transform: [{ scale }],
        opacity,
        height: ITEM_SIZE.value,
      };
    });

    return (
      <Animated.View style={[animatedItemStyle]} ref={itemRef}>
        <CustomLink
          href={`/player/${btoa(JSON.stringify(item))}` as Href<string>}
        >
          <PlayerHeadButton uuid={item.uuid} name={item.name} />
        </CustomLink>
      </Animated.View>
    );
  };

  const flatList = useAnimatedRef<FlatList>();

  const calcNextItem = () => {
    const listHeight = offsetY.value;
    const itemHeight = ITEM_SIZE.value;

    const remainder = listHeight % itemHeight;
    if (remainder === 0) {
      return listHeight;
    }

    return remainder < itemHeight / 2
      ? listHeight - remainder // Round down
      : listHeight + (itemHeight - remainder); // Round up
  };

  const scrollFit = () => {
    if (!flatList.current) {
      return;
    }
    flatList.current.scrollToOffset({ offset: calcNextItem(), animated: true });
  };

  const { setFinished } = useNavBarAnimation();

  const transition = SharedTransition.custom((values) => {
    "worklet";
    return {
      height: withSpring(values.targetHeight),
      width: withSpring(values.targetWidth),
    };
  })
    .progressAnimation((values, progress) => {
      "worklet";
      const getValue = (
        progress: number,
        target: number,
        current: number
      ): number => {
        return progress * (target - current) + current;
      };
      return {
        width: getValue(progress, values.targetWidth, values.currentWidth),
        height: getValue(progress, values.targetHeight, values.currentHeight),
      };
    })
    .defaultTransitionType(SharedTransitionType.ANIMATION);

  return (
    <ScreenView style={styles.screen}>
      <View>
        <Button
          color={"#ff4646"}
          title="Logout"
          onPress={() => {
            setSessionId(null);
            router.replace("/");
          }}
        />
      </View>
      
      <Animated.FlatList
        ref={flatList}
        style={{
          flexGrow: 0,
          height: "100%",
        }}
        initialNumToRender={21}
        maxToRenderPerBatch={21}
        windowSize={21}
        pagingEnabled={false}
        disableIntervalMomentum={false}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE.value,
          offset: ITEM_SIZE.value * index,
          index,
        })}
        onLayout={(event: LayoutChangeEvent) => {
          totalHeight.value = event.nativeEvent.layout.height;
        }}
        // keyExtractor={item => item.uuid+Crypto.randomUUID()}
        // To snap in place
        snapToAlignment="start"
        decelerationRate={"normal"}
        // snapToInterval={ITEM_SIZE.value}
        snapToStart={false}
        snapToEnd={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={scrollFit}
        // maxToRenderPerBatch={windowSize} windowSize={windowSize}
        data={(() => {
          if (!playerList || playerList.length <= 0) {
            return [];
          }

          let cloned = [...playerList];
          for (let i = 0; i < 50; i++) {
            cloned.push(playerList[0]);
            cloned.push(playerList[1]);
          }
          return cloned;
        })()}
        renderItem={({ item, index }) => {
          if (!item || !item.textures) {
            return <></>;
          }
          return <RenderItem item={item} index={index} />;
        }}
        extraData={[playerList]}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  screen: {},
  list: {},
});
