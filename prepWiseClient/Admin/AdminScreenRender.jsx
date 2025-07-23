import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  Image,
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
import { apiUrlStart } from "../api";

//const apiUrlStart = "https://localhost:7137";

const API_URL = `${apiUrlStart}/api/MentorMatching/export-feature-data`;

const AdminScreenRender = ({ navigation }) => {
  const [graphList, setGraphList] = useState([]);
  const [summary, setSummary] = useState("");
  const [weights, setWeights] = useState([]);
  const [csvBase64, setCsvBase64] = useState("");

  const [latestVersion, setLatestVersion] = useState(0);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_300Light,
  });

  useEffect(() => {
    const fetchLatestVersionAndGraphs = async () => {
      const versionRes = await fetch(
        `${apiUrlStart}/api/MentorMatching/get-latest-version`
      );
      const versionData = await versionRes.json();
      console.log("🔢 Fetched latest version:", versionData.version);
      setLatestVersion(versionData.version);

      const res = await fetch(
        `${apiUrlStart}/api/MentorMatching/get-graphs/${versionData.version}`
      );

      if (res.ok) {
        const result = await res.json();
        setGraphList(result.graphList || []);
        setSummary(result.summary || "");
        setWeights(result.weights || []);
        setCsvBase64(result.csv_base64 || "");
        console.log("✅ Loaded graphs for version", versionData.version);
      } else {
        console.log("⚠️ No graphs found for version", versionData.version);
        setGraphList([]);
        setSummary("");
        setWeights([]);
        setCsvBase64("");
      }
    };

    fetchLatestVersionAndGraphs();
  }, []);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await fetch(
          `${apiUrlStart}/api/MentorMatching/get-all-versions`
        );
        const data = await res.json();

        setAvailableVersions(data.versions || []);
        if (data.versions && data.versions.length > 0) {
          setSelectedVersion(data.versions[0]); // הגרסה הכי חדשה
          await fetchGraphsForVersion(data.versions[0]);
        }
      } catch (err) {
        console.error("❌ Failed to load versions", err);
      }
    };

    fetchVersions();
  }, []);

  const loadLatestGraphs = async () => {
    try {
      const versionRes = await fetch(
        `${apiUrlStart}/api/MentorMatching/get-latest-version`
      );
      const versionData = await versionRes.json();

      const version = versionData.version;
      console.log("🔢 Latest version:", version);

      const res = await fetch(
        `${apiUrlStart}/api/MentorMatching/get-graphs/${version}`
      );

      if (res.ok) {
        const result = await res.json();
        setGraphList(result.graphList || []);
        setSummary(result.summary || "");
        setWeights(result.weights || []);
        setCsvBase64(result.csv_base64 || "");
        console.log("✅ Loaded graphs for version", version);
      } else {
        console.log("⚠️ No graphs found for version", version);
        setGraphList([]);
        setSummary("");
        setWeights([]);
        setCsvBase64("");
      }
    } catch (err) {
      console.error("⚠️ Failed loading latest graphs:", err);
    }
  };

  const handleDownloadAndUpload = async () => {
    try {
      if (Platform.OS === "web") {
        const response = await fetch(API_URL);
        const blob = await response.blob();
        const file = new File([blob], "features.csv", { type: "text/csv" });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("version", latestVersion + 1);

        const res = await fetch(
          `${apiUrlStart}/api/MentorMatching/run-analysis`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
            body: formData,
          }
        );

        const result = await res.json();

        setGraphList(result.graphList || []);
        setSummary(result.summary || "");
        setWeights(result.weights || []);
        setCsvBase64(result.csv_base64 || "");

        // עדכון ה־latestVersion אחרי שהוספנו גרסה חדשה
        setLatestVersion(latestVersion + 1);
      } else {
        const fileUri =
          FileSystem.documentDirectory + `features_${Date.now()}.csv`;
        const downloadRes = await FileSystem.downloadAsync(API_URL, fileUri);
        await uploadCsvAndGetGraph(downloadRes.uri);
      }
    } catch (error) {
      console.error("שגיאה כללית:", error);
      Alert.alert("שגיאה", "הפעולה נכשלה ❌");
    }
  };

  const uploadCsvAndGetGraph = async (input) => {
    const formData = new FormData();

    if (Platform.OS === "web") {
      // input הוא Blob
      formData.append("file", input, "data.csv");
    } else {
      formData.append("file", {
        uri: input,
        name: "data.csv",
        type: "text/csv",
      });
    }

    try {
      const res = await fetch(
        `${apiUrlStart}/api/MentorMatching/run-analysis`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const result = await res.json();

      setGraphList(result.graphList || []);
      setSummary(result.summary || "");
      setWeights(result.weights || []);
      setCsvBase64(result.csv_base64 || "");
      setLatestVersion(result.version);
    } catch (err) {
      console.error("Error uploading CSV:", err);
    }
  };

  const handleDownload = async () => {
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
        await uploadCsvAndGetGraph(blob);
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
        await uploadCsvAndGetGraph(downloadRes.uri);

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
  };

  if (!fontsLoaded) return null;

  /*const loadSavedGraphs = async () => {
    const res = await fetch(
      `${apiUrlStart}/api/MentorMatching/get-graphs/${userId}`
    );

    if (res.ok) {
      const result = await res.json();
      setGraphList(result.graphList || []);
      setSummary(result.summary || "");
      setWeights(result.weights || []);
      setCsvBase64(result.csv_base64 || "");
    } else {
      console.log("⚠️ No saved graphs yet");
    }
  };*/

  return (
    <View style={styles.container}>
      <NavBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🎛️ Admin Dashboard</Text>

        <TouchableOpacity style={styles.button} onPress={handleDownload}>
          <Text style={styles.buttonText}>📥 Download & Analyze CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleDownloadAndUpload}
        >
          <Text style={styles.buttonText}>📊 צור גרפים מהקובץ</Text>
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

        {/* ✅ גרפים */}
        {graphList.length > 0 &&
          graphList.map((img, i) => (
            <Image
              key={i}
              source={{ uri: `data:image/png;base64,${img}` }}
              style={{ width: 320, height: 220, marginTop: 20 }}
              resizeMode="contain"
            />
          ))}

        {/* ✅ טקסט סיכום */}
        {summary && (
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryText, { fontSize: 18 }]}>
              {summary}
            </Text>
          </View>
        )}

        {/* ✅ טבלת משקלים */}
        {weights.length > 0 && (
          <View style={{ marginTop: 20, width: "90%" }}>
            <Text style={styles.weightsTitle}>🔢 New Recommended Weights</Text>
            {weights.map((w, i) => (
              <View key={i} style={styles.weightRow}>
                <Text style={styles.weightLabel}>{w.ParameterName}</Text>
                <Text style={styles.weightValue}>{w.NewWeight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ✅ כפתור הורדה ל־Web */}
        {Platform.OS === "web" && csvBase64 && (
          <TouchableOpacity
            style={styles.downloadCsvButton}
            onPress={() => {
              const link = document.createElement("a");
              link.href = `data:text/csv;base64,${csvBase64}`;
              link.download = "new_weights_recommendations.csv";
              link.click();
            }}
          >
            <Text style={{ color: "white" }}>
              ⬇️ Download New Recommendtion
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminScreenRender;

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
  summaryBox: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    marginTop: 20,
    borderRadius: 8,
    maxWidth: "90%",
  },
  summaryText: {
    fontSize: 16,
    color: "#163349",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  weightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#163349",
  },
  weightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  weightLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  weightValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontWeight: "bold",
  },
  downloadCsvButton: {
    marginTop: 20,
    backgroundColor: "#b9a7f2",
    padding: 10,
    borderRadius: 6,
  },
});