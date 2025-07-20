import React from "react";

import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { Card, Button } from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function OfferDetailsModal({
  visible,
  offer,
  mentor,
  isRegistered,
  onClose,
  onRegister,
  onUnregister,
}) {
  if (!offer || !mentor) return null;

  const imageSource =
    mentor?.picture === "string"
      ? require("../assets/defaultProfileImage.jpg")
      : { uri: mentor?.picture };

  /*const handleRegister = () => {
    onRegister();
    setPopupConfig({
      icon: "check-circle",
      message: "You have successfully registered for the event.",
      isConfirmation: false,
    });
    setShowPopup(true);
  };

  const handleUnregister = () => {
    setPopupConfig({
      icon: "alert-circle",
      message: "Are you sure you want to cancel your registration?",
      isConfirmation: true,
      onConfirm: () => {
        onUnregister();
        setShowPopup(false);
      },
    });
    setShowPopup(true);
  };*/

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeBtn}>✖</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contentRow}>
              {/* Left: Offer Details */}
              <View style={styles.leftColumn}>
                <Card style={styles.card}>
                  <Card.Title title={offer.title} />
                  <Card.Content>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{offer.description}</Text>

                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.value}>{offer.offerType}</Text>

                    <Text style={styles.label}>Date & Time:</Text>
                    <Text style={styles.value}>
                      {new Date(offer.dateTime).toLocaleString()}
                    </Text>

                    <Text style={styles.label}>Duration:</Text>
                    <Text style={styles.value}>
                      {offer.durationMinutes} minutes
                    </Text>

                    <Text style={styles.label}>Participants:</Text>
                    <Text style={styles.value}>
                      {offer.currentParticipants} / {offer.maxParticipants}
                    </Text>

                    <Text style={styles.label}>Location:</Text>
                    <Text style={styles.value}>
                      {offer.isOnline ? "Online" : "Offline"} - {offer.location}
                    </Text>

                    <Text style={styles.label}>Meeting Link:</Text>
                    <Text style={styles.value}>{offer.meetingLink}</Text>
                  </Card.Content>

                  <Card.Actions
                    style={{ justifyContent: "center", paddingBottom: 16 }}
                  >
                    {isRegistered ? (
                      <Button
                        mode="outlined"
                        onPress={onUnregister}
                        style={styles.unregisterBtn}
                        textColor="#FF6B6B"
                      >
                        Cancel Registration
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        onPress={onRegister}
                        style={styles.registerBtn}
                      >
                        Sign Up
                      </Button>
                    )}
                  </Card.Actions>
                </Card>
              </View>

              {/* Right: Mentor Info */}
              <View style={styles.rightColumn}>
                <View style={styles.mentorBox}>
                  <Image source={imageSource} style={styles.mentorImage} />
                  <Text style={styles.mentorName}>
                    {mentor.firstName} {mentor.lastName}
                  </Text>
                  {mentor.company && (
                    <Text style={styles.mentorCompany}>{mentor.company}</Text>
                  )}
                  {mentor.roles?.length > 0 && (
                    <Text style={styles.mentorRole}>
                      {mentor.roles.join(", ")}
                    </Text>
                  )}
                  <View style={styles.socialIcons}>
                    {mentor.facebookLink && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(mentor.facebookLink)}
                      >
                        <FontAwesome
                          name="facebook"
                          size={20}
                          color="#003D5B"
                        />
                      </TouchableOpacity>
                    )}
                    {mentor.linkedInLink && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(mentor.linkedInLink)}
                      >
                        <FontAwesome
                          name="linkedin"
                          size={20}
                          color="#003D5B"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "95%",
    maxHeight: "90%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003D5B",
  },
  closeBtn: {
    fontSize: 22,
    color: "#999",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
  },
  leftColumn: {
    flex: 2,
    minWidth: 300,
  },
  rightColumn: {
    flex: 1,
    minWidth: 200,
  },
  card: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
  },
  value: {
    color: "#555",
    marginBottom: 4,
  },
  registerBtn: {
    backgroundColor: "#9FF9D5",
    borderRadius: 8,
  },
  unregisterBtn: {
    borderColor: "#FF6B6B",
    borderWidth: 1,
    borderRadius: 8,
  },
  mentorBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  mentorImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003D5B",
    marginBottom: 5,
  },
  mentorCompany: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  mentorRole: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
});