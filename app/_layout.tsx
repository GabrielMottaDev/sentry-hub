import "@/utils/stringExtensions";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
// import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { memo, useCallback, useEffect, useState } from "react";
import "react-native-reanimated";
import * as THREE from "three";

(global as any).THREE = (global as any).THREE || THREE;
global.Buffer = global.Buffer || require("buffer").Buffer;

import { useColorScheme } from "@/hooks/useColorScheme";
import { getSessionId, SessionProvider } from "@/contexts/SessionProvider";
import {
  SocketClass,
  SocketProvider,
  useSocket,
  useSocketConnection,
} from "@/contexts/SocketProvider";
import { DimensionsProvider } from "@/contexts/DimensionsProvider";
import AllProviders from "@/contexts/AllProviders";
import { AlertProvider } from "@/contexts/alert/AlertProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";
import { FontSource, useFonts as expoUseFonts } from "expo-font";
import { useFonts, useFontsNative } from "@/contexts/useFonts";
import { StatusBar, StatusBarProps, StyleSheet, Text, View } from "react-native";
import { io } from "socket.io-client";
import Env from "@/constants/Env";
import LoadingScreen from "@/components/splash/LoadingScreen";
import * as NavigationBar from "expo-navigation-bar";
import { MemoView } from "@/components/memo/MemoView";

