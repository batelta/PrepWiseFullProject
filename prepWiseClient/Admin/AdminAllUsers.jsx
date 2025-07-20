import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { DataTable } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {apiUrlStart} from '../api';


const AdminAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
    Inter_700Bold,
  });

  useEffect(() => {
    axios
      .get(`${apiUrlStart}/api/users/all`)
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API ERROR:", error);
        setError("אירעה שגיאה בעת טעינת המשתמשים");
        setLoading(false);
      });
  }, []);

  const handleDeleteUser = (userID) => {
    axios
      .delete(`${apiUrlStart}/api/Mentors/${userID}`)
      .then(() => {
        setUsers(users.filter((user) => user.userID !== userID));
        alert("המשתמש נמחק בהצלחה");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        alert("אירעה שגיאה במחיקה");
      });
  };

  if (!fontsLoaded) return null;
  if (loading) return <ActivityIndicator size="large" color="#b9a7f2" />;
  if (error)
    return (
      <Text style={{ color: "red", padding: 16, fontSize: 16 }}>{error}</Text>
    );

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    if (filter === "mentor") return user.isMentor;
    if (filter === "jobseeker") return !user.isMentor;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👥 All Users</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filter}
          onValueChange={(value) => setFilter(value)}
          style={styles.picker}
        >
          <Picker.Item label="See All" value="all" />
          <Picker.Item label="Mentors" value="mentor" />
          <Picker.Item label="Job Seekers" value="jobseeker" />
        </Picker>
      </View>

      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Type</DataTable.Title>
          <DataTable.Title>Email</DataTable.Title>
          <DataTable.Title>ID</DataTable.Title>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title>Actions</DataTable.Title>
        </DataTable.Header>

        {filteredUsers.map((user, index) => (
          <DataTable.Row key={user.userID || index}>
            <DataTable.Cell>
              {user.isMentor ? "Mentor" : "JobSeeker"}
            </DataTable.Cell>
            <DataTable.Cell>{user.email}</DataTable.Cell>
            <DataTable.Cell>{user.userID}</DataTable.Cell>
            <DataTable.Cell>
              {user.firstName} {user.lastName}
            </DataTable.Cell>
            <DataTable.Cell>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(user.userID)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
};

export default AdminAllUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#163349",
    marginBottom: 16,
  },
  pickerWrapper: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderColor: "#BFB4FF",
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "red",
    fontWeight: "bold",
  },
});