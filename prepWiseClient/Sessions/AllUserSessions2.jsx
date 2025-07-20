import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Provider as PaperProvider, Button } from "react-native-paper";
import NavBar from "../NavBar";
import CustomPopup from "../CustomPopup";
import GeminiChat from "../GeminiChat";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { useContext } from "react";
import { UserContext } from "../UserContext";

export default function AllUserSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  //const [viewArchived, setViewArchived] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    icon: "information",
    isConfirmation: false,
    onConfirm: () => {},
    onOk: () => {},
  });

  const showMessage = (message, icon = "information", onOk = () => {}) => {
    setPopup({
      visible: true,
      message,
      icon,
      isConfirmation: false,
      onConfirm: () => {},
      onOk,
    });
  };

  const showConfirmation = (message, onConfirm, icon = "alert-circle") => {
    setPopup({
      visible: true,
      message,
      icon,
      isConfirmation: true,
      onConfirm,
      onOk: () => {},
    });
  };

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, visible: false }));
  };

  const { Loggeduser } = useContext(UserContext);

  const [showChat, setShowChat] = useState(false);
  const appliedStyles = Platform.OS === "web" ? Webstyles : styles;

  useEffect(() => {
    const fetchSessions = async () => {
      if (!Loggeduser?.id) {
        navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
        return;
      }

      try {
        const baseURL =
          Platform.OS === "web"
            ? "https://localhost:7137"
            : "http://192.168.30.157:7137";

        const response = await fetch(
          `${baseURL}/api/sessions/user/${Loggeduser.id}`
        );
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error("❌ Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [Loggeduser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#666" />
        <Text>Loading sessions...</Text>
      </View>
    );
  }

  /*const handleUnarchive = async (applicationID) => {
    try {
      const API_URL = `https://proj.ruppin.ac.il/igroup11/prod/api/JobSeekers/unarchiveById/${Loggeduser.id}/${applicationID}`;

      const response = await fetch(API_URL, { method: "PUT" });

      if (!response.ok) throw new Error("Failed to restore");

      setApplications((prev) =>
        prev.filter((app) => app.applicationID !== applicationID)
      );

      showMessage("Application restored successfully!", "check-circle");
    } catch (error) {
      console.error("Error restoring:", error);
      showMessage("Failed to restore application", "alert-circle");
    }
  };*/

  /*const handleDelete = async (applicationID) => {
    try {
      const API_URL = `https://proj.ruppin.ac.il/igroup11/prod/api/JobSeekers/deleteById/${Loggeduser.id}/${applicationID}`;

      const response = await fetch(API_URL, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete");

      setApplications((prev) =>
        prev.filter((app) => app.applicationID !== applicationID)
      );

      showMessage("Application archived successfully! You can restore it anytime", "check-circle");
    } catch (error) {
      showMessage("Failed to archive application", "alert-circle");
    }
  };*/

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>All Sessions</Text>

        {sessions.map((session) => (
          <View key={session.sessionID} style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("Session", {
                  sessionID: session.sessionID,
                })
              }
            >
              <View style={styles.row}>
                <MaterialIcons
                  name="event-available"
                  size={36}
                  color="#9FF9D5"
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={styles.title}>
                    {new Date(session.scheduledAt).toLocaleString()}
                  </Text>
                  <Text style={styles.company}>Status: {session.status}</Text>
                </View>
              </View>

              <MaterialIcons name="chevron-right" size={24} color="#9FF9D5" />
            </TouchableOpacity>
          </View>
        ))}

        <Button
          mode="contained"
          onPress={() => navigation.navigate("AddSession")}
          style={{ marginTop: 30 }}
        >
          Schedule New Session
        </Button>

        <TouchableOpacity
          style={styles.chatIcon}
          onPress={() => setShowChat(!showChat)}
        >
          <FontAwesome6 name="robot" size={24} color="#9FF9D5" />
        </TouchableOpacity>

        {showChat && (
          <View style={appliedStyles.overlay}>
            <View style={appliedStyles.chatModal}>
              <TouchableOpacity
                onPress={() => setShowChat(false)}
                style={{ alignSelf: "flex-end", padding: 5 }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>✖</Text>
              </TouchableOpacity>
              <GeminiChat />
            </View>
          </View>
        )}
      </ScrollView>

      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    minHeight: "100%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#163349",
  },
  cardContainer: {
    marginBottom: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  deleteIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    zIndex: 2,
  },
  card: {
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    padding: 15,
    paddingLeft: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#163349",
  },
  company: {
    fontSize: 14,
    color: "#555",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  wrapper: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  chatIcon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 12,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(159, 249, 213, 0.3)",
    marginBottom: 75,
  },
  chatModal: {
    position: "absolute",
    bottom: 80,
    right: 10,
    width: "90%",
    height: 500,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#b9a7f2",
    borderRadius: 5,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  activeToggle: {
    backgroundColor: "#b9a7f2",
  },

  toggleText: {
    color: "#163349",
    fontWeight: "600",
  },
  restoreIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 6,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#9FF9D5",
    zIndex: 2,
  },
});

const Webstyles = StyleSheet.create({
  chatIcon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 12,
    zIndex: 10,
  },
  chatModal: {
    position: "absolute",
    bottom: 0,
    right: 10,
    width: "40%",
    height: 450,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});