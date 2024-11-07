import { Href, useRouter } from "expo-router";
import { cloneElement, ReactElement, ReactNode } from "react";
import { Pressable, StyleProp, TextStyle } from "react-native";

// Define your props interface
interface CustomLinkProps {
    href: Href<string>;
    style?: StyleProp<TextStyle>;
    children: ReactNode;
}

// Custom Link component extending the functionality of Expo Router's Link
const CustomLink: React.FC<CustomLinkProps> = ({ href, children, style }) => {

    const router = useRouter();

    const handlePress = () => {
        console.log("ROTA: " + href);
        router.push(href); // Programmatically navigate to the specified href
    };

    return (
        <Pressable onPress={handlePress} style={[style]}>
            {children}
        </Pressable>
    );
};


const CustomLink2: React.FC<CustomLinkProps> = ({ href, children, style }) => {
    const router = useRouter();

    const handlePress = () => {
        router.push(href); // Programmatically navigate to the specified href
    };

    // Clone the child element and pass the onPress prop
    const clonedChildren = cloneElement(children as ReactElement, {
        onPress: handlePress,
        style, // You can also pass style if needed
    });

    return clonedChildren;
};

export default CustomLink;