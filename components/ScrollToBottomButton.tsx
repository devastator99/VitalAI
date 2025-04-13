import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "~/constants/Colors";

type ScrollToBottomButtonProps = {
  onPress: () => void;
};

const ScrollToBottomButton = ({ onPress }: ScrollToBottomButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons
        name="arrow-down-circle"
        size={34}
        color={Colors.primary}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 25,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default ScrollToBottomButton;
