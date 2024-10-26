import React, { createContext, useContext, useEffect, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { CONTEXT_MENU_STATE } from "./constants";
import { MenuInternalProps } from "./types";
import HoldMenuBackdrop from "./HoldMenuBackdrop";

export type HoldMenuContextType = {
  state: SharedValue<CONTEXT_MENU_STATE>;
  theme: SharedValue<"light" | "dark">;
  menuProps: SharedValue<MenuInternalProps>;
  safeAreaInsets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

// @ts-ignore
export const HoldMenuContext = createContext<HoldMenuContextType>();

const HoldMenuProvider = ({
  children,
  theme: selectedTheme,
  iconComponent,
  safeAreaInsets,
  onOpen,
  onClose,
}: {
  theme?: "dark" | "light";
  iconComponent?: any;
  children: React.ReactElement | React.ReactElement[];
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  const state = useSharedValue<CONTEXT_MENU_STATE>(
    CONTEXT_MENU_STATE.UNDETERMINED
  );
  const theme = useSharedValue<"light" | "dark">(selectedTheme || "light");
  const menuProps = useSharedValue<MenuInternalProps>({
    itemHeight: 0,
    itemWidth: 0,
    itemX: 0,
    itemY: 0,
    items: [],
    anchorPosition: "top-center",
    menuHeight: 0,
    transformValue: 0,
    actionParams: {},
  });

  useEffect(() => {
    theme.value = selectedTheme || "light";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTheme]);

  useAnimatedReaction(
    () => state.value,
    (state) => {
      switch (state) {
        case CONTEXT_MENU_STATE.ACTIVE: {
          if (onOpen) runOnJS(onOpen)();
          break;
        }
        case CONTEXT_MENU_STATE.END: {
          if (onClose) runOnJS(onClose)();
          break;
        }
      }
    },
    [state]
  );

  const holdMenuContext = useMemo(
    () => ({
      state,
      theme,
      menuProps,
      safeAreaInsets: safeAreaInsets || {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    }),
    [state, theme, menuProps, safeAreaInsets]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HoldMenuContext.Provider value={holdMenuContext}>
        {children}
      </HoldMenuContext.Provider>
    </GestureHandlerRootView>
  );
};

export default HoldMenuProvider;

export const useHoldMenuContext = () => {
  return useContext(HoldMenuContext);
};
