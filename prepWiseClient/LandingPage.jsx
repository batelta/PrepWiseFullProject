import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Animated, Pressable } from "react-native";
import { Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient"; 
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_700Bold, Inter_100Thin, Inter_200ExtraLight, Inter_300Light } from '@expo-google-fonts/inter';

export default function LandingPage({ navigation }) {
  const [isHovered, setIsHovered] = useState(false);
  const [fillWidth] = useState(new Animated.Value(0)); 

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light
  });

  // Function to animate width from 0 to 100% on hover
  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.timing(fillWidth, {
      toValue: 1, // 100% width
      duration: 500, // Duration of animation
      useNativeDriver: false, // Since we're animating width, set to false
    }).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.timing(fillWidth, {
      toValue: 0, // 0% width
      duration: 500, // Duration of animation
      useNativeDriver: false, // Since we're animating width, set to false
    }).start();
  };

  return (
    <LinearGradient colors={['#F5EFFF', '#fff']} style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require("./assets/LogoTransparent.png")} style={styles.logo} />
        <View style={styles.navLeft}>
          <Button
            mode="outlined"
            onPress={() => { navigation.navigate('SignIn') }}
            style={styles.navButton}
            labelStyle={styles.navButtonText}
          >
            Sign In
          </Button>
          <Button
            mode="contained"
            onPress={() => { navigation.navigate('SignUp') }}
            labelStyle={styles.getStartedButtonText}
            style={styles.getStartedButton}
          >
            Get Started
          </Button>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.TextContainer}>
          <Text style={styles.heading}>Welcome to Prepwise</Text>
          <Text style={styles.description}>
            Your all-in-one platform to prepare for job interviews with real mentors and AI-powered simulations.
          </Text>
          {/* Get Started Button */}
          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            style={styles.mainButton}
          >
            <Animated.View
              style={[
                styles.buttonFill,
                { width: fillWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }, // Fill width
              ]}
            />
            <Text style={styles.mainButtonText}>Get Started</Text>
          </Pressable>
        </View>
        <Image source={require("./assets/landingPageImage.png")} style={styles.landingImage} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  navbar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "absolute",
    top: 0,
    height: 60,
    zIndex: 10,
  },
  navButtonText: {
    color: "#003D5B",
    fontFamily: "Inter_300Light",
  },
  getStartedButton: {
    backgroundColor: "white",
  },
  getStartedButtonText: {
    color: "#003D5B",
    fontFamily: "Inter_300Light"
  },
  navLeft: {
    flexDirection: "row",
    gap: 15,
  },
  navButton: {
    borderColor: "#003D5B",
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: "contain",
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  TextContainer: {
    flexDirection: "column",
    alignItems: "center", 
    maxWidth: "50%",
    padding: 10,
  },
  heading: {
    fontSize: 36,
    color: "#003D5B",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Inter_400Regular"
  },
  description: {
    fontSize: 18,
    color: "#003D5B",
    textAlign: "center",
    marginVertical: 20,
    fontFamily: "Inter_300Light"
  },
  mainButton: {
    backgroundColor: "#d6cbff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    width: 180,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  buttonFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#BFB4FF", // The color to fill on hover
    borderRadius: 25,
    zIndex: -1, // So it appears behind the text
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Inter_300Light"
  },
  landingImage: {
    width: "80%",
    resizeMode: "contain",
  },
});
