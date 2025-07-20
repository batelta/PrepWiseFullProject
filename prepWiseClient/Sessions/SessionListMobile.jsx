import React, { useState, useEffect, useContext } from "react";
import { View, Text, ActivityIndicator, Platform, SafeAreaView } from "react-native";
import SessionListPane from "./SessionListPane";
import { UserContext } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import {apiUrlStart} from '../api';

export default function SessionListMobile() {
  const { Loggeduser } = useContext(UserContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const route = useRoute();
  const navigation = useNavigation();

  const { jobseekerID, mentorID, JourneyID, FirstName, LastName } = route.params;

  useEffect(() => {
    if (Loggeduser?.id) {
      fetchSessions();
      if (Loggeduser?.id === mentorID) setUserType("mentor");
      else setUserType("jobSeeker");
    }
  }, [Loggeduser]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${apiUrlStart}/api/Session/userSessions/${jobseekerID}/${mentorID}`);
      const data = await response.json();
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionArchive = async (sessionId) => {
    try {
      const response = await fetch(`${apiUrlStart}/api/Session/archive/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        fetchSessions(); // refresh
      }
    } catch (error) {
      console.error("Error archiving session", error);
    }
  };

  const handleAddNew = () => {
    navigation.navigate("Session", {
      sessionMode: sessions.length > 0 ? "add" : "new",
      jobseekerID,
      mentorID,
      JourneyID,
      OtherUserName: FirstName,
    });
  };

  const handleSelectSession = (id) => {
    navigation.navigate("Session", {
      sessionId: id,
      sessionMode: "edit",
      jobseekerID,
      mentorID,
      JourneyID,
      OtherUserName: FirstName,
    });
  };

  if (loading) {
    return (
      <View style={{ marginTop: 20 }}>
        <ActivityIndicator />
        <Text>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView>
      <SessionListPane
        sessions={sessions}
        selectedId={null}
        setSelectedId={handleSelectSession}
        FirstName={FirstName}
        LastName={LastName}
        handleSessionArchive={handleSessionArchive}
        userType={userType}
        onAddNewSession={handleAddNew}
      />
    </SafeAreaView>
  );
}
