// import { atom } from "recoil";

// export const navBarAnimationFinished = atom({
//   key: 'navBarAnimationFinished',
//   default: false
// })

import { create } from "zustand";

type NavBarAnimationState = {
  finished: boolean;
  setFinished: (finished: boolean) => void;
};

export const useNavBarAnimation = create<NavBarAnimationState>((set) => ({
  finished: false,
  setFinished: (finished: boolean) => set({ finished }),
}));

type LoadingScreenSingleState = {
  [key: string]: any;
};

type LoadingScreenState = {
  state: LoadingScreenSingleState;
  setState: (newState: LoadingScreenSingleState) => void;
  setSingleState: (key: string, value: any) => void;
  getSingleState: (key: string) => any;
  getSetSingleState: (key: string, value: any) => any;
};

export const useLoadingScreenState = create<LoadingScreenState>((set, get) => ({
  state: {},
  setState: (newState) => set({ state: newState }),
  setSingleState: (key, value) =>
    set((state) => ({
      state: { ...state.state, [key]: value },
    })),
  getSingleState: (key) => get().state[key],
  getSetSingleState: (key, defaultValue) => {
    const value = get().state[key];
    if (value === undefined) {
      set((state) => ({
        state: { ...state.state, [key]: defaultValue },
      }));
      return defaultValue;
    }
    return value;
  },
}));
