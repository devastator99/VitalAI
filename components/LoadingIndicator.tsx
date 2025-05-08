import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Colors from "~/utils/Colors";

const LoadingIndicator = () => (
  <View style={[styles.container, styles.loadingContainer]}>
    <ActivityIndicator size="large" color={Colors.mainBlue} />
    <Text style={styles.loadingText}>Loading your meal plan...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Colors.white,
    marginTop: 16,
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingIndicator;
