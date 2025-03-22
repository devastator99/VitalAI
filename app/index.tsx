import AnimatedIntro from "~/components/AnimatedIntro";
import BottomLoginSheet from "~/components/BottomLoginSheet";
import { View, StyleSheet } from "react-native";
const Page = () => {
  console.log("index.js");
  console.log("HerE We Go");

  return (
    <View style={styles.container}>
      <AnimatedIntro />
      <BottomLoginSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default Page;
