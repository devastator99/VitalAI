import { View,TouchableOpacity,Text,StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const roleselect = () => {
    const router = useRouter();
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Interface</Text>
        
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => router.replace("/(admin)/dashboard")}
        >
          <Ionicons name="shield" size={32} color="#3B82F6" />
          <Text style={styles.optionTitle}>Admin Dashboard</Text>
          <Text style={styles.optionDescription}>
            Access administrative controls and user management
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.replace("/(auth)/(drawer)/(ai-chat)/new")}
        >
          <Ionicons name="person" size={32} color="#10B981" />
          <Text style={styles.optionTitle}>User Interface</Text>
          <Text style={styles.optionDescription}>
            Continue to standard application features
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#1E293B'
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 40,
      color: '#F8FAFC'
    },
    optionCard: {
      width: '100%',
      backgroundColor: '#374151',
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 1
    },
    optionTitle: {
      fontSize: 18,
      fontWeight: '500',
      marginVertical: 12,
      color: '#F8FAFC'
    },
    optionDescription: {
      textAlign: 'center',
      color: '#A7B6C2',
      lineHeight: 20
    }
  });

  export default roleselect;