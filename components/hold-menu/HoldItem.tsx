import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

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
  const scale = useSharedValue(1);

  const longPress = Gesture.LongPress()
    .onStart(() => {
      scale.value = withTiming(1.2);
    })
    .onFinalize(() => {
      scale.value = withTiming(1);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <GestureDetector gesture={longPress}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};

export default HoldItem;
