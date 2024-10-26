import React from "react";
import { StyleSheet, ViewProps } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Portal } from "react-native-paper";
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { CONTEXT_MENU_STATE, HOLD_ITEM_TRANSFORM_DURATION } from "./constants";
import { useHoldMenuContext } from "./holdMenuContext";
import * as Haptics from "expo-haptics";

export type HoldItemProps = {
  children: React.ReactNode;
  items: {
    text: string;
    onPress: () => void;
  }[];
  menuAnchorPosition?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
};

const HoldItem = ({ children, items, menuAnchorPosition }: HoldItemProps) => {
  const { state, menuProps, safeAreaInsets } = useHoldMenuContext();

  const isActive = useSharedValue(false);

  const longPress = Gesture.LongPress()
    .onStart(() => {
      state.value = CONTEXT_MENU_STATE.ACTIVE;
      isActive.value = true;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
    })
    .onFinalize(() => {});

  const animatedPortalStyle = useAnimatedStyle(() => {
    const animateOpacity = () =>
      withDelay(HOLD_ITEM_TRANSFORM_DURATION, withTiming(0, { duration: 0 }));
    return {
      opacity: isActive.value ? 1 : animateOpacity(),
    };
  });

  const animatedPortalProps = useAnimatedProps<ViewProps>(() => ({
    pointerEvents: isActive.value ? "auto" : "none",
  }));

  useAnimatedReaction(
    () => state.value,
    (_state) => {
      if (_state === CONTEXT_MENU_STATE.END) {
        isActive.value = false;
      }
    }
  );

  return (
    <>
      <GestureDetector gesture={longPress}>{children}</GestureDetector>

      <Portal>
        <Animated.View
          style={[styles.holdItem, animatedPortalStyle]}
          animatedProps={animatedPortalProps}
        >
          {children}
        </Animated.View>
      </Portal>
    </>
  );
};

export default HoldItem;

const styles = StyleSheet.create({
  holdItem: { zIndex: 10, position: "absolute" },
  portalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
  },
});
