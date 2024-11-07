import React, { Children, cloneElement, isValidElement, useEffect } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, StatusBar, StatusBarProps, StyleProp, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from 'expo-navigation-bar';
import NavBar from "./navbar/NavBar";
import { useDimensions } from "@/contexts/DimensionsProvider";
import LoadingScreen from "./splash/LoadingScreen";

type ScreenViewProps = {
    children: React.ReactNode,
    style?: StyleProp<any>
    nav?: boolean
};

// https://reactnative.dev/docs/statusbar
// https://docs.expo.dev/versions/latest/sdk/navigation-bar/
const ScreenView  = ({ children, style, nav = true }: ScreenViewProps) => {

    const { insets, navbarOffset } = useDimensions();

    const modifiedChildren = React.Children.map(children, (child, index) => {
        if (index == 0 && React.isValidElement(child)) {
            const props = {
                ...child.props,
                style: [child.props.style, { paddingTop: insets.top }]
            };
            return React.cloneElement(child, props);
        }
        return child;
    });

    NavigationBar.setVisibilityAsync("visible");
    NavigationBar.setBorderColorAsync("transparent");
    NavigationBar.setBackgroundColorAsync("#00000001"); // More invisible than transparent
    NavigationBar.setPositionAsync("absolute"); // Overlay on top of the screen
    NavigationBar.setButtonStyleAsync("light");
    // NavigationBar.setVisibilityAsync("hidden");
    // NavigationBar.setBehaviorAsync("overlay-swipe"); // Swipe up to show

    // StatusBar.setHidden(true);
    // StatusBar.setTranslucent(true);
    // StatusBar.setBarStyle("light-content", false);
    // StatusBar.setBackgroundColor("transparent", false);

    var statusBarEntry: StatusBarProps;
    useEffect(() => {
        statusBarEntry = StatusBar.pushStackEntry({
            animated: true,
            hidden: false,
            backgroundColor: "transparent",
            barStyle: "light-content",
            translucent: true
        });

        return () => {
            StatusBar.popStackEntry(statusBarEntry);
        };
    }, []);

    return (
        <View style={[styles.container, style]}>
            {/* <LoadingScreen key={"loading-screen"}/> */}
            {modifiedChildren}
            {/* {nav && <View style={{marginBottom: navbarOffset, height: 0, flexShrink: 1 }}></View>} */}
            {nav && <NavBar style={{ backgroundColor: '#000000260' }}/>}
        </View>
    );

    // return (
    //     <SafeAreaView style={[styles.container, style]} mode="padding">
    //         {/* {modifiedChildren} */}
    //         {children}
    //     </SafeAreaView>
    // );
};

export default ScreenView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E2E2E',
    },
});