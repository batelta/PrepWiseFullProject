import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import NavBar from "../NavBar";
import { apiUrlStart } from "../api";

import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

//const apiUrlStart = "https://localhost:7137";

const AdminScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_300Light,
  });

  const API_URL = `${apiUrlStart}/api/MentorMatching/export-feature-data`;

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <NavBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🎛️ Admin Dashboard</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("WeightAnalytics")}
        >
          <Text style={styles.buttonText}>📊 Weights Analytics Page</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("AdminAllUsers")}
        >
          <Text style={styles.buttonText}>👤 View All Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("AdminAllApplications")}
        >
          <Text style={styles.buttonText}>📄 View All Applications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("HomePage")}
        >
          <Text style={styles.buttonText}>🏠 Go to Home Page</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#163349",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#b9a7f2",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: "#b9a7f2",
    fontFamily: "Inter_400Regular",
  },
});