import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Application from "./Application";
import AddApplication from "./AddApplication";
import NavBar from "../NavBar";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from "@expo-google-fonts/inter";
import CustomPopup from "../CustomPopup";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import GeminiChat from "../GeminiChat";

import { useContext } from "react";
import { UserContext } from "../UserContext";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";


  export default function ApplicationSplitView() {
    const route = useRoute();
    const navigation = useNavigation();
    const apiUrlStart ="http://localhost:5062"

    const { startWithAddNew } = route?.params || {};
  
    console.log(" params from navbar", route?.params);
    const [fontsLoaded] = useFonts({
      Inter_400Regular,
      Inter_700Bold,
      Inter_100Thin,
      Inter_200ExtraLight,
      Inter_300Light,
    });
    const [applications, setApplications] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
  
    const [viewArchived, setViewArchived] = useState(false);
  
    const [loading, setLoading] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    useEffect(() => {
      if (route.params?.startWithAddNew) {
        setIsAddingNew(true);
      }
    }, [route.params]);
  
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
  
    const [showChat, setShowChat] = useState(false);
    const appliedStyles = Platform.OS === "web" ? Webstyles : styles;
  
    const { Loggeduser } = useContext(UserContext);
    const [userID, setUserID] = useState(true);
  
    /*const fetchApps = useCallback(async (userID) => {
      try {
        const API_URL = `https://proj.ruppin.ac.il/igroup11/prod/api/JobSeekers/${userID}/applications`;
  
        const response = await fetch(API_URL);
        const data = await response.json();
        setApplications(data);
  
        if (data.length > 0) {
          setApplications(data);
  
          if (!startWithAddNew) {
            setSelectedId(data[0].applicationID);
            setIsAddingNew(false);
          }
        } else {
          setIsAddingNew(true);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    });*/
  
    const fetchApps = useCallback(async (userID, showArchived = false) => {
      try {
        //const API_URL = `https://proj.ruppin.ac.il/igroup11/prod/api/JobSeekers/${userID}/applications?showArchived=${showArchived}`;
        const API_URL =
          Platform.OS === "web"
            ? `${apiUrlStart}/api/JobSeekers/${userID}/applications?showArchived=${showArchived}`
            : `${apiUrlStart}/api/JobSeekers/${userID}/applications?showArchived=${showArchived}`;
  
        const response = await fetch(API_URL);
        const data = await response.json();
        setApplications(data);
  
        if (data.length > 0 && !startWithAddNew) {
          setSelectedId(data[0].applicationID);
          setIsAddingNew(false);
        } else {
          setIsAddingNew(true);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      if (Loggeduser?.id) {
        fetchApps(Loggeduser.id, viewArchived);
        setUserID(Loggeduser.id);
      }
    }, [Loggeduser, viewArchived]);
  
    /*useEffect(() => {
      if (Loggeduser?.id) {
        console.log("logged user in SPLIT", Loggeduser);
        fetchApps(Loggeduser.id);
        setUserID(Loggeduser.id);
      }
    }, [Loggeduser]);*/
  
    if (Platform.OS !== "web") {
      return (
        <View style={styles.centered}>
          <Text>This layout is available only on web</Text>
        </View>
      );
    }
  
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text>Loading applications...</Text>
        </View>
      );
    }
  
    const handleUnarchive = async (applicationID) => {
      try {
        const API_URL =
          Platform.OS === "web"
            ? `${apiUrlStart}/api/JobSeekers/unarchiveById/${userID}/${applicationID}`
            : `${apiUrlStart}/api/JobSeekers/unarchiveById/${userID}/${applicationID}`;
  
        const response = await fetch(API_URL, { method: "PUT" });
  
        if (!response.ok) throw new Error("Failed to unarchive");
        // עדכון הרשימה לאחר השחזור
        const updated = applications.filter(
          (app) => app.applicationID !== applicationID
        );
        setApplications(updated);
        showMessage("Application restored successfully!", "check-circle");
      } catch (error) {
        console.error("Error restoring application:", error);
        showMessage("Failed to restore application", "alert-circle");
      }
    };
  
    const handleDeleteApplication = async (applicationIDToDelete) => {
      try {
        const API_URL = `${apiUrlStart}/api/JobSeekers/deleteById/${userID}/${applicationIDToDelete}`;
  
        const response = await fetch(API_URL, { method: "DELETE" });
  
        if (!response.ok) throw new Error("Failed to archive application");
        console.log("logged user in split", userID);
  
        //updated list after delete
        const updated = applications.filter(
          (app) => app.applicationID !== applicationIDToDelete
        );
        setApplications(updated);
  
        if (selectedId === applicationIDToDelete) {
          setSelectedId(null);
        }
  
        if (updated.length === 0) {
          setIsAddingNew(true);
        }
  
        showMessage(
          "Application archived successfully! You can restore it anytime",
          "check-circle"
        );
      } catch (error) {
        console.error("Error archive application:", error);
  
        showMessage("Failed to archive application", "alert-circle");
      }
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.splitView}>
            <NavBar style={styles.navbar} />
  
            {/* Left Pane */}
  
            <View style={styles.leftPane}>
              <Text style={styles.header}>All Applications</Text>
  
              <View //archive
                style={{
                  flexDirection: "row",
                  marginBottom: 10,
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => setViewArchived(false)}
                  style={[
                    styles.toggleButton,
                    !viewArchived && styles.activeToggle,
                  ]}
                >
                  <Text style={styles.toggleText}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewArchived(true)}
                  style={[
                    styles.toggleButton,
                    viewArchived && styles.activeToggle,
                  ]}
                >
                  <Text style={styles.toggleText}>Archive</Text>
                </TouchableOpacity>
              </View>
  
              {/* {applications.map((app) => (
                <View key={app.applicationID} style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    key={app.applicationID}
                    style={[
                      styles.card,
                      selectedId === app.applicationID && styles.activeCard,
                    ]}
                    onPress={() => {
                      setSelectedId(app.applicationID);
                      setIsAddingNew(false);
                    }}
                  >
                    <MaterialIcons
                      name="work-outline"
                      size={34}
                      color="#9FF9D5"
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.title}>{app.title}</Text>
                      <Text style={styles.subtitle}>{app.companyName}</Text>
                    </View>
                    {!viewArchived && (
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => {
                          showConfirmation(
                            "Are you sure you want to delete this application?",
                            () => handleDeleteApplication(app.applicationID),
                            "alert-circle"
                          );
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#9FF9D5" }}>X</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                  {viewArchived && (
                    <TouchableOpacity
                      onPress={() =>
                        showConfirmation(
                          "Restore this application?",
                          () => handleUnarchive(app.applicationID),
                          "refresh"
                        )
                      }
                      style={{
                        padding: 6,
                        borderWidth: 1,
                        borderColor: "#9FF9D5",
                        borderRadius: 4,
                        marginTop: 5,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ color: "#163349" }}>Restore</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
  */}
  
              {applications.map((app) => (
                <View key={app.applicationID} style={{ marginBottom: 2 }}>
                  <TouchableOpacity
                    style={[
                      styles.card,
                      selectedId === app.applicationID && styles.activeCard,
                    ]}
                    onPress={() => {
                      setSelectedId(app.applicationID);
                      setIsAddingNew(false);
                    }}
                  >
                    {/* Restore button - RIGHT CORNER */}
                    {viewArchived && (
                      <TouchableOpacity
                        onPress={() =>
                          showConfirmation(
                            "Restore this application?",
                            () => handleUnarchive(app.applicationID),
                            "refresh"
                          )
                        }
                        style={styles.restoreButton}
                      >
                        <MaterialIcons name="restore" size={20} color="#9FF9D5" />
                      </TouchableOpacity>
                    )}
  
                    {/* Work icon */}
                    <MaterialIcons
                      name="work-outline"
                      size={34}
                      color="#9FF9D5"
                    />
  
                    {/* Application details */}
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.title}>{app.title}</Text>
                      <Text style={styles.subtitle}>{app.companyName}</Text>
                    </View>
  
                    {/* Delete button - only if not archived */}
                    {!viewArchived && (
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => {
                          showConfirmation(
                            "Move this application to the archive? You can restore it later",
                            () => handleDeleteApplication(app.applicationID),
                            "alert-circle"
                          );
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#9FF9D5" }}>X</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
  
              <TouchableOpacity
                onPress={() => {
                  setIsAddingNew(true);
                  setSelectedId(null);
                }}
                style={styles.addButton}
              >
                <MaterialIcons
                  name="add-circle-outline"
                  size={24}
                  color="#b9a7f2"
                />
                <Text style={styles.addButtonText}>Add New Application</Text>
              </TouchableOpacity>
            </View>
  
            {/* Right Pane */}
  
            <View style={styles.rightPane}>
              {isAddingNew ? (
                <AddApplication
                  onSuccess={() => {
                    fetchApps(Loggeduser.id);
                    setIsAddingNew(false);
                  }}
                />
              ) : selectedId ? (
                <Application
                  applicationID={selectedId}
                  key={selectedId}
                  onDeleteSuccess={() => {
                    fetchApps(Loggeduser.id);
                    setSelectedId(null);
                  }}
                />
              ) : (
                <Text style={{ padding: 20 }}>
                  Select an application to view details
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
  
        {popup.visible && (
          <View style={styles.popupOverlay}>
            <CustomPopup
              visible={popup.visible}
              onDismiss={() => {
                closePopup();
                if (!popup.isConfirmation) popup.onOk();
              }}
              icon={popup.icon}
              message={popup.message}
              isConfirmation={popup.isConfirmation}
              onConfirm={() => {
                closePopup();
                popup.onConfirm();
              }}
              onCancel={closePopup}
            />
          </View>
        )}
  
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
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    splitView: {
      flexDirection: "row",
    },
  
    container: {
      flex: 1,
    },
  
    leftPane: {
      width: "30%",
      backgroundColor: "#rgba(253, 253, 253, 0.51)",
      padding: 15,
      marginTop: 20,
    },
    rightPane: {
      backgroundColor: "white",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "white",
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      width: "68%",
      margin: 10,
      overflow: "auto",
      marginTop: 80,
    },
  
    header: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#163349",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      cursor: "pointer",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    activeCard: {
      backgroundColor: "#DCEFFF",
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: "#163349",
    },
    subtitle: {
      color: "#666",
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    addButton: {
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
    addButtonText: {
      marginLeft: 8,
      color: "#b9a7f2",
      fontWeight: "600",
    },
  
    deleteIcon: {
      position: "absolute",
      right: 10,
      top: 3,
      zIndex: 2,
    },
  
    popupOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)", // רקע חצי שקוף
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    chatIcon: {
      position: "absolute",
      bottom: 5,
      right: 45,
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
      marginBottom: 12,
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
      padding: 10,
      borderWidth: 1,
      borderColor: "#b9a7f2",
      borderRadius: 5,
      backgroundColor: "#fff",
      flex: 1,
      alignItems: "center",
      marginHorizontal: 5,
    },
  
    activeToggle: {
      backgroundColor: "#b9a7f2",
    },
  
    toggleText: {
      color: "#163349",
      fontWeight: "bold",
    },
    restoreButton: {
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