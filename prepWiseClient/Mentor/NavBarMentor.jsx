import React from "react";
import { Platform, View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from '@expo-google-fonts/inter';
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import Menu from '../Menu'; // ייבוא הקומפוננטה החדשה

const mobileNavItems = [
  { name: "Home", screen: "HomePageMentor" },
  { name: "Messenger", screen: "MessagesScreen"},
  { name: "My Meetups", screen: "MentorOffers" },
  { name: "My Matches", screen: "AllUserMatches" },
  { name: "Profile", screen: "Profile" },
  { name: "Menu", screen: "Menu" }, // הסרנו את ה-disabled
];

const Tab = createBottomTabNavigator();

const MobileNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Track which tab is currently selected for highlighting
  const [activeTab, setActiveTab] = React.useState("Home");
  // State for hamburger menu
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  
  // Map screen names to tab names for synchronization
  const screenToTabMap = {};
  mobileNavItems.forEach(item => {
    screenToTabMap[item.screen] = item.name;
  });
  
  // Check if current route matches any of our screens on mount and route change
  React.useEffect(() => {
    const currentRouteName = route.name;
    if (screenToTabMap[currentRouteName]) {
      setActiveTab(screenToTabMap[currentRouteName]);
    }
  }, [route]);

  const handleTabPress = (item) => {
    if (item.name === "Menu") {
      // פתיחת תפריט המבורגר במקום ניווט
      setIsMenuVisible(true);
    } else if (!item.disabled) {
      // Update active tab for highlighting
      setActiveTab(item.name);
      // Navigate to the actual screen
      navigation.navigate(item.screen);
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, size }) => {
            // Use both the focused state and our custom activeTab state
            const isActive = route.name === activeTab;
            const iconColor = "#003D5B";
            let iconName;
            
            if (route.name === "Home") iconName = isActive ? "home" : "home-outline";
            else if (route.name === "Messenger") iconName = isActive ? "chatbubble" : "chatbubble-outline";
            else if (route.name === "My Meetups") iconName = isActive ? "videocam-outline" : "videocam";
            else if (route.name === "My Matches") iconName = isActive ? "magnet" : "magnet-outline";
            else if (route.name === "Profile") iconName = isActive ? "person" : "person-outline";
            else if (route.name === "Menu") iconName = isActive ? "menu" : "menu-outline";
            
            return <Ionicons name={iconName} size={size} color={iconColor} />;
          },
          tabBarLabelStyle: {
            color: "#003D5B",
            fontSize: 9,
            textAlign: "center",
            width: 60,
          },
          tabBarStyle: styles.tabBar,
          headerShown: false,
        })}
      >
        {mobileNavItems.map((item) => {
          const EmptyComponent = () => null;
          
          return (
            <Tab.Screen
              key={item.name}
              name={item.name}
              component={EmptyComponent}
              listeners={{
                tabPress: e => {
                  // Always prevent default to handle navigation manually
                  e.preventDefault();
                  handleTabPress(item);
                }
              }}
            />
          );
        })}
      </Tab.Navigator>
      
      {/* תפריט המבורגר */}
      <HamburgerMenu 
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        navigation={navigation}
      />
    </>
  );
};

const WebNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [hovered, setHovered] = React.useState("");
  const [isMenuVisible, setIsMenuVisible] = React.useState(false); // הוספנו state לתפריט

  const navItems = [
    { name: "Home", screen: "HomePageMentor" },
    { name: "Messenger", screen: "MessagesScreen" },
    { name: "My Meetups", screen: "MentorOffers" },
    { name: "My Matches", screen: "AllUserMatches"},
    { name: "Profile", screen: "Profile" },
    { name: "Menu", screen: "Menu" , disabled: false}, // הסרנו את ה-disabled
  ];

  const handleNavItemPress = (item) => {
    if (item.name === "Menu") {
      setIsMenuVisible(true);
    } else if (!item.disabled) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <>
      <View style={styles.webNavContainer}>
        <View style={styles.webNav}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/prepWise Logo.png")} style={styles.logo} />
          </View>
          <View style={styles.navLinks}>
            {navItems.map((item) => {
              const isActive = route.name === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  onPress={() => handleNavItemPress(item)}
                  onMouseEnter={() => setHovered(item.screen)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Text
                    style={[
                      styles.link,
                      (hovered === item.screen || isActive) && styles.linkHover,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
      
      {/* תפריט המבורגר לאינטרנט */}
      <Menu 
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        navigation={navigation}
      />
    </>
  );
};

const NavBarMentor = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
  });

  if (!fontsLoaded) return null;
  return Platform.OS === "web" ? <WebNavBar /> : <MobileNavBar />;
};

const styles = StyleSheet.create({
  // Mobile tabBar styling
  tabBar: {
    backgroundColor: "#BFB4FF",
    height: 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webNavContainer: {
    width: "100%",
    backgroundColor: "#fff",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  webNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: "1%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logo: {
    height: 70,
    width: 120,
    marginRight: 10,
    resizeMode: "contain",
  },
  navLinks: {
    flexDirection: "row",
    gap: 20,
  },
  link: {
    textDecorationLine: "none",
    color: "#003D5B",
    fontSize: 16,
    fontFamily: "Inter_200ExtraLight",
  },
  linkHover: {
    borderBottomWidth: 2,
    borderBottomColor: "#BFB4FF",
  },
});

export default NavBarMentor;