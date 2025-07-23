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
import CustomPopup from "../CustomPopup";
import { apiUrlStart } from "../api";

export default function MentorOffers({ navigation }) {
  const { Loggeduser } = useContext(UserContext);
  //const apiUrlStart = "https://localhost:7137";
  const [offers, setOffers] = useState([]);

  const [editOffer, setEditOffer] = useState(null);

  //popup section
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupIcon, setPopupIcon] = useState("check-circle"); // אפשר גם alert-circle
  const [isConfirmPopup, setIsConfirmPopup] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);

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

  const handleDeleteOffer = async (offerId) => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Mentors/MentorOffer/${offerId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        showPopup("Offer deleted!");
        setOffers((prevOffers) =>
          prevOffers.filter((offer) => offer.offerID !== offerId)
        );
      } else {
        let message = `Error deleting offer.`;
        try {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            if (data?.message) message = data.message;
          }
        } catch (_) {}
        showPopup(message, "alert-circle");
      }
    } catch (error) {
      console.log("Error deleting offer:", error);
      showPopup("Error deleting offer.", "alert-circle");
    }
  };

  const showPopup = (message, icon = "check-circle-outline") => {
    setPopupMessage(message);
    setPopupIcon(icon);
    setIsConfirmPopup(false);
    setPopupVisible(true);
  };

  const showConfirmPopup = (message, onConfirmAction) => {
    setPopupMessage(message);
    setPopupIcon("alert-circle-outline");
    setIsConfirmPopup(true);
    setConfirmCallback(() => onConfirmAction);
    setPopupVisible(true);
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
                  <Button
                    onPress={() =>
                      showConfirmPopup(
                        "Are you sure you want to delete this offer?",
                        () => handleDeleteOffer(offer.offerID)
                      )
                    }
                    style={{ marginLeft: 10 }}
                    textColor="red"
                  >
                    Delete
                  </Button>
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
                        const localDateTime =
                          updatedOffer.dateTime &&
                          `${updatedOffer.dateTime.getFullYear()}-${String(
                            updatedOffer.dateTime.getMonth() + 1
                          ).padStart(2, "0")}-${String(
                            updatedOffer.dateTime.getDate()
                          ).padStart(2, "0")}T${String(
                            updatedOffer.dateTime.getHours()
                          ).padStart(2, "0")}:${String(
                            updatedOffer.dateTime.getMinutes()
                          ).padStart(2, "0")}:00`;

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
                              dateTime: localDateTime ?? null,
                            }),
                          }
                        );

                        const status = response.status;
                        let message = "Offer updated!";

                        if (response.ok) {
                          try {
                            const data = await response.json();
                            if (data?.message) message = data.message;
                          } catch (e) {}

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
      {popupVisible && (
        <View style={styles.overlay}>
          <CustomPopup
            visible={popupVisible}
            onDismiss={() => setPopupVisible(false)}
            icon={popupIcon}
            message={popupMessage}
            isConfirmation={isConfirmPopup}
            onConfirm={() => {
              setPopupVisible(false);
              if (confirmCallback) confirmCallback();
            }}
            onCancel={() => setPopupVisible(false)}
          />
        </View>
      )}
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});