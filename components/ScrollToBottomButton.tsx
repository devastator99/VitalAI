import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AnimatedButton from "./AnimatedButton";
import Colors from "~/utils/Colors";

type ScrollToBottomButtonProps = {
  onPress: () => void;
};

const ScrollToBottomButton = ({ onPress }: ScrollToBottomButtonProps) => {
  return (
    <AnimatedButton style={styles.container} onPress={onPress} pressInScale={0.65} pressOutScale={0.90} pressInSpeed={50} pressOutFriction={1}>
      <Ionicons
        name="arrow-down-circle"
        size={40}
        color={'rgb(59, 59, 59)'}
      />
    </AnimatedButton>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderRadius: 25,
    padding: 8,
    elevation: 0,
  },
  icon: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default ScrollToBottomButton;
