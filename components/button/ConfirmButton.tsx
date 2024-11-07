import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AnimatedModal from '../AnimatedModal';
import ScreenView from '../ScreenView';

interface ConfirmButtonProps {
    onPress: () => void;
    title: string;
}

const ConfirmButton = ({ onPress, title }: ConfirmButtonProps) => {

    const [modalVisible, setModalVisible] = useState(true);

    return (
        <>
            <TouchableOpacity style={styles.button} onPress={() => {
                onPress();
                setModalVisible(true);
            }}>
                <Text style={styles.buttonText}>{title}</Text>
            </TouchableOpacity>
            
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default ConfirmButton;