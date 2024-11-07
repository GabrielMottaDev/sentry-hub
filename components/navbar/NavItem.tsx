import { Component } from "react";
import { StyleSheet, Text as RNText, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import CustomLink from "../navigation/CustomLink";
import { Href, usePathname, useRouter } from "expo-router";
import Text from "../ui/Text";

type NavItemProps = {
    title: string;
    icon: React.JSX.Element;
    href: Href<string>;
};

const NavItem = ({ title, icon, href }: NavItemProps) => {

    const pathname = usePathname();
    const router = useRouter();

    const handlePress = () => {
        // console.log(pathname)
        if(pathname === href) return;
        router.replace(href);
    };

    return (
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={handlePress}>
            <View style={styles.icon}>{icon}</View>
            <Text font={"Light"} style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    navItem: {
        // backgroundColor: 'red',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 14,
        flex: 1,
        rowGap: 5
    },
    text: {
        color: 'white',
        fontSize: 11,
    },
    icon: {
        // backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default NavItem;