import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Card } from "react-native-paper";
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
  import { useFonts } from 'expo-font';

const screenWidth = Dimensions.get("window").width;

export default function SessionListPane({
  sessions,
  selectedId,
  setSelectedId,
  FirstName,
  LastName,
  handleSessionArchive,
  userType,
  onAddNewSession,
}) 

{
    const [fontsLoaded] = useFonts({
            Inter_400Regular,
            Inter_700Bold,
            Inter_100Thin,
            Inter_200ExtraLight,
            Inter_300Light
          });
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>My Sessions</Text>
      <Text style={styles.subheader}>
        Your sessions with {FirstName} {LastName}
      </Text>

      {sessions.map((session) => (
        <TouchableOpacity
          key={session.sessionID}
          onPress={() => setSelectedId(session.sessionID)}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.sessionText}>
                {session.scheduledAt
                  ? new Date(session.scheduledAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "No date set"}
              </Text>
              <TouchableOpacity
                onPress={() => handleSessionArchive(session.sessionID)}
              >
                <Ionicons name="archive-outline" size={24} color="#9FF9D5" />
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={onAddNewSession} style={styles.addButton}>
        <MaterialIcons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF", // clean background
    paddingBottom: 40,
  },
  header: {
       fontSize: 20,
        marginTop: 8,
        fontFamily:"Inter_300Light"
  },
  subheader: {
     fontSize: 15,
          margin: 8,
          fontFamily:"Inter_300Light",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#E4E0E1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionText: {
    fontSize: 14,
   // color: "#003D5B",
    maxWidth: screenWidth * 0.7, // prevent overflow
  },
  addButton: {
       backgroundColor: '#BFB4FF',
        borderRadius: 5,
        padding:12,
        width: '70%',
        alignItems: 'center',
        alignSelf:'center',
        marginTop:10,
        flexDirection:'row',
        justifyContent:'center'
  },
  addButtonText: {
     color: 'white',
        fontFamily: 'Inter_400Regular',
        alignSelf:'center',
        marginLeft:4
  },
});
