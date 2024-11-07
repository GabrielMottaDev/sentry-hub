import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Dimensions, StatusBar } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import EventEmitter from "eventemitter3";
import Alert, { AlertConfig } from "./Alert";
import { Memo } from "@/components/memo/Memo";
import { AlertListener } from "./AlertListener";
import { alertEmitter } from "./AlertEmitter";

type AlertContextType = {
  setAlert: (alert: AlertConfig) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: PropsWithChildren) => {

  const setAlert = useMemo(() => (alert: AlertConfig) => {
    alertEmitter.emit("alert", alert);
  }, []);

  console.log("ALERT PROVIDER RENDER");

  return (
    <AlertContext.Provider value={{
      setAlert
    }}>
      <AlertListener />
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within a AlertProvider');
  return context;
}