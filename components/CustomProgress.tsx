import React, { forwardRef, Key, PropsWithChildren, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircularProgressBase, ProgressRef } from "react-native-circular-progress-indicator";
import { Easing, interpolate, useSharedValue, withTiming } from "react-native-reanimated";

type CustomProgressProps = {
    maxValue: number;
    keyRender: Key | null;
} & PropsWithChildren;

export type CustomProgressHandle = {
    reset: () => void;
    setValue: (value: number) => void;
    changeValue: (value: number, duration: number) => void;
    reanimate: () => void;
    pause: () => void;
    play: () => void;
    setDuration: (duration: number) => void;
};

const CustomProgress = forwardRef<CustomProgressHandle, CustomProgressProps>(({
    children,
    maxValue,
    keyRender
}, ref) => {

    const progressRef = useRef<ProgressRef>(null);

    const strokeWidth = 16; // 16
    
    const lightOpacity = 1;
    const darkOpacity = 0.9; // 0.9

    // const maxValue = 30;
    const [value, setValue] = useState(-1); // 0
    const [duration, setDuration] = useState(0);

    const [opacity, setOpacity] = useState(darkOpacity);

    const reset = () => {
        progressRef.current?.pause();
        setValue(0);
        progressRef.current?.reAnimate();

    };

    const handleAnimationComplete = () => {
        // changeOpacity(darkOpacity, 250);
        setOpacity(darkOpacity);
        setDuration(150);
        // console.log("COMPLETE");
    };

    // useRef necessary to prevent component re-render
    const lastTimestamp = useRef(0);
    const animationFrameId = useRef<number | null>(null);
    const tick = (timestamp: number) => {
        // Verifica se já passou 1 segundo desde a última atualização
        var stateChanged = false;
        if (timestamp - lastTimestamp.current >= 1000) {
            // console.log("SEC", value)
            lastTimestamp.current = timestamp;

            if (value >= maxValue) {
                
                // reset();
                // cancelFrame();
                return;
            } else {
                // setOpacity(lightOpacity);
                // changeOpacity(lightOpacity, 100);
                setOpacity(lightOpacity);
                setValue(value + 1);
                stateChanged = true;
            }
        }
        // Chama requestAnimationFrame novamente
        // dont need to call if value state changed, because it will trigger useEffect and call nextFrame again
        if(!stateChanged)
            nextFrame();
    };
    const nextFrame = () => {
        animationFrameId.current = requestAnimationFrame(tick);
    }
    const cancelFrame = () => {
        if (animationFrameId.current)
            cancelAnimationFrame(animationFrameId.current); 
    }

    useEffect(() => {
        if(value == -1){
            return;
        }
        
        // Inicia o loop de animação quando o componente é montado
        // lastTimestamp.current = 0;
        nextFrame();

        return () => {
            // Cancela a animação se o componente for desmontado
            cancelFrame();
        };
    }, [value]);

    // Exponha as funções com `useImperativeHandle`
    useImperativeHandle(ref, () => ({
        reset,
        setValue: (value: number) => {
            setDuration(0);
            setValue(value);
            // Duration resets to normal when animation finishes
        },
        changeValue: (value: number, duration?: number) => {
            setDuration(duration?duration:150);
            setValue(value);
        },
        reanimate: () => {
            progressRef.current?.reAnimate();
        },
        pause: () => {
            progressRef.current?.pause();
        },
        play: () => {
            progressRef.current?.play();
        },
        setDuration
    }));

    return (
        // <>{children}</>
        <CircularProgressBase
            key={keyRender} // Forces the component to re-render
            ref={progressRef}
            maxValue={maxValue}
            value={value}
            radius={180}

            clockwise={true}
            rotation={0}
            // clockwise={false}
            // rotation={-180}

            duration={duration}

            onAnimationComplete={handleAnimationComplete}

            activeStrokeWidth={strokeWidth+0.5} // .5 to make sure to cover the other stoke color
            inActiveStrokeWidth={strokeWidth}

            activeStrokeColor='#1b1b1b'
            inActiveStrokeColor='#0bceff'
            inActiveStrokeOpacity={opacity}
            
            strokeLinecap='butt'
        >
            {children}
        </CircularProgressBase>
    );
});

export default CustomProgress;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E2E2E',
    },
});