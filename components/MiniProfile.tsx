import { View, Text, StyleSheet, Pressable } from "react-native";
import * as ContextMenu from "zeego/context-menu";
import Image from "@d11/react-native-fast-image"; 
// Dummy user data (replace with your actual data source)
const user = {
  avatar: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  name: "Jane Doe",
  username: "@janedoe",
};

export const MiniProfile = (props: any) => {
  return (
    <ContextMenu.Root>
      {/* Trigger: A button to open the context menu */}
      <ContextMenu.Trigger>
        <Pressable style={styles.triggerButton}>
          <Text style={styles.triggerText}>Open Profile Menu</Text>
        </Pressable>
      </ContextMenu.Trigger>

      {/* Content: The context menu with preview and items */}
      <ContextMenu.Content>
        {/* Mini profile preview */}
        {/* <ContextMenuPreview>{() => <Preview />}</ContextMenuPreview> */}

        {/* Label for menu section */}
        <ContextMenu.Label>
          <Text style={styles.label}>Actions</Text>
        </ContextMenu.Label>

        {/* Individual menu item */}
        <ContextMenu.Item key="Profile" onSelect={() => { /* Handle view profile */ }}>
          <ContextMenu.ItemTitle style={styles.itemTitle}>
            View Profile
          </ContextMenu.ItemTitle>
        </ContextMenu.Item>

        {/* Group of related items */}
        <ContextMenu.Group>
          <ContextMenu.Item key="send-message" onSelect={() => { /* Handle send message */ }}>
            <ContextMenu.ItemTitle style={styles.itemTitle}>
              Send Message
            </ContextMenu.ItemTitle>
          </ContextMenu.Item>
          <ContextMenu.Item key="Follow" onSelect={() => { /* Handle follow */ }}>
            <ContextMenu.ItemTitle style={styles.itemTitle}>
              Follow
            </ContextMenu.ItemTitle>
          </ContextMenu.Item>
        </ContextMenu.Group>

        {/* Checkbox item for toggleable options */}
        <ContextMenu.CheckboxItem key="mute" value={false}>
          <ContextMenu.ItemTitle style={styles.itemTitle}>
            Mute Notifications
          </ContextMenu.ItemTitle>
          <ContextMenu.ItemIndicator />
        </ContextMenu.CheckboxItem>

        {/* Submenu for additional options */}
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger key="more">
            <ContextMenu.ItemTitle style={styles.itemTitle}>
              More Options
            </ContextMenu.ItemTitle>
          </ContextMenu.SubTrigger>
          <ContextMenu.SubContent style={styles.menuContent}>
            <ContextMenu.Item key="Block" onSelect={() => { /* Handle block user */ }}>
              <ContextMenu.ItemTitle style={styles.itemTitle}>
                Block User
              </ContextMenu.ItemTitle>
            </ContextMenu.Item>
            <ContextMenu.Item key="Report" onSelect={() => { /* Handle report */ }}>
              <ContextMenu.ItemTitle style={styles.itemTitle}>
                Report
              </ContextMenu.ItemTitle>
            </ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>

        {/* Separator for visual distinction */}
        <ContextMenu.Separator />

        {/* Additional item */}
        <ContextMenu.Item key="Share" onSelect={() => { /* Handle share profile */ }}>
          <ContextMenu.ItemTitle style={styles.itemTitle}>
            Share Profile
          </ContextMenu.ItemTitle>
        </ContextMenu.Item>

        {/* Arrow (web-specific, optional) */}
        <ContextMenu.Arrow />
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

// Styles for a beautiful design
const styles = StyleSheet.create({
  triggerButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  triggerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 10,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  username: {
    fontSize: 14,
    color: "#666",
  },
  menuContent: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  label: {
    fontSize: 14,
    color: "#999",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  itemTitle: {
    fontSize: 16,
    color: "#333",
  },
});

