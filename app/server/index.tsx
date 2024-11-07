import CustomLink from "@/components/navigation/CustomLink";
import ScreenView from "@/components/ScreenView";
import Env from "@/constants/Env";
import { useNavBarAnimation } from "@/contexts/atoms";
import { useDimensions } from "@/contexts/DimensionsProvider";
import { useSession } from "@/contexts/SessionProvider";
import { Href } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
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

  const [serverList, setServerList] = useState<any[]>([{}]);

  const loadServerList = () => {
    // 10.0.2.2
    fetch(`${Env.API_URL}/server`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `${sessionId}`,
      },
      body: JSON.stringify({
        api_key: `${Env.API_KEY}`,
        uuid: "949ab1e7-7059-4d5a-87b9-b4a5a646d963",
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        json.textures = JSON.parse(json.textures);
        setServerList([json]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    // loadServerList();
  }, []);

  useEffect(() => {
    console.log(serverList);
  }, [serverList]);

  const insets = useSafeAreaInsets();

  const SCREEN_HEIGHT = Dimensions.get("screen").height; // device height
  const WINDOW_HEIGHT = Dimensions.get("window").height;
  const STATUS_BAR_HEIGHT = insets.top || StatusBar.currentHeight || 24;
  let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;

  const { setNavbarOffset, navbarOffset } = useDimensions();

  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    // console.log("SCROLL", event.contentOffset.y);
    offsetY.value = event.contentOffset.y;
  });

  // const ITEM_SIZE2 = 64 + 15 + 15;

  const RAW_ITEM_SIZE = 64 + 15 * 2;
  const ITEM_SIZE = useSharedValue(RAW_ITEM_SIZE);

  const RenderItem = ({ item, index }: { item: any; index: number }) => {
    const itemRef = useRef<View>(null);

    const animatedItemStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        offsetY.value,
        [
          -1,
          0,
          ITEM_SIZE.value * (index + 0.25), // starts
          ITEM_SIZE.value * (index + 2), // ends
        ],
        [1, 1, 1, 0]
      );

      const opacity = interpolate(
        offsetY.value,
        [
          -1,
          0,
          ITEM_SIZE.value * (index + 0.25), // starts
          ITEM_SIZE.value * (index + 1), // ends
        ],
        [1, 1, 1, 0]
      );

      return {
        transform: [{ scale }],
        opacity,
        height: ITEM_SIZE.value,
      };
    });

    return (
      <Animated.View style={[animatedItemStyle]} ref={itemRef}>
        <CustomLink
          href={`/server/${btoa(JSON.stringify(item))}` as Href<string>}
        >
          <Text>Server test item</Text>
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
            setFinished(false);
          }}
        />
      </View>
      <Animated.FlatList
        ref={flatList}
        style={{
          // backgroundColor: 'yellow',
          flexGrow: 0,
          height: "100%",
          // marginBottom: navbarOffset,
          // paddingBottom: navbarOffset,
        }}
        contentContainerStyle={
          {
            // backgroundColor: 'green',
            // marginBottom: navbarOffset,
            // paddingBottom: navbarOffset,
          }
        }
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
          if (!serverList || serverList.length <= 0) {
            return [];
          }

          let cloned = [...serverList];
          for (let i = 0; i < 50; i++) {
            cloned.push(serverList[0]);
          }
          return cloned;
        })()}
        renderItem={({ item, index }) => {
          if (!item || !item.textures) {
            return <></>;
          }
          return <RenderItem item={item} index={index} />;
        }}
        extraData={[serverList]}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  screen: {},
  list: {},
});
