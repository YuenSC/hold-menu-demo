import React from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import HoldItem from "./HoldItem";
import { Text } from "react-native-paper";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CONTEXT_MENU_STATE, IS_IOS } from "./constants";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHoldMenuContext } from "./holdMenuContext";

const MenuItems = [
  { text: "Actions", icon: "home", isTitle: true, onPress: () => {} },
  { text: "Action 1", icon: "edit", onPress: () => {} },
  { text: "Action 2", icon: "map-pin", withSeparator: true, onPress: () => {} },
  { text: "Action 3", icon: "trash", isDestructive: true, onPress: () => {} },
];

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const HoldMenuExample = () => {
  const { state } = useHoldMenuContext();

  const tap = Gesture.Tap().onEnd(() => {
    state.value = CONTEXT_MENU_STATE.END;
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isShownBlurView = state.value === CONTEXT_MENU_STATE.ACTIVE;
    const opacity = withTiming(isShownBlurView ? 1 : 0, {
      duration: 1000,
    });
    const left = withTiming(isShownBlurView ? 0 : 100, {
      duration: 1000,
    });
    return {
      ...StyleSheet.absoluteFillObject,
      //   width: 200,
      //   height: 200,
      display: isShownBlurView ? "flex" : "none",
      opacity,
    };
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: withTiming(
        state.value === CONTEXT_MENU_STATE.ACTIVE ? 100 : 0,
        {
          duration: 1000,
        }
      ),
    };
  });

  return (
    <View style={styles.container}>
      <HoldItem items={MenuItems}>
        <View style={styles.item}>
          <Text>List Item 1</Text>
        </View>
      </HoldItem>
      <HoldItem items={MenuItems}>
        <View style={[styles.item, { backgroundColor: "blue" }]}>
          <Text>List Item 2</Text>
        </View>
      </HoldItem>
      <HoldItem items={MenuItems} menuAnchorPosition="bottom-right">
        <View style={[styles.item, { backgroundColor: "green" }]}>
          <Text>List Item 3</Text>
        </View>
      </HoldItem>

      <Animated.View style={[animatedStyle]}>
        <GestureDetector gesture={tap}>
          <AnimatedBlurView style={{ flex: 1 }} animatedProps={animatedProps} />
        </GestureDetector>
      </Animated.View>
    </View>
  );
};

export default HoldMenuExample;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  item: {
    width: "100%", // Change from 100 to '100%' to make it full width
    padding: 16,
    backgroundColor: "red",
    borderRadius: 10,
    aspectRatio: 1,
  },
});
