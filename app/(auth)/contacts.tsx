import { useQuery, useMutation } from "convex/react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, TouchableOpacity, Alert } from "react-native";
import Colors from "~/constants/Colors";
import { api } from "~/convex/_generated/api";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationMenu } from "~/components/ui/navigation-menu";
import Navbar from "~/components/ui/navbar";
// import { useConvexUser } from "~/utils/UserContext";



export default function Contacts() {
  // const [ currentUser , setCurrentUser ] = useConvexUser();
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const contactsData = useQuery(api.users.getContacts);
  const assignDoctor = useMutation(api.users.assignDoctor);
  const getorcreateChat = useMutation(api.chats.getOrCreateChat);
  const insets = useSafeAreaInsets();

  // Handle loading and errors
  if (!currentUser || !contactsData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Extract doctors and dieticians from contacts data
  const doctors = contactsData.doctors || [];
  const dieticians = contactsData.dieticians || [];

  const handleAssignDoctor = async () => {
    if (currentUser?.userId) {
      try {
        const result = await assignDoctor({ userId: currentUser.userId });
        console.log("Assigned Doctor ID:", result.assignedDoctorId);
      } catch (error) {
        console.error("Error assigning doctor:", error);
      }
    }
  };

  const handleContactPress = async (contactUserId:any) => {
    if (!currentUser?.userId) return;

    try {
      // Get or create chat between current user and contact
      const chatId = await getorcreateChat({
        isAi: false,
        type: "private",
        participantIds: [contactUserId],
      });
      
      // Navigate to the chat using the actual chat ID
      router.push(`/(auth)/(drawer)/(private-chat)/${chatId}`);
    } catch (error) {
      console.error("Error creating/finding chat:", error);
      Alert.alert("Error", "Could not start conversation");
    }
  };

  return (
    <View style={[styles.container,{marginTop:insets.top}]}>
      <View>
        <Navbar/>
      </View>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="account-box-multiple" size={28} color={Colors.primary} />
        <Text style={styles.header}>My Care Team</Text>
      </View>

      <TouchableOpacity style={styles.assignButton} onPress={handleAssignDoctor}>
        <MaterialCommunityIcons name="doctor" size={20} color="white" />
        <Text style={styles.buttonText}>Request New Doctor</Text>
      </TouchableOpacity>

      {/* Doctors Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <MaterialCommunityIcons name="stethoscope" size={20} color={Colors.primary} />
          <Text style={styles.sectionHeader}>Medical Team</Text>
        </View>
        {doctors.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color={Colors.grey} />
            <Text style={styles.noContactsText}>No assigned doctors</Text>
          </View>
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(item:any) => item!.userId}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleContactPress(item!._id!)}
              >
                <View style={styles.contactIcon}>
                  <MaterialCommunityIcons name="account-circle" size={32} color={Colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item!.name}</Text>
                  <Text style={styles.contactRole}>{item!.role || "General Physician"}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Dieticians Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <MaterialCommunityIcons name="nutrition" size={20} color={Colors.primary} />
          <Text style={styles.sectionHeader}>Nutrition Team</Text>
        </View>
        {dieticians.length === 0 ? (
          <Text style={styles.noContactsText}>No dieticians found</Text>
        ) : (
          <FlatList
            data={dieticians}
            keyExtractor={(item:any) => item!.userId}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleContactPress(item!._id!)}
              >
                <View style={styles.contactIcon}>
                  <MaterialCommunityIcons name="account-circle" size={32} color={Colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item!.name}</Text>
                  <Text style={styles.contactRole}>{item!.role || "Dietician"}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

// 🔹 Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef', // Subtle border
  },
  header: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
    color: '#212529', // Dark charcoal
  },
  assignButton: {
    flexDirection: 'row',
    backgroundColor: '#2d3436', // Dark button
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontWeight: '400',
    marginLeft: 10,
    fontSize: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#495057', // Muted header color
  },
  section: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef', // Subtle border instead of shadow
  },
  contactIcon: {
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 14,
    color: '#6c757d', // Muted gray
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noContactsText: {
    fontSize: 14,
    color: Colors.grey,
    marginLeft: 8,
  },
});
