import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import NavBar from "../NavBar";
import { UserContext } from "../UserContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import GeminiChat from "../GeminiChat";
import Session from "./Session"; // ✅ correct component
import { Card } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import NavBarMentor from "../Mentor/NavBarMentor";
import CustomPopup from "../CustomPopup";
import {apiUrlStart} from '../api';

export default function SessionSplitView() {
  const route = useRoute();
  const { jobseekerID, mentorID, JourneyID ,FirstName,LastName,initialSessionId} = route.params;

  console.log("🔍 route params:", route.params);

  const { Loggeduser } = useContext(UserContext);
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("new"); // or whatever indicates no sessions exist
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

    const [showSessionForm, setShowSessionForm] = useState(false);
    const [userType, setUserType] = useState('');

const [successPopupVisible, setSuccessPopupVisible] = useState(false);
const [popupMessage, setPopupMessage] = useState('');

const [errorPopupVisible, setErrorPopupVisible] = useState(false);
const [errpopupMessage, setErrPopupMessage] = useState('');

  useEffect(() => {
    if (Loggeduser?.id) {
      fetchSessions();
      if(Loggeduser?.id===mentorID)
        setUserType('mentor')
      else setUserType('jobSeeker')
    }
  }, [Loggeduser]);

  


  const fetchSessions = async () => {
    try {
      const response = await fetch(`${apiUrlStart}/api/Session/userSessions/${jobseekerID}/${mentorID}`);
      const data = await response.json();
      setSessions(data || []);
      console.log(data)
      /*if (data.length > 0) setSelectedId(data[0].sessionID);
      else {
        console.log("no sessions yet!")
        setSelectedId("new"); // ⬅️ flag to trigger empty session
      }    } catch (err) {
      console.error("Error fetching sessions", err);*/
      if (data.length > 0) {
  if (initialSessionId) {
    setSelectedId(initialSessionId);
  } else {
    setSelectedId(data[0].sessionID);
  }
}

    } finally {
      setLoading(false);
    }
  };
// Add this function to your SessionSplitView component

const handleSessionArchive = async (sessionId) => {
  try {
    console.log("🗄️ Archiving session:", sessionId);
    
    // Show loading state (optional)
    // setLoading(true);
    
    const response = await fetch(`${apiUrlStart}/api/Session/archive/${sessionId}`, {
      method: 'PUT', // or 'PATCH' depending on your API
      headers: {
        'Content-Type': 'application/json',
      },
      // If you need to send additional data:
      // body: JSON.stringify({ 
      //   archivedBy: Loggeduser?.id,
      //   archivedAt: new Date().toISOString()
      // })
    });

    if (response.ok) {
      console.log("✅ Session archived successfully");
         // Show success popup
        setPopupMessage("Session archived successfully");
        setSuccessPopupVisible(true);
      // If the archived session was currently selected, clear selection
      if (selectedId === sessionId) {
        setSelectedId(sessions.length > 1 ? sessions[0].sessionID : "new");
      }
      
      // Refresh the sessions list to remove the archived session
      await refreshSessions();
      
      // Optional: Show success message
      // You could add a toast/alert here if you have a notification system
      
    } else {
      const errorData = await response.json();
      console.error("❌ Failed to archive session:", errorData);
      // Handle error - show error message to user
       setErrPopupMessage("Failed to archive session. Please try again.");
            setErrorPopupVisible(true);
    }
    
  } catch (error) {
    console.error("❌ Error archiving session:", error);
    // Handle network/other errors
    alert("Error archiving session. Please check your connection.");
  } finally {
    // setLoading(false);
  }
};
const refreshSessions = async (newSessionId = null) => {
  console.log("🔄 refreshSessions called with:", newSessionId);
  await fetchSessions(); // reload cards
  console.log("🔄 fetchSessions completed, sessions length:", sessions.length);
  
  if (newSessionId) {
    console.log("🔄 Setting selectedId to:", newSessionId);
    setSelectedId(newSessionId);
  }
};

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
        <Text>Loading sessions...</Text>
      </View>
    );
  }
// Add this right before your return statement
console.log("🎨 Render - selectedId:", selectedId);
console.log("🎨 Render - sessions:", sessions.map(s => s.sessionID));
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

 {successPopupVisible && (
  <View style={styles.overlay}>
    <CustomPopup 
      visible={successPopupVisible}
      onDismiss={() => {
        setSuccessPopupVisible(false);
      }}
      icon="check-circle"
      message={popupMessage || "Action completed successfully!"}
    />
  </View>
)}

