import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { syncUserToFirebase } from "../../utils/UserSync";
import { StatusBar } from "expo-status-bar";

export default function TabLayout() {
  const { user } = useUser();
  useEffect(() => {
    if (user) {
      syncUserToFirebase(user);
    }
  }, [user]);

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.PRIMARY,
          tabBarInactiveTintColor: "#000",
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            elevation: 0,
            backgroundColor: "rgba(255,255,255,0.6)",
            borderTopWidth: 0,
            height: Platform.OS === "android" ? 55 : 65,
            paddingTop: 5,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={100}
              experimentalBlurMethod="dimezisBlurView"
              style={{ flex: 1 }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={26.5} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Settings"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="cog" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
