import LoadingDots from "@/components/loading/LoadingDots";
import LoginScreen from "@/components/login/LoginScreen";
import ScreenView from "@/components/ScreenView";
import Env from "@/constants/Env";
import { useDimensions } from "@/contexts/DimensionsProvider";
import { getSessionId, useSession } from "@/contexts/SessionProvider";
import { SocketClass, useSocket } from "@/contexts/SocketProvider";
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { io } from "socket.io-client";

export default function HomeScreen() {
  const { hasLogin, setSessionId, sessionId } = useSession();
  const { setSocket, handle, onConnect, onConnectError } = useSocket();
  const { navbarOffset } = useDimensions();

  const animatedTimer = useSharedValue(1);
  const socketInstanceRef = useRef(new SocketClass());

  useEffect(() => {
    (async () => {
      const sessionId = await getSessionId();
      const socket = io(`${Env.API_URL}`, {
        auth: {
          api_key: `${Env.API_KEY}`,
          session_id: `${sessionId}`,
        },
        // transports: ['websocket'],  // Certifique-se de forçar o uso do WebSocket se necessário
        secure: Env.API_URL?.includes("https"),
        reconnection: true,
        timeout: 3000,
      });
      socket.on("connect", () => {
        console.log("index.tsx => SOCKET CONNECTED");
      });
      socket.on("connect_error", (e) => {
        console.log("index.tsx => SOCKET ERROR", e);
      });
      // socketInstanceRef.current.setSocket(socket);
      setSocket(socket);
    })();
  }, [sessionId]);

  useEffect(() => {
    console.log("USE EFFECT REGISTER FINAL SOCKET CALLBACK");
    const { unhandle } = handle("connect", () => {
      console.log("index.tsx => SOCKET CALLBACK => CONNECTED FINISH");
      router.replace("/2fa");
    });

    return () => { unhandle(); };
  }, []);
  // onConnect(() => {
  //   console.log("Connected");
  //   router.replace("/2fa");
  // });

  const animatedBlinkStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animatedTimer.value, [0, 1], [0.6, 1]),
    };
  });

  useEffect(() => {
    // console.log("ASD")
    animatedTimer.value = withRepeat(
      withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  return !hasLogin ? (
    <LoginScreen />
  ) : (
    <ScreenView nav={false}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 64,
          // backgroundColor: 'red',
          width: 200,
          alignSelf: "center",
        }}
      >
        <Animated.View
          style={[
            {
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 32,
            },
            animatedBlinkStyle
          ]}
        >
          <MaterialIcons name="network-check" size={90} color="white" />
          <View
          style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 22,
                color: "white",
              }}
            >
              CONNECTING
            </Text>
            <LoadingDots />
          </View>
        </Animated.View>
        <View
          style={{
            width: "100%",
          }}
        >
          <Button
            title="DISCONNECT"
            color={"red"}
            onPress={() => {
              setSessionId(null);
            }}
          />
        </View>
      </View>
    </ScreenView>
  );
}
