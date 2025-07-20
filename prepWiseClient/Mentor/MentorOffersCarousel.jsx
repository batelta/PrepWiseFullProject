import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import {apiUrlStart} from '../api';
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';

export default function MentorOffersCarousel({ mentorId, onHasOffers }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { width } = Dimensions.get("window");
  const navigation = useNavigation();

const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light
      });
  /*useEffect(() => {
    const fetchMentorOffers = async () => {
      try {
        const res = await fetch(
          `${apiUrlStart}/api/Mentors/api/GetAllMentorsOffers?mentorUserId=${mentorId}`
        );
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        console.error("Error loading mentor offers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorOffers();
    }
  }, [mentorId]);*/

  useEffect(() => {
    const fetchMentorOffers = async () => {
      try {
        const res = await fetch(
          `${apiUrlStart}/api/Mentors/api/GetAllMentorsOffers?mentorUserId=${mentorId}`
        );
        const data = await res.json();
        setOffers(data);

        if (onHasOffers) {
          onHasOffers(Array.isArray(data) && data.length > 0);
        }
      } catch (err) {
        console.error("Error loading mentor offers:", err);
        if (onHasOffers) {
          onHasOffers(false);
        }
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorOffers();
    } else {
      // 💡 מקרה שאין בכלל מזהה מנטור — חשוב!
      if (onHasOffers) onHasOffers(false);
      setLoading(false); // סיים טעינה למרות שלא נעשתה קריאה
    }
  }, [mentorId]);

  if (loading) return null;
  if (!offers || offers.length === 0) return null;

  /*if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noOffersText}>
          You haven’t created any meetups yet — start by offering your first
          one!
        </Text>
      </View>
    );
  }*/

  return (
    <>
     <Text style={styles.sectionTitle}>Your Next Meetups ✨</Text>
      <Card
        style={{
              width: '35%',
              marginLeft:30,
        elevation: 0,
     alignContent:'center',
        shadowColor: '#E4E0E1',
        backgroundColor: '#fff',
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate("MentorOffers")}>
          <Text style={{ color: "#9FF9D5",fontFamily:'Inter_300Light' , alignSelf:'flex-end',marginRight:8}}>
            See All My Meetups
          </Text>
        </TouchableOpacity>

      <Carousel
        width={Platform.OS === "web" ? 260 : 300}
        height={180}
        data={offers}
        loop
        autoPlay
        autoPlayInterval={6000}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <Card style={styles.offerCard}>
            <Card.Content>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerInfo}>
                {new Date(item.dateTime).toLocaleString()}
              </Text>
              <Text style={styles.offerInfo}>
                {item.currentParticipants} / {item.maxParticipants} registered
              </Text>
              <Text style={styles.offerInfo}>Status: {item.status}</Text>
            </Card.Content>
          </Card>
        )}

      />
      </Card>

    </>

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
    textAlign: "center",
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
  gridItem: {
    flex: 1,
    marginVertical: 6,
    maxWidth: 200,
  },

  /*offerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center",
  },*/

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  closeButton: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
fontSize: 18,
        fontFamily: "Inter_300Light",
        left: 9,
        marginBottom: 10, 
                      marginLeft:20,

  },
});