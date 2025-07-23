import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { UserContext } from "../UserContext";
import OfferDetailsModal from "./OfferDetailsModal";
import { apiUrlStart } from "../api";

export default function JobSeekerRelevantOffersCarousel({ navigation }) {
  const { Loggeduser } = useContext(UserContext);
  //const apiUrlStart = "https://localhost:7137";
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAll, setShowAll] = useState(false);

  const { width } = Dimensions.get("window");

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const [registeredOffers, setRegisteredOffers] = useState([]); //so we can show the user if he arldy signup

  const fetchRelevantOffers = async () => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Mentors/api/mentorOffers/forJS/${Loggeduser.id}`
      );

      const data = await response.json();
      console.log("Fetched offers:", data);
      setOffers(data);
    } catch (error) {
      console.error("Error fetching relevant offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Loggeduser?.id) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [offersRes, registrationsRes] = await Promise.all([
          fetch(
            `${apiUrlStart}/api/Mentors/mentorOffersforJS/${Loggeduser.id}`
          ),
          fetch(
            `${apiUrlStart}/api/Users/MentorOffer/MyRegistrations?userId=${Loggeduser.id}`
          ),
        ]);

        const offersData = await offersRes.json();
        const registrationsData = await registrationsRes.json();

        setOffers(offersData);
        setRegisteredOffers(registrationsData);
      } catch (error) {
        console.error("Error loading offers or registrations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [Loggeduser?.id]);

  if (!offers || !Array.isArray(offers)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noOffersText}>
          No relevant offers at the moment, but stay tuned! great things are on
          the way! 💡
        </Text>
      </View>
    );
  }

  const openOfferDetails = async (offer) => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Mentors/${offer.mentorUserID}`
      );
      const mentorData = await response.json();
      setSelectedOffer(offer);
      setSelectedMentor(mentorData);
    } catch (err) {
      console.error("Error loading mentor:", err);
    }
  };

  return (
    <View>
      {/* Header + See All button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 8,
          marginBottom: 6,
        }}
      >
        <Text style={styles.sectionTitle}>Upcoming Mentor Events 🎓</Text>
        <TouchableOpacity onPress={() => setShowAll(true)}>
          <Text style={{ color: "#9FF9D5", fontWeight: "bold" }}>
            Explore All Events
          </Text>
        </TouchableOpacity>
      </View>

      {/* Carousel Preview */}
      <Carousel
        width={Platform.OS === "web" ? 260 : 300}
        height={180}
        data={offers}
        loop
        autoPlay
        autoPlayInterval={5000}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => {
          const isRegistered = registeredOffers.some(
            (r) => r.offerID === item.offerID
          ); // ✅ בדיקת רישום

          return (
            <TouchableOpacity
              key={item.offerID}
              /*onPress={() =>
                navigation.navigate("OfferPageJS", { offerId: item.offerID })
              }*/
              onPress={() => openOfferDetails(item)}
            >
              <Card style={styles.offerCard}>
                <Card.Content>
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  <Text style={styles.offerInfo}>
                    Date & Time: {new Date(item.dateTime).toLocaleString()}
                  </Text>
                  <Text style={styles.offerInfo}>
                    Participants: {item.currentParticipants} /{" "}
                    {item.maxParticipants}
                  </Text>

                  {isRegistered && (
                    <Text style={styles.registeredLabel}>
                      🎟️ You're registered
                    </Text>
                  )}

                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#9FF9D5"
                    style={{ marginTop: 8 }}
                  />
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal for all offers */}
      <Modal
        visible={showAll}
        animationType="slide"
        onRequestClose={() => setShowAll(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <Text style={styles.modalTitle}>All Mentor Offers</Text>
            <Pressable onPress={() => setShowAll(false)}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>✖</Text>
            </Pressable>
          </View>

          <FlatList
            data={offers}
            keyExtractor={(item) => item.offerID.toString()}
            numColumns={2}
            contentContainerStyle={{ padding: 10 }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item }) => {
              const isRegistered = registeredOffers.some(
                (r) => r.offerID === item.offerID
              );

              return (
                <TouchableOpacity
                  style={styles.gridItem}
                  /*onPress={() => {
                    setShowAll(false);
                    navigation.navigate("OfferPageJS", {
                      offerId: item.offerID,
                    });
                  }}*/
                  onPress={() => openOfferDetails(item)}
                >
                  <Card style={styles.offerCard}>
                    <Card.Content>
                      <Text style={styles.offerTitle}>{item.title}</Text>
                      <Text style={styles.offerInfo}></Text>
                      <Text style={styles.offerInfo}>
                        {new Date(item.dateTime).toLocaleString()}
                      </Text>
                      <Text style={styles.offerInfo}>
                        Participants: {item.currentParticipants} /{" "}
                        {item.maxParticipants}
                      </Text>

                      {isRegistered && (
                        <Text style={styles.registeredLabel}>
                          🎟️ You're registered
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      <OfferDetailsModal
        visible={!!selectedOffer}
        offer={selectedOffer}
        mentor={selectedMentor}
        isRegistered={registeredOffers.some(
          (r) => r.offerID === selectedOffer?.offerID
        )}
        onClose={() => {
          setSelectedOffer(null);
          setSelectedMentor(null);
        }}
        onRegister={async () => {
          console.log("Trying to register with: ", {
            offerID: selectedOffer?.offerID,
            userID: Loggeduser?.id,
            currentParticipants: selectedOffer?.currentParticipants,
            maxParticipants: selectedOffer?.maxParticipants,
          });

          try {
            const res = await fetch(
              `${apiUrlStart}/api/Users/RegisterToOffer`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  offerID: selectedOffer.offerID, // ✅ camelCase תואם
                  userID: Loggeduser.id,
                }),
              }
            );

            // קודם נקרא כטקסט כדי למנוע קריסה אם זו לא תשובת JSON
            const text = await res.text();
            console.log("Server raw response:", text);

            let result = null;

            try {
              result = JSON.parse(text); // ננסה לפרסר JSON
            } catch (err) {
              console.error("Server did not return valid JSON:", text);
              alert("Server error: " + text);
              return; // מפסיקים כי זה לא JSON
            }

            // ✅ בודקים success ב-camelCase
            if (res.ok && result.success) {
              alert("✅ You're registered!");
              setRegisteredOffers((prev) => [
                ...prev,
                { offerID: selectedOffer.offerID },
              ]);

              // עדכון מקומי של מספר המשתתפים
              setOffers((prev) =>
                prev.map((offer) =>
                  offer.offerID === selectedOffer.offerID
                    ? {
                        ...offer,
                        currentParticipants: offer.currentParticipants + 1,
                      }
                    : offer
                )
              );
            } else {
              // גם message ב-camelCase
              alert(
                result.message || "Offer is full or you are already registered."
              );
            }
          } catch (err) {
            console.error("Register error:", err);
            alert("❌ An error occurred while registering.");
          }
        }}
        onUnregister={async () => {
          try {
            const res = await fetch(
              `${apiUrlStart}/api/Users/${Loggeduser.id}/mentorOffers/${selectedOffer.offerID}/unregister`,
              { method: "DELETE" }
            );
            if (res.ok) {
              setRegisteredOffers((prev) =>
                prev.filter((r) => r.offerID !== selectedOffer.offerID)
              );
              alert("You have been unregistered.");
            } else {
              const text = await res.text();
              alert(text || "Error unregistering.");
            }
          } catch (err) {
            console.error("Unregister error:", err);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noOffersText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Inter_300Light",
    paddingHorizontal: 10,
  },
  offerCard: {
    width: Platform.OS === "web" ? 240 : 280,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center",
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#163349",
    marginBottom: 4,
  },
  offerInfo: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Inter_300Light",
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#163349",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#163349",
  },

  gridItem: {
    flex: 1,
    margin: 6,
    minWidth: 140,
  },

  offerCard: {
    width: Platform.OS === "web" ? 240 : 280,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center",
  },

  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#163349",
    marginBottom: 4,
  },

  offerInfo: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Inter_300Light",
    marginBottom: 3,
  },
  registeredLabel: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#DFFFE2",
    color: "#2E7D32",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
});