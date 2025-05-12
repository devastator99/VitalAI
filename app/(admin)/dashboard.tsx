import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api"; // Adjust the path to your Convex API
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import  Image  from "@d11/react-native-fast-image";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import type { Doc, Id } from "~/convex/_generated/dataModel";

interface UserCardProps {
  user: Doc<"users">;
  openActionMenu: (userId: string) => void;
}

// UserCard Component to display individual user information
const UserCard = ({ user, openActionMenu }: UserCardProps) => {
  // Fetch the image URL if the user has a profile picture
  const imageUrl = user.profileDetails?.picture
    ? useQuery(api.files.getImageUrl, { storageId: user.profileDetails.picture })
    : null;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.userCard}>
      {/* User Info: Avatar, Name, Email */}
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              imageUrl ? { uri: imageUrl } : require("~/assets/images/asuka-2239.gif") // Default image path
            }
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.profileDetails?.email}</Text>
        </View>
      </View>

      {/* Status and Action Menu */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusPill,
            user.isApproved ? styles.approvedStatus : styles.pendingStatus,
          ]}
        >
          <Text style={styles.statusText}>
            {user.isApproved ? "Approved" : "Pending"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => openActionMenu(user._id)}
          style={styles.menuButton}
        >
          <MaterialIcons name="more-vert" size={24} color="#CBD5E0" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  // Convex queries to fetch admin status and user list
  const isAdmin = useQuery(api.users.getCurrentUserAdminStatus);
  const users = useQuery(api.users.getAllUsers) || [];
  const { showActionSheetWithOptions } = useActionSheet();
  const [openMenuId, setOpenMenuId] = useState(null);

  // Loading state
  if (isAdmin === undefined) {
    return <Text>Loading...</Text>;
  }

  // Authorization check
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Not Authorized</Text>
        <Text style={styles.statusText}>
          You do not have permission to view this dashboard.
        </Text>
      </View>
    );
  }

  // Handle user actions (approve/remove)
  const handleUserAction = (userId:any, action:any) => {
    setOpenMenuId(null);
    console.log(`Performing ${action} on ${userId}`);
    // TODO: Add Convex mutations here, e.g.:
    // useMutation(api.users.approveUser)({ userId });
    // useMutation(api.users.removeUser)({ userId });
  };

  // Open action menu for a user
  const openActionMenu = (userId:any) => {
    const user = users.find((u) => u._id === userId);
    const options = [
      "Remove User",
      ...(user?.isApproved ? ["Approve User"] : []),
      "Cancel",
    ];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: "User Actions",
        message: "Select an action to perform",
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            handleUserAction(userId, "remove");
            break;
          case 1:
            if (!user?.isApproved) {
              handleUserAction(userId, "approve");
            }
            break;
          default:
            break;
        }
      }
    );
  };

  // Render the dashboard
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>User Management</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            openActionMenu={openActionMenu}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Styles for the dashboard
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A202C",
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#F7FAFC",
    marginBottom: 30,
    fontFamily: "Inter-SemiBold", // Ensure this font is loaded in your app
  },
  userCard: {
    backgroundColor: "#2D3748",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    backgroundColor: "#4A5568",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#F7FAFC",
    fontFamily: "Inter-Medium", // Ensure this font is loaded
  },
  userEmail: {
    fontSize: 14,
    color: "#CBD5E0",
    marginTop: 2,
    fontFamily: "Inter-Regular", // Ensure this font is loaded
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  approvedStatus: {
    backgroundColor: "#48BB78",
  },
  pendingStatus: {
    backgroundColor: "#F6AD55",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#F7FAFC",
    fontFamily: "Inter-Medium", // Ensure this font is loaded
  },
  menuButton: {
    padding: 8,
  },
});

export default Dashboard;