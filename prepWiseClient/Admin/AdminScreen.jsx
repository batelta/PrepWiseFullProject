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
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {apiUrlStart} from '../api';


const AdminScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_300Light,
  });

  const API_URL = `${apiUrlStart}/api/MentorMatching/export-feature-data`;

  /*const handleDownload = async () => {
    if (Platform.OS === "web") {
      try {
        const response = await fetch(API_URL);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `features_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert("הקובץ ירד בהצלחה ✅");
      } catch (error) {
        console.error(error);
        alert("ההורדה נכשלה ❌");
      }
    } else {
      try {
        const fileUri =
          FileSystem.documentDirectory + `features_${Date.now()}.csv`;
        const downloadRes = await FileSystem.downloadAsync(API_URL, fileUri);
        Alert.alert("הצלחה", "הקובץ ירד בהצלחה ✅");

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          Alert.alert("הערה", "שיתוף לא זמין על המכשיר הזה");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("שגיאה", "ההורדה נכשלה ❌");
      }
    }
  };*/

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