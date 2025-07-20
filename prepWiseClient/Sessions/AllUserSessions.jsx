import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList,
  Image, TouchableOpacity, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {Inter_400Regular,Inter_300Light, Inter_700Bold,Inter_100Thin,Inter_200ExtraLight } from '@expo-google-fonts/inter';
import NavBar from '../NavBar';
import GeminiChat from '../GeminiChat';
import { UserContext } from '../UserContext';
import SessionSplitView from './SessionSplitView';
import { useNavigation } from "@react-navigation/native";

const AllUserSessions = () => {
  const { Loggeduser } = useContext(UserContext);
  const [showChat, setShowChat] = useState(false);
  const [mentors, setMentors] = useState(null);
  const navigation = useNavigation();

//FONTS
   const [fontsLoaded] = useFonts({
       Inter_400Regular,
       Inter_700Bold,
       Inter_100Thin,
       Inter_200ExtraLight,
       Inter_300Light
     });

  
  const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;

  useEffect(() => {
    const fetchSessionsFromServer = async () => {
      try {
        if (!Loggeduser) return;

        const response = await fetch(`http://localhost:5062/api/MentorMatching/UserSessions/${Loggeduser.id}`);
        console.log("loggeduser",Loggeduser.id)
        if (!response.ok) {
          console.error('Failed to fetch sessions');
          return;
        }

        const data = await response.json();
        setMentors(data);
        console.log("data", data);

      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessionsFromServer();
  }, [Loggeduser]);

  //////לסדר שאנחנו רוצים בלחיצה על מנטור ספציפי לעבור לסשנים שלו!
  const handleMentorPress = (jobseekerID,mentorID,matchID) => {
    navigation.navigate("SessionSplitView", {
        jobseekerID: jobseekerID,
        mentorID: mentorID,
        matchID: matchID,
      });  
    };

  const renderItem = ({ item }) => {

    const mentor = item.mentor;
    const imageSource = mentor.picture == 'string'
      ? require('../assets/defaultProfileImage.jpg')
      : { uri: mentor.picture };

    /*return (
      <TouchableOpacity style={appliedStyles.itemRow} onPress={() => handleMentorPress(mentor)}>
        <View style={appliedStyles.card}>
          <Image source={imageSource} style={appliedStyles.avatar} />
          <View>
            <Text style={appliedStyles.name}>{mentor.firstName}</Text>
            <Text style={appliedStyles.role}>
              {Array.isArray(mentor.careerField)
                ? mentor.careerField.join(', ')
                : String(mentor.careerField)}
            </Text>
            <Text style={{ color: '#888', fontSize: 13, marginTop: 5 }}>
              📅 {new Date(item.date).toLocaleString()} | סטטוס: {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );*/
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={appliedStyles.container}>
          <Card style={appliedStyles.screenCard}>
            <Text style={appliedStyles.title}>All Sessions</Text>
            
<FlatList
  data={mentors}
  keyExtractor={(item) => item.MatchID.toString()}
  renderItem={({ item }) => (
<TouchableOpacity style={appliedStyles.itemRow} onPress={() => handleMentorPress(item.JobSeekerID,item.MentorID,item.MatchID)}>
    <View style={appliedStyles.card}>
      <Image 
        source={{ uri: item.Picture }} 
        style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 8,marginRight: 20,marginLeft:40 }} 
      />
      <Text style={appliedStyles.mentorText}>
        Journey with {item.FirstName} {/*{item.LastName}*/}
      </Text>
    </View>
    </TouchableOpacity>

  )}
/>


            {/* כפתור צ'אט עם אייקון */}
            <TouchableOpacity style={appliedStyles.chatIcon} onPress={() => setShowChat(!showChat)}>
              <FontAwesome6 name="robot" size={24} color="#9FF9D5" />
            </TouchableOpacity>

            {/* חלון צ'אט */}
            {showChat && (
              <View style={appliedStyles.overlay}>
                <View style={appliedStyles.chatModal}>
                  <TouchableOpacity onPress={() => setShowChat(false)} style={{ alignSelf: 'flex-end', padding: 5 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✖</Text>
                  </TouchableOpacity>
                  <GeminiChat />
                </View>
              </View>
            )}
          </Card>

          {/* תפריט תחתון */}
          <NavBar />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingTop: 60,
    //  paddingHorizontal: 20,
    },
    screenCard:{
        margin: 20,
         padding: 16 ,
         width:'110%',
         alignSelf:'center',
         elevation:2,
         shadowColor:'#E4E0E1'
     },
    title: {
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      color: '#1F1F1F',
      marginBottom: 30,
      fontFamily:"Inter_400Regular"
    },
    list: {
      paddingBottom: 100,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF', // recommended light color for contrast
      borderRadius: 16,
      padding: 15,
      marginBottom: 15,
      alignItems: 'center',
    
        elevation:0,
          shadowColor:'#E4E0E1'
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
    },
    name: {
      fontWeight: '600',
      fontSize: 16,
      color: '#333',
    },
    role: {
      color: '#777',
      fontSize: 14,
    },
    chatButton: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      backgroundColor: '#6C63FF',
      borderRadius: 30,
      padding: 15,
      elevation: 5,
    },
    tabBar: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: 70,
     // backgroundColor: '#ECE7FF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 10,
    },
    chatIcon: {
      position: "absolute",
      bottom: 5,
      right: 45,
      backgroundColor: "#fff",
      borderRadius: 30,
      padding: 12,
      zIndex: 999, // ערך גבוה יותר כדי להבטיח שיופיע מעל כל אלמנט אחר
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3, // הגדלנו את אטימות הצל
      shadowRadius: 5,
      elevation: 8, 
      borderWidth: 1,
      borderColor: "rgba(159, 249, 213, 0.3)", // מסגרת בצבע דומה לאייקון
      marginBottom: 12,
    },
    chatModal:{
      position: 'absolute',
      bottom: 0,
      right: 10,
      width: '30%',
      height: 480,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
  },
  overlay: {
    position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",alignItems: "center",zIndex: 9999,
  },
  itemRow:{
      width:"50%",
  alignSelf:'center',
  },
  });
const Webstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  screenCard:{
    margin: 20,
     padding: 16 
 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F1F1F',
    marginBottom: 30,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // recommended light color for contrast
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  
    // ✅ Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  
    // ✅ Shadow for Android
    elevation: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  /*name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  role: {
    color: '#777',
    fontSize: 14,
  },*/
  chatButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#6C63FF',
    borderRadius: 30,
    padding: 15,
    elevation: 5,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
   // backgroundColor: '#ECE7FF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  chatIcon: {
    position: "absolute",
    bottom: 5,
    right: 45,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 12,
    zIndex: 999, // ערך גבוה יותר כדי להבטיח שיופיע מעל כל אלמנט אחר
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, // הגדלנו את אטימות הצל
    shadowRadius: 5,
    elevation: 8, 
    borderWidth: 1,
    borderColor: "rgba(159, 249, 213, 0.3)", // מסגרת בצבע דומה לאייקון
    marginBottom: 12,
  },
  chatModal:{
    position: 'absolute',
    bottom: 0,
    right: 10,
    width: '30%',
    height: 480,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
},
overlay: {
  position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
justifyContent: "center",alignItems: "center",zIndex: 9999,
},
itemRow:{
    width:"50%",
alignSelf:'center',
},
mentorText:{
fontFamily:"Inter_400Regular",
 
}
});

export default AllUserSessions;