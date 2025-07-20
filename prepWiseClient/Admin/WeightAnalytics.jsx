import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import NavBar from "../NavBar";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Picker } from "@react-native-picker/picker";
import {
  Button,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import {apiUrlStart} from '../api';

const API_URL = `${apiUrlStart}/api/MentorMatching/export-feature-data`;

const WeightAnalytics = () => {
  const [graphList, setGraphList] = useState([]);
  const [summary, setSummary] = useState("");
  const [weights, setWeights] = useState([]);
  const [csvBase64, setCsvBase64] = useState("");

  const [availableVersions, setAvailableVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latestVersion, setLatestVersion] = useState(0);

  const [isVersionImported, setIsVersionImported] = useState(false);
  const [activeVersion, setActiveVersion] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_300Light,
  });

  /*useEffect(() => {
    const fetchVersionsAndGraphs = async () => {
      try {
        const res = await fetch(
          `${apiUrlStart}/api/MentorMatching/get-all-versions`
        );
        const data = await res.json();
        console.log("📢 versions data:", data);

        if (data.versions && data.versions.length > 0) {
          const versions = data.versions;
          const latest = versions[0];

          setAvailableVersions(versions);
          setLatestVersion(latest);
          setSelectedVersion(latest);

          await fetchGraphsForVersion(latest);
        }
      } catch (err) {
        console.error("❌ Failed to load versions", err);
      }
    };

    fetchVersionsAndGraphs();
  }, []);*/

  const fetchVersionsAndGraphs = async () => {
    try {
      const res = await fetch(
        `${apiUrlStart}/api/MentorMatching/get-all-versions`
      );
      const data = await res.json();
      console.log("📢 versions data:", data);

      setAvailableVersions(data.versions || []);

      if (data.versions && data.versions.length > 0) {
        const versions = data.versions;
        const latest = versions[0];

        setLatestVersion(latest);
        setSelectedVersion(latest);

        await fetchGraphsForVersion(latest);
      } else {
        // אם אין גרסאות — להוריד את הטעינה
        setIsLoading(false);
      }
    } catch (err) {
      console.error(" Failed to load versions", err);
      setAvailableVersions([]);
      setIsLoading(false);
    }

    const resActive = await fetch(
      `${apiUrlStart}/api/MentorMatching/get-active-version`
    );
    const dataActive = await resActive.json();
    setActiveVersion(dataActive.activeVersion);
  };

  useEffect(() => {
    fetchVersionsAndGraphs();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      const checkIfVersionImported = async () => {
        const res = await fetch(
          `${apiUrlStart}/api/MentorMatching/is-version-imported/${selectedVersion}`
        );
        const data = await res.json();
        setIsVersionImported(data.exists);
      };

      checkIfVersionImported();
    }
  }, [selectedVersion]);

  /*const refreshActiveVersion = async () => {
    try {
      const resActive = await fetch(
        `${apiUrlStart}/api/MentorMatching/get-active-version`
      );
      const dataActive = await resActive.json();
      setActiveVersion(dataActive.activeVersion);
    } catch (error) {
      console.error("Error refreshing active version:", error);
    }
  };*/

  const refreshIsVersionImported = async (version) => {
    const res = await fetch(
      `${apiUrlStart}/api/MentorMatching/is-version-imported/${version}`
    );
    const data = await res.json();
    setIsVersionImported(data.exists);
  };

  const fetchGraphsForVersion = async (version) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${apiUrlStart}/api/MentorMatching/get-graphs/${version}`
      );
      const result = await res.json();

      console.log(`Loaded graphs for version ${version}`, result);

      setGraphList(result.graphList || []);
      setSummary(result.summary || "");
      setWeights(result.weights || []);
      setCsvBase64(result.csv_base64 || "");
      setSelectedVersion(version);
    } catch (err) {
      console.error(" Failed loading graphs:", err);
      setGraphList([]);
      setSummary("");
      setWeights([]);
      setCsvBase64("");
    } finally {
      setIsLoading(false);
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
        const newVersion = result.version;
        console.log("✅ New version created:", newVersion);
        // Update state
        setLatestVersion(newVersion);
        setSelectedVersion(newVersion);

        // Load graphs for new version
        await fetchGraphsForVersion(newVersion);

        // Reload available versions
        await fetchVersionsAndGraphs();
      } else {
        const fileUri =
          FileSystem.documentDirectory + `features_${Date.now()}.csv`;
        const downloadRes = await FileSystem.downloadAsync(API_URL, fileUri);

        await uploadCsvAndGetGraph(downloadRes.uri);

        // Also reload available versions
        await fetchVersionsAndGraphs();
      }
    } catch (error) {
      console.error("Error creating new version:", error);
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
  };

  if (!fontsLoaded) return null;

  return isLoading ? (
    <View style={[styles.container, styles.loadingContainer]}>
      <NavBar />
      <ActivityIndicator animating={true} size="large" color="#b9a7f2" />
      <Text style={{ marginTop: 10, color: "#163349" }}>Loading...</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <NavBar />
      <View style={styles.splitView}>
        {/* Left panel */}
        <View style={styles.leftPanel}>
          <Title style={styles.panelTitle}>Manage Versions</Title>

          {activeVersion !== null && (
            <Text style={{ marginBottom: 10, color: "#163349", fontSize: 16 }}>
              Current Active Version: {activeVersion}
            </Text>
          )}

          <Button
            mode="contained"
            style={styles.button}
            onPress={handleDownload}
          >
            📥 Get Current Weights Version
          </Button>

          <Button
            mode="contained"
            style={styles.button}
            onPress={handleDownloadAndUpload}
          >
            📊 Create New Weights Version
          </Button>
        </View>

        {/* Right panel */}
        <ScrollView contentContainerStyle={styles.rightPanel}>
          <Title style={styles.title}>Weight Analytics</Title>

          {availableVersions.length === 0 ? (
            <Paragraph style={{ marginTop: 20, fontSize: 16 }}>
              No versions available yet. Please create a new weights version
              first.
            </Paragraph>
          ) : (
            <View style={{ marginVertical: 20, width: "80%" }}>
              <Text style={styles.versionLabel}>Select Version to View:</Text>
              <Picker
                selectedValue={selectedVersion}
                onValueChange={(itemValue) => fetchGraphsForVersion(itemValue)}
                style={{
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#b9a7f2",
                }}
              >
                {availableVersions.map((version, index) => (
                  <Picker.Item
                    key={index}
                    label={`Version ${version}`}
                    value={version}
                  />
                ))}
              </Picker>
            </View>
          )}

          {/* Summary & Recommendations */}
          {(summary || weights.length > 0) && (
            <View style={styles.summarySection}>
              <Title style={styles.sectionTitle}>
                Summary & Recommendations
              </Title>

              {summary && (
                <View style={styles.summaryBox}>
                  <Paragraph style={styles.summaryText}>{summary}</Paragraph>
                </View>
              )}

              {weights.length > 0 && (
                <View style={{ marginTop: 20, width: "90%" }}>
                  <Title style={styles.weightsTitle}>
                    🔢 New Recommended Weights
                  </Title>
                  {weights.map((w, i) => (
                    <View key={i} style={styles.weightRow}>
                      <Text style={styles.weightLabel}>{w.ParameterName}</Text>
                      <Text style={styles.weightValue}>{w.NewWeight}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Graphs Section */}
          {graphList.length > 0 && (
            <View style={styles.graphsSection}>
              <Title style={styles.sectionTitle}>Graphs</Title>
              {graphList.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: `data:image/png;base64,${img}` }}
                  style={{ width: 320, height: 220, marginTop: 20 }}
                  resizeMode="contain"
                />
              ))}
            </View>
          )}

          {/* CSV download */}
          {Platform.OS === "web" && csvBase64 && (
            <Button
              mode="contained"
              style={styles.downloadCsvButton}
              onPress={() => {
                const link = document.createElement("a");
                link.href = `data:text/csv;base64,${csvBase64}`;
                link.download = "new_weights_recommendations.csv";
                link.click();
              }}
            >
              ⬇️ Download New Recommendations Table
            </Button>
          )}

          {/*  {isVersionImported ? (
            <Button
              mode="contained"
              style={styles.button}
              onPress={async () => {
                await fetch(
                  `${apiUrlStart}/api/MentorMatching/set-active-version/${selectedVersion}`,
                  {
                    method: "POST",
                  }
                );

                // עדכון סטייט בלקוח
                setActiveVersion(selectedVersion);
                setIsVersionImported(true);

                alert(`Version ${selectedVersion} set as active ✅`);
              }}
            >
              ⭐ Set Version as Active
            </Button>
          ) : (
            <Button
              mode="contained"
              style={styles.button}
              onPress={async () => {
                await fetch(
                  `${apiUrlStart}/api/MentorMatching/import-weights/${selectedVersion}`,
                  {
                    method: "POST",
                  }
                );
                alert(
                  `Weights from version ${selectedVersion} imported and set as active ✅`
                );
                // רענון סטייט אחרי טעינה
                setIsVersionImported(true);
              }}
            >
              📥 Load Weights to DB
            </Button>
          )}*/}
          {activeVersion === selectedVersion ? (
            <Text
              style={{ marginTop: 20, color: "#4CAF50", fontWeight: "bold" }}
            >
              ✅ This version is currently active
            </Text>
          ) : isVersionImported ? (
            <Button
              mode="contained"
              style={styles.button}
              onPress={async () => {
                await fetch(
                  `${apiUrlStart}/api/MentorMatching/set-active-version/${selectedVersion}`,
                  { method: "POST" }
                );

                alert(`Version ${selectedVersion} set as active ✅`);
              }}
            >
              ⭐ Set Version as Active
            </Button>
          ) : (
            <Button
              mode="contained"
              style={styles.button}
              onPress={async () => {
                await fetch(
                  `${apiUrlStart}/api/MentorMatching/import-weights/${selectedVersion}`,
                  { method: "POST" }
                );

                alert(
                  `Weights from version ${selectedVersion} imported and set as active ✅`
                );
              }}
            >
              📥 Load Weights to DB
            </Button>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default WeightAnalytics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  splitView: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    width: 300,
    backgroundColor: "#f9f9f9",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    padding: 20,
  },
  rightPanel: {
    padding: 20,
    alignItems: "center",
  },
  panelTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: "#163349",
  },
  title: {
    fontSize: 24,
    color: "#163349",
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#b9a7f2",
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  versionLabel: {
    marginBottom: 8,
    fontSize: 16,
    textAlign: "left",
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
  },
  weightValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  downloadCsvButton: {
    marginTop: 20,
  },

  summarySection: {
    marginTop: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
    alignItems: "center",
  },

  graphsSection: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    marginBottom: 15,
    color: "#163349",
  },
});