{errorPopupVisible && (
  <View style={styles.overlay}>
    <CustomPopup 
      visible={errorPopupVisible}
      onDismiss={() => {
        setErrorPopupVisible(false);
      }}
      icon="alert-circle-outline"
      message={errpopupMessage || "Action Failed!"}
    />
  </View>
)}

        <View style={styles.splitView}>
{userType === 'mentor' ? <NavBarMentor /> : <NavBar />}

          {/* Left Pane */}
          <View style={styles.leftPane}>
            <Text style={styles.header}>My Sessions</Text>
                       <Text style={styles.title}>{`Your Sessions With ${FirstName} ${LastName}` || "Untitled"}</Text>

            {sessions.map((session) => (
              <TouchableOpacity
                key={session.sessionID}
                style={[
                  styles.card,
                  selectedId === session.sessionID && styles.activeCard,
                ]}
                onPress={() => setSelectedId(session.sessionID)}
              >

                <Card style={styles.sessionCard}>
                  <Text style={styles.subtitle}>
                  <TouchableOpacity 
                    style={styles.archiveIcon}
                    onPress={() => handleSessionArchive(session.sessionID)}
                  >
                    <Ionicons name="archive-outline" size={20} />
                  </TouchableOpacity>
                    {session.scheduledAt  ? new Date(session.scheduledAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : 'No date set'} 
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
        <TouchableOpacity
  onPress={async () => {
    if (userType === 'mentor') {
      // למנטור: פותח טופס הוספה כמו עכשיו
      setSelectedId("add");
    } else {
      // למחפש עבודה: שולח בקשה לשרת ליצור סשן חדש עם סטטוס pending
      try {
        console.log("for the request:",jobseekerID,mentorID,JourneyID)
        const response = await fetch(`${apiUrlStart}/api/Session/requestSession/${jobseekerID}/${mentorID}/${JourneyID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobseekerID: jobseekerID,
            mentorID: mentorID,
            journeyID: JourneyID,
            status: 'pending',
          }),
        });
        if (response.ok) {
          const newSession = await response.json();
          // רענון הרשימה ובחירת הסשן החדש
          await refreshSessions(newSession.sessionID);
          setSelectedId(newSession.sessionID);
          setPopupMessage("Session request sent successfully.");
          setSuccessPopupVisible(true);
        } else {
          const errorData = await response.json();
const errorMessage = errorData.message;

if (errorMessage === "A pending session already exists for this journey.") {
  setErrPopupMessage("You already requested a session with this mentor.");
} else {
  setErrPopupMessage("Something went wrong. Please try again.");
}

setErrorPopupVisible(true);
        }
      } catch (error) {
        setErrPopupMessage("Unexpected error. Please try again.");
        setErrorPopupVisible(true);
      }
    }
  }}
  style={styles.addButton}
>
  <MaterialIcons name="add-circle-outline" size={24} color="#b9a7f2" />
  <Text style={styles.addButtonText}>
    {userType === 'mentor' ? "Add New Session" : "Request New Session"}
  </Text>
</TouchableOpacity>

          </View>
  
          {/* Right Pane */}
       <View style={styles.rightPane}>
  {selectedId === "new" && !showSessionForm ? (
    <View style={{ padding: 20 }}>
      <Text style={styles.subtitle}>{`You haven't had any sessions with ${FirstName} ${LastName} yet.`}</Text>
      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => setShowSessionForm(true)}
      >
<Text style={styles.buttonText}>
  {userType === 'mentor' ? 'Schedule your first session' : 'Request your first session'}
</Text>
      </TouchableOpacity>
    </View>
  ) : ((selectedId === "new" && showSessionForm) || selectedId === "add") ? (
    <Session
      hideNavbar={true}
      sessionMode={selectedId === "new" ? "new" : "add"}
      setSessionId={setSelectedId}
      onSessionCreated={(id) => {
        console.log("New session created with ID:", id);
        refreshSessions(id);
      }}
      jobseekerID={jobseekerID}
      mentorID={mentorID}
      JourneyID={JourneyID}
      OtherUserName={FirstName}
    />
) : selectedId && selectedId !== "add" && selectedId !== "new" ? (
      <Session
      hideNavbar={true}
      sessionId={selectedId}
      sessionMode="edit"
      jobseekerID={jobseekerID}
      mentorID={mentorID}
      JourneyID={JourneyID}
      OtherUserName={FirstName}
    />
  ) : null}
</View>




        </View>
      </ScrollView>

      {/* Chat */}
      <TouchableOpacity style={styles.chatIcon} onPress={() => setShowChat(!showChat)}>
        <FontAwesome6 name="robot" size={24} color="#9FF9D5" />
      </TouchableOpacity>

      {showChat && (
        <View style={styles.overlay}>
          <View style={styles.chatModal}>
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
  container: {
    flex: 1,
  },
  splitView: {
    flexDirection: "row",
  },
  leftPane: {
    width: "30%",
    backgroundColor: "#F4F4F4",
    padding: 15,
    marginTop: 20,
  },
  rightPane: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "68%",
    margin: 10,
    marginTop: 80,
    overflow: "auto",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#163349",
  },
  card: {
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  activeCard: {
    backgroundColor: "#DCEFFF",
  },
  title: {
    fontSize: 20,
    marginTop: 8,
    fontFamily:"Inter_300Light",
  },
  subtitle: {
    fontSize: 15,
    //  marginTop: 8,
      fontFamily:"Inter_300Light",
      textAlign:'center'

  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatIcon: {
    position: "absolute",
    bottom: 5,
    right: 45,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 12,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "rgba(159, 249, 213, 0.3)",
  },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  chatModal: {
    position: "absolute",
    bottom: 80,
    right: 10,
    width: "40%",
    height: 500,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  buttonText:{
    fontSize: 13,
    //  marginTop: 8,
      fontFamily:"Inter_300Light",
      color:'#fff'
  },
  scheduleButton: {
    marginTop: 10,
    backgroundColor: "#BFB4FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
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
    sessionCard:{
      padding: 12 ,
      flexDirection:'row',
      alignContent:'space-evenly'
    },
    archiveIcon:{
      margin:10
    }
});