import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "~/utils/Colors";
import Settings from "~/components/Settings";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <Settings />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
}); 