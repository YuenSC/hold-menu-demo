import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Components
import { BlurView } from "expo-blur";

const AnimatedBlurView = IS_IOS
  ? Animated.createAnimatedComponent(BlurView)
  : Animated.View;

// Utils
import {
  CONTEXT_MENU_STATE,
  HOLD_ITEM_SCALE_DOWN_DURATION,
  HOLD_ITEM_TRANSFORM_DURATION,
  IS_IOS,
} from "./constants";
import { useHoldMenuContext } from "./holdMenuContext";

type Context = {
  startPosition: {
    x: number;
    y: number;
  };
};

const BackdropComponent = () => {
  const { state } = useHoldMenuContext();

  const context = useSharedValue<Context>({
    startPosition: { x: 0, y: 0 },
  });

  const tap = Gesture.Tap()
    .onStart((event) => {
      context.value = { startPosition: { x: event.x, y: event.y } };
    })
    .onEnd((event) => {
      const distance = Math.hypot(
        event.x - context.value.startPosition.x,
        event.y - context.value.startPosition.y
      );

      const shouldClose = distance < 10;
      const isStateActive = state.value === CONTEXT_MENU_STATE.ACTIVE;

      //   console.log("Backdrop onFinalize", {
      //     eventPosition: { x: event.x, y: event.y },
      //     startPosition: context.value.startPosition,
      //     distance,
      //     shouldClose,
      //     isStateActive,
      //   });

      if (shouldClose && isStateActive) {
        state.value = CONTEXT_MENU_STATE.END;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isShownBlurView = state.value === CONTEXT_MENU_STATE.ACTIVE;
    const opacity = withTiming(isShownBlurView ? 1 : 0, {
      duration: HOLD_ITEM_SCALE_DOWN_DURATION,
    });

    return {
      ...StyleSheet.absoluteFillObject,
      display: isShownBlurView ? "flex" : "none",
      opacity,
    };
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: withTiming(
        state.value === CONTEXT_MENU_STATE.ACTIVE ? 100 : 0,
        { duration: HOLD_ITEM_TRANSFORM_DURATION }
      ),
    };
  });

  return (
    <Animated.View style={[animatedStyle]}>
      <GestureDetector gesture={tap}>
        <AnimatedBlurView style={{ flex: 1 }} animatedProps={animatedProps} />
      </GestureDetector>
    </Animated.View>
  );
};

const HoldMenuBackdrop = memo(BackdropComponent);

export default HoldMenuBackdrop;
