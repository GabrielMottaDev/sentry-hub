import { createContext, PropsWithChildren, useContext, useState } from "react";
import { Dimensions, StatusBar } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

type DimensionsContextType = {
  navbarOffset: number;
  setNavbarOffset: (offset: number) => void;
  SCREEN_HEIGHT: number;
  WINDOW_HEIGHT: number;
  STATUS_BAR_HEIGHT: number;
  NAV_BAR_HEIGHT: number;
  insets: EdgeInsets;
};

const DimensionsContext = createContext<DimensionsContextType | undefined>(undefined);

export const DimensionsProvider = ({ children }: PropsWithChildren) => {

  const insets = useSafeAreaInsets();

  const SCREEN_HEIGHT = Dimensions.get('screen').height; // device height
  const WINDOW_HEIGHT = Dimensions.get('window').height;
  const STATUS_BAR_HEIGHT = insets.top || StatusBar.currentHeight || 24;
  // *Use prefferebly navBarOffset instead.
  let NAV_BAR_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;
  // *In cases where the navbar is gesture based
  if(NAV_BAR_HEIGHT < 0) NAV_BAR_HEIGHT = 24;
  
  // This replaces NAV_BAR_HEIGHT
  const [navbarOffset, setNavbarOffset] = useState<number>(NAV_BAR_HEIGHT);

  return (
    <DimensionsContext.Provider value={{
      navbarOffset,
      setNavbarOffset,
      SCREEN_HEIGHT,
      WINDOW_HEIGHT,
      STATUS_BAR_HEIGHT,
      NAV_BAR_HEIGHT,
      insets
    }}>
      {children}
    </DimensionsContext.Provider>
  );
};

export const useDimensions = () => {
  const context = useContext(DimensionsContext);
  if (!context) throw new Error('useDimensions must be used within a DimensionsProvider');
  return context;
}