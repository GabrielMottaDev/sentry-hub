import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useDimensions } from '../DimensionsProvider';
import { Memo } from '@/components/memo/Memo';

export type AlertConfig = {
  message?: string;
  direction?: 'up' | 'down';
  timeout?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const defaultConfig: Required<AlertConfig> = {
  direction: 'up',
  type: 'info',
  message: 'Alert message',
  timeout: 1500,
}
export const applyDefaults = (config: AlertConfig): Required<AlertConfig> => ({
  ...defaultConfig,
  ...config,
});

type AlertProps = {
  config?: AlertConfig;
}

const Alert = memo(({
  config = {}
}: AlertProps) => {

  const { navbarOffset, STATUS_BAR_HEIGHT } = useDimensions();

  const finalConfig = applyDefaults(config);
  const styles = getStyles(finalConfig, navbarOffset, STATUS_BAR_HEIGHT);

  const { message, type, direction } = finalConfig;

  return (
    <Animated.View
      style={[styles.container, styles[type]]}
      entering={
        config.direction === 'up' ? FadeInUp : FadeInDown
      }
      exiting={
        config.direction === 'up' ? FadeOutUp : FadeOutDown
      }
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
});

const getStyles = (config: AlertConfig, navbar: number, statusbar: number) => {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: config.direction !== 'up' ? undefined : statusbar,
      bottom: config.direction !== 'down' ? undefined : navbar,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: 10,
      borderRadius: 5,
      margin: 10,
    },
    message: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
      textAlignVertical: 'center',
      
      // letterSpacing: 1,
      // lineHeight: 20,
      // fontFamily
      // fontStyle
      // fontWeight
    },
    success: {
      backgroundColor: 'rgba(0, 255, 0, 0.5)',
    },
    error: {
      backgroundColor: 'rgb(255, 0, 0, 0.5)',
    },
    warning: {
      backgroundColor: 'rgb(255, 165, 0, 0.5)',
    },
    info: {
      backgroundColor: 'rgb(0, 0, 255, 0.5)',
    },
  });
}

export default Alert;