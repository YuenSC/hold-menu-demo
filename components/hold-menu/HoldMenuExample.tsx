import React from "react";
import { StyleSheet, View } from "react-native";

import HoldItem from "./HoldItem";

const MenuItems = [
  { text: "Actions", icon: "home", isTitle: true, onPress: () => {} },
  { text: "Action 1", icon: "edit", onPress: () => {} },
  { text: "Action 2", icon: "map-pin", withSeparator: true, onPress: () => {} },
  { text: "Action 3", icon: "trash", isDestructive: true, onPress: () => {} },
];

const HoldMenuExample = () => {
  return (
    <View style={styles.container}>
      <HoldItem items={MenuItems}>
        <View style={styles.item} />
      </HoldItem>
      <HoldItem items={MenuItems}>
        <View style={[styles.item, { backgroundColor: "blue" }]} />
      </HoldItem>
      <HoldItem items={MenuItems} menuAnchorPosition="bottom-right">
        <View style={[styles.item, { backgroundColor: "yellow" }]} />
      </HoldItem>
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
    height: 100,
    backgroundColor: "red",
  },
});
