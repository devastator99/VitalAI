import type { TextRef } from "@rn-primitives/types";
import { useNavigation } from "expo-router";
import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { Text } from "~/components/ui/text";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "~/lib/utils";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/alert-dialog/alert-dialog-universal",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  // Add more components as needed
];

const Navbar = () => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const [value, setValue] = React.useState<string>();
  const navigation = useNavigation();

  function closeAll() {
    setValue("");
  }

  React.useEffect(() => {
    const sub = navigation.addListener("blur", () => {
      closeAll();
    });

    return sub;
  }, [navigation]);

  return (
    <>
      {Platform.OS !== "web" && !!value && (
        <Pressable
          onPress={() => {
            setValue("");
          }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <NavigationMenu value={value} onValueChange={setValue}>
        <NavigationMenuList>
          <NavigationMenuItem value="getting-started">
            <NavigationMenuTrigger className="group transition-colors hover:bg-accent/50 data-[state=open]:bg-accent/50">
              <View className="flex flex-row items-center gap-1">
                <Text className="font-medium text-foreground/90">Getting started</Text>
                <MaterialIcons
                  name={value === "getting-started" ? "expand-less" : "expand-more"}
                  size={16}
                  className="text-foreground/80 transition-transform group-data-[state=open]:rotate-180"
                />
              </View>
            </NavigationMenuTrigger>
            <NavigationMenuContent insets={contentInsets}>
              <View className="web:grid gap-3 p-6 md:w-[400px] lg:w-[500px] web:lg:grid-cols-[.75fr_1fr] rounded-lg border border-border/50 bg-background/95 web:shadow-lg web:backdrop-blur">
                <View role="listitem" className="web:row-span-3">
                  <NavigationMenuLink asChild>
                    <View className="flex web:select-none flex-col justify-end rounded-md web:bg-gradient-to-b web:from-muted/50 web:to-muted native:border native:border-border p-6 web:no-underline web:outline-none web:focus:shadow-md web:focus:shadow-foreground/5">
                      <MaterialIcons
                        name="star"
                        size={16}
                        className="text-foreground"
                      />
                      <Text className="mb-2 mt-4 text-lg native:text-2xl font-medium">
                        react-native-reusables
                      </Text>
                      <Text className="text-sm native:text-base leading-tight text-muted-foreground">
                        Universal components that you can copy and paste into
                        your apps. Accessible. Customizable. Open Source.
                      </Text>
                    </View>
                  </NavigationMenuLink>
                </View>
                <ListItem href="/docs" title="Introduction">
                  <Text>
                    Re-usable components built using Radix UI on the web and
                    Tailwind CSS.
                  </Text>
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  <Text>
                    How to install dependencies and structure your app.
                  </Text>
                </ListItem>
                <ListItem href="/docs/typography" title="Typography">
                  <Text>Styles for headings, paragraphs, lists...etc</Text>
                </ListItem>
              </View>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="components">
            <NavigationMenuTrigger className="group transition-colors hover:bg-accent/50 data-[state=open]:bg-accent/50">
              <View className="flex flex-row items-center gap-1">
                <Text className="font-medium text-foreground/90">Components</Text>
                <MaterialIcons
                  name={value === "components" ? "expand-less" : "expand-more"}
                  size={16}
                  className="text-foreground/80 transition-transform group-data-[state=open]:rotate-180"
                />
              </View>
            </NavigationMenuTrigger>
            <NavigationMenuContent insets={contentInsets}>
              <View className="web:grid w-[400px] gap-1 p-2 md:w-[500px] web:md:grid-cols-2 lg:w-[600px] rounded-lg border border-border/50 bg-background/95 web:shadow-lg web:backdrop-blur">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </View>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="documentation">
            <NavigationMenuLink
              onPress={closeAll}
              className={navigationMenuTriggerStyle()}
            >
              <Text>Documentation</Text>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};

const ListItem = React.forwardRef<
  View,
  Omit<React.ComponentPropsWithoutRef<typeof Text>, 'style'> & {
    title: string;
    href: string;
  }
>(({ className, title, children, ...props }, ref) => {
  return (
    <View role="listitem">
      <NavigationMenuLink
        ref={ref as React.Ref<View>}
        className={cn(
          "gap-1 rounded-md p-3 no-underline transition-colors",
          "hover:bg-accent/10 active:bg-accent/20",
          "web:focus:bg-accent/10 web:focus:shadow-sm web:focus:shadow-foreground/10",
          "border-l-4 border-transparent web:focus:border-primary",
          className
        )}
        {...props as any}
      >
        <Text className="text-sm native:text-base font-medium text-foreground/90 leading-none">
          {title}
        </Text>
        <Text className="line-clamp-2 text-sm native:text-base leading-snug text-muted-foreground/80">
          {children}
        </Text>
      </NavigationMenuLink>
    </View>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
