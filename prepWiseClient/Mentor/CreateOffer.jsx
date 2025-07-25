import React, { useContext } from "react";
import { SafeAreaView, ScrollView, View, Alert } from "react-native";
import NavBarMentor from "./NavBarMentor";
import { UserContext } from "../UserContext";
import MentorOfferForm from "../Mentor/MentorOfferForm";
import { apiUrlStart } from "../api";

export default function CreateOffer({ navigation }) {
  const { Loggeduser } = useContext(UserContext);
  //const apiUrlStart = "https://localhost:7137";

  const handleCreateOffer = async (offerData) => {
    const localDateTime =
      offerData.dateTime &&
      `${offerData.dateTime.getFullYear()}-${String(
        offerData.dateTime.getMonth() + 1
      ).padStart(2, "0")}-${String(offerData.dateTime.getDate()).padStart(
        2,
        "0"
      )}T${String(offerData.dateTime.getHours()).padStart(2, "0")}:${String(
        offerData.dateTime.getMinutes()
      ).padStart(2, "0")}:00`;

    // דוגמה מה יצא: "2025-07-23T10:00:00" (בלי Z)
    console.log("Local ISO for server:", localDateTime);

    const body = {
      ...offerData,
      MentorUserID: Loggeduser.id,
      dateTime: localDateTime ?? null,
    };

    try {
      const response = await fetch(`${apiUrlStart}/api/Mentors/MentorOffer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("DATA FROM API", data);

      if (response.ok) {
        Alert.alert("Success", `Offer created! Offer ID: ${data.offerId}`);
        navigation.navigate("MentorOffers");
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      Alert.alert("Error", "Could not create offer.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <NavBarMentor />
        <View style={{ paddingHorizontal: 20, paddingTop: 100 }}>
          <MentorOfferForm
            initialValues={{}} // ריק ליצירה
            onSubmit={handleCreateOffer} // פונקציית שליחה
            mode="create" // מצב טופס
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}