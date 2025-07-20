import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import NavBarMentor from "./NavBarMentor";
import { Card, Button, TextInput, SegmentedButtons } from "react-native-paper";
import { UserContext } from "../UserContext";
import MentorOfferForm from "../Mentor/MentorOfferForm";
import {apiUrlStart} from '../api';

export default function MentorOffers({ navigation }) {
  const { Loggeduser } = useContext(UserContext);
  const [offers, setOffers] = useState([]);

  const [editOffer, setEditOffer] = useState(null);

  const fetchMyOffers = async () => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Mentors/api/GetAllMentorsOffers?mentorUserId=${Loggeduser.id}`
      );
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.log("Error fetching offers:", error);
    }
  };

  useEffect(() => {
    if (Loggeduser?.id) {
      fetchMyOffers();
    }
  }, [Loggeduser]);

  const handleAddOffer = () => {
    navigation.navigate("CreateOffer");
  };

  /*const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Mentors/MentorOfferUpdate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editOffer),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Offer updated!");
        setEditOffer(null);
        fetchOffers(); // רענון הרשימה אחרי עריכה
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.log("Error updating offer:", error);
      alert("Error updating offer.");
    }
  };*/

  const handleDeleteOffer = async (offerId) => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Mentors/MentorOffer/${offerId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Offer deleted!");
        fetchMyOffers(); // רענון הרשימה
      } else {
        const data = await response.json();
        alert(`Error deleting offer: ${data.message}`);
      }
    } catch (error) {
      console.log("Error deleting offer:", error);
      alert("Error deleting offer.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <NavBarMentor />

        <View style={styles.pageHeader}>
          <Text style={styles.title}>My Sessions & Meetups</Text>

          <TouchableOpacity style={styles.addButton} onPress={handleAddOffer}>
            <Text style={styles.addButtonText}> + Add Offer</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {offers.length === 0 ? (
            <Text style={styles.noOffersText}>
              You have not created any offers yet.
            </Text>
          ) : (
            offers.map((offer) => (
              <Card key={offer.offerID} style={styles.offerCard}>
                <Card.Title title={offer.title} />
                <Card.Content>
                  <Text style={styles.cardText}>
                    {new Date(offer.dateTime).toLocaleString()}
                  </Text>
                  <Text style={styles.cardText}>
                    Participants: {offer.currentParticipants} /{" "}
                    {offer.maxParticipants}
                  </Text>
                  <Text style={styles.cardText}>Status: {offer.status}</Text>
                  <Text style={styles.cardText}>
                    Link: {offer.meetingLink} / Location:{offer.location}
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button mode="outlined" onPress={() => setEditOffer(offer)}>
                    Edit
                  </Button>
                  {offer.status === "Active" && (
                    <Button
                      onPress={() => handleDeleteOffer(offer.offerID)}
                      style={{ marginLeft: 10 }}
                    >
                      Delete
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            ))
          )}
        </View>

        {editOffer && (
          <Modal
            visible={true}
            onRequestClose={() => setEditOffer(null)}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <MentorOfferForm
                    initialValues={editOffer}
                    onSubmit={async (updatedOffer) => {
                      try {
                        const response = await fetch(
                          `${apiUrlStart}/api/Mentors/MentorOfferUpdate`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              ...updatedOffer,
                              OfferID: editOffer.offerID,
                              mentorUserID: Loggeduser.id,
                            }),
                          }
                        );

                        const status = response.status;
                        let message = "Offer updated!";

                        if (response.ok) {
                          try {
                            const data = await response.json(); // JSON שמכיל message
                            if (data?.message) message = data.message;
                          } catch (e) {
                            // במידה ואין גוף JSON — נשתמש בברירת מחדל
                          }

                          alert(message);
                          setEditOffer(null);
                          fetchMyOffers();
                        } else {
                          try {
                            const errorData = await response.json();
                            alert(
                              `Error: ${
                                errorData.message || "Something went wrong."
                              }`
                            );
                          } catch (e) {
                            alert(`Unexpected error (status ${status})`);
                          }
                        }
                      } catch (error) {
                        console.log("Error updating offer:", error);
                        alert("Error updating offer.");
                      }
                    }}
                    mode="edit"
                  />

                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditOffer(null)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    color: "#000",
  },
  addButton: {
    backgroundColor: "#BFB4FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  addButtonText: {
    color: "white",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  offerCard: {
    marginBottom: 15,
    padding: 10,
  },
  cardText: {
    fontFamily: "Inter_300Light",
    fontSize: 14,
    marginBottom: 4,
  },
  noOffersText: {
    fontFamily: "Inter_300Light",
    fontSize: 14,
    padding: 20,
    color: "#888",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#9FF9D5",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 30, // רווח מהתחתית
  },
  buttonText: {
    color: "white",
    fontFamily: "Inter_400Regular",
  },
  fieldBlock: {
    marginBottom: 20,
  },
  inputTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "Inter_200ExtraLight",
  },
});