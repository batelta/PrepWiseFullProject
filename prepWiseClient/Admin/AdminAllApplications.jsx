import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import axios from "axios";
import { DataTable } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import {apiUrlStart} from '../api';


const AdminAllApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios
      .get(`${apiUrlStart}/api/Application`)
      .then((response) => {
        console.log("DATA FROM SERVER:", response.data);
        setApplications(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API ERROR:", error);
        setError("אירעה שגיאה בעת טעינת המשתמשים");
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={{ color: "red", padding: 16 }}>{error}</Text>;

  /*const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    if (filter === "mentor") return user.isMentor;
    if (filter === "jobseeker") return !user.isMentor;
  });*/

  return (
    <ScrollView style={{ padding: 16, direction: "rtl" }}>
      {/*<View style={{ marginBottom: 16 }}>
        <Picker
          selectedValue={filter}
          onValueChange={(value) => setFilter(value)}
          style={{
            height: 50,
            width: "100%",
            backgroundColor: "#f0f0f0",
            borderRadius: 4,
          }}
        >
          <Picker.Item label="הצג הכול" value="all" />
          <Picker.Item label="מנטורים" value="mentor" />
          <Picker.Item label="מחפשי עבודה" value="jobseeker" />
        </Picker>
      </View>*/}
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Created At</DataTable.Title>
          <DataTable.Title>Status</DataTable.Title>
          <DataTable.Title>Title</DataTable.Title>
          <DataTable.Title>App ID</DataTable.Title>
        </DataTable.Header>

        {applications.map((application, index) => (
          <DataTable.Row key={application.ApplicationID || index}>
            {/*<DataTable.Cell>
              {user.isMentor ? "Mentor" : "JobSeeker"}
            </DataTable.Cell>*/}

            <DataTable.Cell>{application.createdAt}</DataTable.Cell>
            <DataTable.Cell>{application.applicationStatus}</DataTable.Cell>
            <DataTable.Cell>{application.title}</DataTable.Cell>
            <DataTable.Cell>{application.applicationID}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
};

export default AdminAllApplications;