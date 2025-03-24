import { View, Image, Text, StyleSheet, Pressable } from "react-native";
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuItemTitle,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuArrow,
  ContextMenuGroup,
  ContextMenuCheckboxItem,
  ContextMenuSubTrigger,
  ContextMenuPreview,
  ContextMenuItemIndicator,
  ContextMenuSubContent,
  ContextMenuSub,
  ContextMenuSeparator,
} from './context-menu'

// Dummy user data (replace with your actual data source)
const user = {
  avatar: "https://example.com/avatar.jpg",
  name: "Jane Doe",
  username: "@janedoe",
};

export const MiniProfile = (props:any) => {
  return (
    <ContextMenuRoot>
      {/* Trigger: A button to open the context menu */}
      <ContextMenuTrigger>
        <Pressable style={styles.triggerButton}>
          <Text style={styles.triggerText}>Open Profile Menu</Text>
        </Pressable>
      </ContextMenuTrigger>

      {/* Content: The context menu with preview and items */}
      <ContextMenuContent>
        {/* Mini profile preview */}
        {/* <ContextMenuPreview>{() => <Preview />}</ContextMenuPreview> */}

        {/* Label for menu section */}
        <ContextMenuLabel>
          <Text style={styles.label}>Actions</Text>
        </ContextMenuLabel>

        {/* Individual menu item */}
        <ContextMenuItem key="Profile">
          <ContextMenuItemTitle style={styles.itemTitle}>
            View Profile
          </ContextMenuItemTitle>
        </ContextMenuItem>

        {/* Group of related items */}
        <ContextMenuGroup>
          <ContextMenuItem key="send-message">
            <ContextMenuItemTitle style={styles.itemTitle}>
              Send Message
            </ContextMenuItemTitle>
          </ContextMenuItem>
          <ContextMenuItem key="Follow">
            <ContextMenuItemTitle style={styles.itemTitle}>
              Follow
            </ContextMenuItemTitle>
          </ContextMenuItem>
        </ContextMenuGroup>

        {/* Checkbox item for toggleable options */}
        <ContextMenuCheckboxItem key="mute" value={false}>
          <ContextMenuItemTitle style={styles.itemTitle}>
            Mute Notifications
          </ContextMenuItemTitle>
          <ContextMenuItemIndicator />
        </ContextMenuCheckboxItem>

        {/* Submenu for additional options */}
        <ContextMenuSub>
          <ContextMenuSubTrigger key="more">
            <ContextMenuItemTitle style={styles.itemTitle}>
              More Options
            </ContextMenuItemTitle>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent style={styles.menuContent}>
            <ContextMenuItem key="Profile">
              <ContextMenuItemTitle style={styles.itemTitle}>
                Block User
              </ContextMenuItemTitle>
            </ContextMenuItem>
            <ContextMenuItem key="Report">
              <ContextMenuItemTitle style={styles.itemTitle}>
                Report
              </ContextMenuItemTitle>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Separator for visual distinction */}
        <ContextMenuSeparator />

        {/* Additional item */}
        <ContextMenuItem key="Share">
          <ContextMenuItemTitle style={styles.itemTitle}>
            Share Profile
          </ContextMenuItemTitle>
        </ContextMenuItem>

        {/* Arrow (web-specific, optional) */}
        <ContextMenuArrow />
      </ContextMenuContent>
    </ContextMenuRoot>
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