const CustomSplashScreen = () => {
  return (
    // <View
    //   style={{
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     backgroundColor: "#2E2E2E"
    //   }}
    // >
    //   <Text>Loading app..</Text>
    // </View>
    <LoadingScreen />
  );
};

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  // useEffect(() => {
  //   SplashScreen.preventAutoHideAsync();

  // }, []);
  // SplashScreen.preventAutoHideAsync();
  const colorScheme = useColorScheme();

  const [fontLoaded, fontError] = expoUseFonts({
    "Poppins-Black": require("../assets/fonts/Poppins/Poppins-Black.otf"),
    "Poppins-BlackItalic": require("../assets/fonts/Poppins/Poppins-BlackItalic.otf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.otf"),
    "Poppins-BoldItalic": require("../assets/fonts/Poppins/Poppins-BoldItalic.otf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins/Poppins-ExtraBold.otf"),
    "Poppins-ExtraBoldItalic": require("../assets/fonts/Poppins/Poppins-ExtraBoldItalic.otf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins/Poppins-ExtraLight.otf"),
    "Poppins-ExtraLightItalic": require("../assets/fonts/Poppins/Poppins-ExtraLightItalic.otf"),
    "Poppins-Italic": require("../assets/fonts/Poppins/Poppins-Italic.otf"),
    "Poppins-Light": require("../assets/fonts/Poppins/Poppins-Light.otf"),
    "Poppins-LightItalic": require("../assets/fonts/Poppins/Poppins-LightItalic.otf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.otf"),
    "Poppins-MediumItalic": require("../assets/fonts/Poppins/Poppins-MediumItalic.otf"),
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.otf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.otf"),
    "Poppins-SemiBoldItalic": require("../assets/fonts/Poppins/Poppins-SemiBoldItalic.otf"),
    "Poppins-Thin": require("../assets/fonts/Poppins/Poppins-Thin.otf"),
    "Poppins-ThinItalic": require("../assets/fonts/Poppins/Poppins-ThinItalic.otf"),

    "CaskaydiaCoveNerdFontMono-Bold": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-Bold.ttf"),
    "CaskaydiaCoveNerdFontMono-BoldItalic": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-BoldItalic.ttf"),
    "CaskaydiaCoveNerdFontMono-ExtraLight": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-ExtraLight.ttf"),
    "CaskaydiaCoveNerdFontMono-ExtraLightItalic": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-ExtraLightItalic.ttf"),
    "CaskaydiaCoveNerdFontMono-Italic": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-Italic.ttf"),
    "CaskaydiaCoveNerdFontMono-Light": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-Light.ttf"),
    "CaskaydiaCoveNerdFontMono-LightItalic": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-LightItalic.ttf"),
    "CaskaydiaCoveNerdFontMono-Regular": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-Regular.ttf"),
    "CaskaydiaCoveNerdFontMono-SemiBold": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-SemiBold.ttf"),
    "CaskaydiaCoveNerdFontMono-SemiBoldItalic": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-SemiBoldItalic.ttf"),
    "CaskaydiaCoveNerdFontMono-SemiLight": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-SemiLight.ttf"),
    "CaskaydiaCoveNerdFontMono-SemiLightItalic": require("../assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-SemiLightItalic.ttf"),

    "Montserrat-Black": require("../assets/fonts/Montserrat/Montserrat-Black.ttf"),
    "Montserrat-BlackItalic": require("../assets/fonts/Montserrat/Montserrat-BlackItalic.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat/Montserrat-Bold.ttf"),
    "Montserrat-BoldItalic": require("../assets/fonts/Montserrat/Montserrat-BoldItalic.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat/Montserrat-ExtraBold.ttf"),
    "Montserrat-ExtraBoldItalic": require("../assets/fonts/Montserrat/Montserrat-ExtraBoldItalic.ttf"),
    "Montserrat-ExtraLight": require("../assets/fonts/Montserrat/Montserrat-ExtraLight.ttf"),
    "Montserrat-ExtraLightItalic": require("../assets/fonts/Montserrat/Montserrat-ExtraLightItalic.ttf"),
    "Montserrat-Italic": require("../assets/fonts/Montserrat/Montserrat-Italic.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat/Montserrat-Light.ttf"),
    "Montserrat-LightItalic": require("../assets/fonts/Montserrat/Montserrat-LightItalic.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat/Montserrat-Medium.ttf"),
    "Montserrat-MediumItalic": require("../assets/fonts/Montserrat/Montserrat-MediumItalic.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat/Montserrat-Regular.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat/Montserrat-SemiBold.ttf"),
    "Montserrat-SemiBoldItalic": require("../assets/fonts/Montserrat/Montserrat-SemiBoldItalic.ttf"),
    "Montserrat-Thin": require("../assets/fonts/Montserrat/Montserrat-Thin.ttf"),
    "Montserrat-ThinItalic": require("../assets/fonts/Montserrat/Montserrat-ThinItalic.ttf"),
  });

  // const [loaded] = useFonts([
  //   ['assets/fonts/CaskaydiaCoveNerdFontMono/CaskaydiaCoveNerdFontMono-', ["Bold", "BoldItalic", "ExtraLight", "ExtraLightItalic", "Italic", "Light", "LightItalic", "Regular", "SemiBold", "SemiBoldItalic", "SemiLight", "SemiLightItalic"]],
  // ]);

  // const { onConnect, onConnectError } = useSocket();

  // const [preLoaded, setPreLoaded] = useState(false);

  // useEffect(() => {
  //   if (fontLoaded && !fontError) {
  //     // console.log("HIDE");
  //     // setPreLoaded(true);
  //     // SplashScreen.hideAsync();
  //   }
  // }, [fontLoaded, fontError]);

  // if (!fontLoaded || fontError) {
  //   console.log("_layout RENDER BUT FONT NOT LOADED");
  //   return undefined;
  // }

  useEffect(() => {
    if (fontLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, fontError]);

  if (!fontLoaded && !fontError) {
    console.log("_layout RENDER BUT FONT NOT LOADED");
    return null;
  }

  console.log("_layout RENDER");
  // return <LoadingScreen />;

  // const [appIsReady, setAppIsReady] = useState(false);
  // const [preConnected, setPreConnected] = useState<boolean | null>(null);
  // const socketInstance = new SocketClass();

  // useEffect(() => {
  //   (async () => {
  //     const sessionId = await getSessionId();
  //     const socket = io(`${Env.API_URL}`, {
  //       auth: {
  //         api_key: `${Env.API_KEY}`,
  //         session_id: `${sessionId}`,
  //       },
  //       // transports: ['websocket'],  // Certifique-se de forçar o uso do WebSocket se necessário
  //       secure: Env.API_URL?.includes("https"),
  //       reconnection: true,
  //       timeout: 3000,
  //     });
  //     socket.on("connect", () => {
  //       console.log("_layout SOCKET CONNECTED");
  //       setPreConnected(true);
  //     });
  //     socket.on("connect_error", () => {
  //       console.log("_layout SOCKET ERROR");
  //       setPreConnected(false);
  //     });
  //     socketInstance.setSocket(socket);
  //   })();
  // }, []);

  // useEffect(() => {
  //   if (fontLoaded === true && preConnected !== null) {
  //     // console.log("HIDE SPLASH SCREEN");
  //     // SplashScreen.hideAsync();
  //     setAppIsReady(true);
  //   }
  // }, [fontLoaded, preConnected]);

  // console.log("_layout RENDER");

  // if (fontLoaded === false || preConnected === null) {
  //   return CustomSplashScreen();
  // }

  // console.log("_layout RENDER after preload", fontLoaded, preConnected);

  return (
    <AllProviders
      providers={[
        SessionProvider,
        SocketProvider,
        [QueryClientProvider, { client: queryClient }],
        [ThemeProvider, { value: DefaultTheme }],
        DimensionsProvider,
        AlertProvider,
      ]}
    >
      {/* <> */}
      {/* <MemoView style={{...StyleSheet.absoluteFillObject, flex: 1}}> */}
      {/* </MemoView> */}
      <LoadingScreen key={"loading-screen"}/>
      <Stack
        screenOptions={{
          headerShown: false,
          // presentation: 'transparentModal',
          animation: "none",
        }}
        >
        <Stack.Screen name="2fa" />
        <Stack.Screen name="player" />
        <Stack.Screen name="server" />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* </> */}
    </AllProviders>
    //// <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
  );
};

export default RootLayout;

type ConnectionHandlerProps = {
  setOnConnect?: () => void;
  setOnConnectError?: (error: Error) => void;
  onConnectionEvent?: (success: boolean) => void;
};
const ConnectionHandler = ({
  setOnConnect,
  setOnConnectError,
  onConnectionEvent,
}: ConnectionHandlerProps) => {
  const { onConnect, onConnectError } = useSocket();

  if (onConnectionEvent) {
    onConnect(() => onConnectionEvent(true));
    onConnectError(() => onConnectionEvent(false));
  }

  // if (setOnConnectError)
  // onConnectError(setOnConnectError);

  return null;
};
