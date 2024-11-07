import React, { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

type MemoProps = {} & ViewProps;

export const MemoView = React.memo(({ children, ...props }: MemoProps) => (
  <View {...props}>
    {children}
  </View>
));