import React, { useMemo, useRef } from "react";
import { StyleSheet, ViewProps } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Portal } from "react-native-paper";
import Animated, {
  measure,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  CONTEXT_MENU_STATE,
  HOLD_ITEM_SCALE_DOWN_DURATION,
  HOLD_ITEM_SCALE_DOWN_VALUE,
  HOLD_ITEM_TRANSFORM_DURATION,
  SPRING_CONFIGURATION,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "./constants";
import { useHoldMenuContext } from "./holdMenuContext";
import * as Haptics from "expo-haptics";
import useDeviceOrientation from "@/hooks/useDeviceOrientation";
import {
  calculateMenuHeight,
  getTransformOrigin,
  TransformOriginAnchorPosition,
} from "./utils/calculations";
import styleGuide from "./utils/styleGuide";

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
  const deviceOrientation = useDeviceOrientation();

  const containerRef = useAnimatedRef();

  const isActive = useSharedValue(false);
  const isAnimationStarted = useSharedValue(false);
  const didMeasureLayout = useSharedValue(false);
  const transformOrigin = useSharedValue<TransformOriginAnchorPosition>(
    menuAnchorPosition || "top-right"
  );
  const itemRectY = useSharedValue<number>(0);
  const itemRectX = useSharedValue<number>(0);
  const itemRectWidth = useSharedValue<number>(0);
  const itemRectHeight = useSharedValue<number>(0);
  const itemScale = useSharedValue<number>(1);
  const transformValue = useSharedValue<number>(0);

  const menuHeight = useMemo(() => {
    return calculateMenuHeight(items.length, items.length);
  }, [items]);

  const activateAnimation = () => {
    "worklet";
    if (!didMeasureLayout.value) {
      const measured = measure(containerRef);
      console.log("measured", measured);

      itemRectY.value = measured?.pageY || 0;
      itemRectX.value = measured?.pageX || 0;
      itemRectHeight.value = measured?.height || 0;
      itemRectWidth.value = measured?.width || 0;

      if (!menuAnchorPosition) {
        const position = getTransformOrigin(
          measured?.pageX || 0,
          itemRectWidth.value,
          deviceOrientation === "portrait" ? WINDOW_WIDTH : WINDOW_HEIGHT,
          undefined
        );
        transformOrigin.value = position;
      }
    }
  };

  const calculateTransformValue = () => {
    "worklet";
    console.log("calculateTransformValue");
    const height =
      deviceOrientation === "portrait" ? WINDOW_HEIGHT : WINDOW_WIDTH;

    const isAnchorPointTop = transformOrigin.value.includes("top");

    let tY = 0;
    if (isAnchorPointTop) {
      const topTransform =
        itemRectY.value +
        itemRectHeight.value +
        menuHeight +
        styleGuide.spacing +
        (safeAreaInsets?.bottom || 0);

      tY = topTransform > height ? height - topTransform : 0;

      console.log("calculateTransformValue", {
        topTransform,
        height,
        tY,
      });
    } else {
      const bottomTransform =
        itemRectY.value - menuHeight - (safeAreaInsets?.top || 0);
      tY = bottomTransform < 0 ? -bottomTransform + styleGuide.spacing * 2 : 0;
    }
    return tY;
  };

  const setMenuProps = () => {
    "worklet";

    // menuProps.value = {
    //   itemHeight: itemRectHeight.value,
    //   itemWidth: itemRectWidth.value,
    //   itemY: itemRectY.value,
    //   itemX: itemRectX.value,
    //   anchorPosition: transformOrigin.value,
    //   menuHeight: menuHeight,
    //   items,
    //   transformValue: transformValue.value,
    // };
  };

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
      if (!didMeasureLayout.value) {
        activateAnimation();
        transformValue.value = calculateTransformValue();
        setMenuProps();
        didMeasureLayout.value = true;
      }

      if (!isActive.value) {
        scaleHold();
      }
    })
    .onFinalize(() => {
      didMeasureLayout.value = false;
    });

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

    let tY = calculateTransformValue();
    console.log("tY animatedPortalStyle", tY);
    const transformAnimation = () =>
      isActive.value
        ? withSpring(tY, SPRING_CONFIGURATION)
        : withTiming(-0.1, { duration: HOLD_ITEM_TRANSFORM_DURATION });

    return {
      zIndex: 10,
      position: "absolute",
      top: itemRectY.value,
      left: itemRectX.value,
      width: itemRectWidth.value,
      height: itemRectHeight.value,
      opacity: isActive.value ? 1 : animateOpacity(),
      transform: [
        {
          translateY: transformAnimation(),
        },
        {
          scale: isActive.value
            ? withTiming(1, { duration: HOLD_ITEM_TRANSFORM_DURATION })
            : itemScale.value,
        },
      ],
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
