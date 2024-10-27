import React, { useRef } from "react";
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
import {
  CONTEXT_MENU_STATE,
  HOLD_ITEM_SCALE_DOWN_DURATION,
  HOLD_ITEM_SCALE_DOWN_VALUE,
  HOLD_ITEM_TRANSFORM_DURATION,
} from "./constants";
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

const hapticResponse = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

const HoldItem = ({ children, items, menuAnchorPosition }: HoldItemProps) => {
  const { state, menuProps, safeAreaInsets } = useHoldMenuContext();

  const containerRef = useRef<Animated.View>(null);
  const isActive = useSharedValue(false);
  const isAnimationStarted = useSharedValue(false);
  const didMeasureLayout = useSharedValue(false);
  const itemScale = useSharedValue(1);

  const scaleBack = () => {
    "worklet";
    itemScale.value = withTiming(1, {
      duration: HOLD_ITEM_TRANSFORM_DURATION / 2,
    });
  };

  const onCompletion = (finished?: boolean) => {
    "worklet";
    const isListValid = items && items.length > 0;
    if (finished && isListValid) {
      state.value = CONTEXT_MENU_STATE.ACTIVE;
      isActive.value = true;
      scaleBack();
      runOnJS(hapticResponse)();
    }
    isAnimationStarted.value = false;
  };

  const scaleHold = () => {
    "worklet";
    itemScale.value = withTiming(
      HOLD_ITEM_SCALE_DOWN_VALUE,
      { duration: HOLD_ITEM_SCALE_DOWN_DURATION },
      onCompletion
    );
  };

  const longPress = Gesture.LongPress()
    .onStart(() => {
      scaleHold();
    })
    .onFinalize(() => {});

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: isActive.value
            ? withTiming(1, { duration: HOLD_ITEM_TRANSFORM_DURATION })
            : itemScale.value,
        },
      ],
    };
  });

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
      <GestureDetector gesture={longPress}>
        <Animated.View ref={containerRef} style={[animatedContainerStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>

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
