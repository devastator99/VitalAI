import Colors from "~/utils/Colors";
import {
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";


const PredefinedMessages = [
  { title: "Health analysis Report", text: "for my diabetes" },
  { title: "Suggest fun exercises", text: "for a overweight person" },
  { title: "Recommend a dish", text: "to satisfy my protein requirements" },
];

type Props = {
  onSelectCard: (message: string) => void;
};

const MessageIdeas = ({ onSelectCard }: Props) => {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 16,
        }}
      >
          {PredefinedMessages.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => onSelectCard(`${item.title} ${item.text}`)}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" ,color:Colors.white}}>
                {item.title}
              </Text>
              <Text style={{ color: Colors.primary, fontSize: 14 }}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  card: {
    backgroundColor: "transparent",
    padding: 15,
    borderWidth:1,
    borderColor:Colors.mainBlue,
    borderRadius: 25,
  },
});
export default MessageIdeas;

