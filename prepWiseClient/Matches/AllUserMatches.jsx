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
import { useNavigation } from "@react-navigation/native";
import NavBarMentor from '../Mentor/NavBarMentor'
import {apiUrlStart} from '../api';

const AllUserMatches = () => {
  const { Loggeduser } = useContext(UserContext);
  const [showChat, setShowChat] = useState(false);
  const [mentors, setMentors] = useState(null);
  const navigation = useNavigation();
    const [userType, setUserType] = useState('');

//FONTS
   const [fontsLoaded] = useFonts({
       Inter_400Regular,
       Inter_700Bold,
       Inter_100Thin,
       Inter_200ExtraLight,
       Inter_300Light
     });

  
  const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;

  // This runs only once when Loggeduser is first set
useEffect(() => {
    if (Loggeduser?.id) {
      loginAsUser(Loggeduser.email, Loggeduser.password);
    }
  }, [Loggeduser?.id]);

  const loginAsUser=async (email,password )=>{
    console.log(email,password,Loggeduser.password)

    try{
      console.log("Sending request to API...");
  const API_URL = `${apiUrlStart}/api/Users/SearchUser` 
      const response =await fetch (API_URL, { 
        method: 'POST', // Specify that this is a POST request
        headers: {
          'Content-Type': 'application/json' // Indicate that you're sending JSON data
        },
        body: JSON.stringify({ // Convert the user data into a JSON string
            UserId: 0,
            FirstName: "String",
            LastName: "String",
            Email: email,
            Password: password,
            CareerField: ["String"], // Convert to an array
            Roles: ["String"], // Convert to an array
            Company: ["String"], // Convert to an array
            Experience: "String",
            Picture: "String",
            Language: ["String"], // Convert to an array
            FacebookLink: "String",
            LinkedInLink: "String",
            IsMentor:false
        })
      });

      console.log("response ok?", response.ok);

      if(response.ok)
       {
        console.log('user found ')
        
          // Convert response JSON to an object
        const userData = await response.json();
        console.log(userData)
        console.log('IsMentor value:', userData?.isMentor);

        const type = userData?.isMentor ? 'mentor' : 'jobSeeker';
        setUserType(type)
        console.log('user type:',type )
       }
  
  if(!response.ok){
    throw new Error('failed to find user')
  }
    }catch(error){
  console.log(error)
    }
} 

  useEffect(() => {
    const fetchMatchesFromServer = async () => {
      try {
      if (!Loggeduser?.id || !userType) return;

        const response = await fetch(`${apiUrlStart}/api/MentorMatching/UserMatches/${Loggeduser.id}?userType=${userType}`);
        console.log("loggeduser",Loggeduser.id)
        if (!response.ok) {
          console.error('Failed to fetch sessions');
          return;
        }

        const data = await response.json();
        setMentors(data);
        console.log("data", data);

      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatchesFromServer();
  }, [Loggeduser,userType]);

  //////לסדר שאנחנו רוצים בלחיצה על מנטור ספציפי לעבור לסשנים שלו!
  const handleMentorPress = (jobseekerID,mentorID,JourneyID,FirstName,LastName) => {
    console.log("journeyID:",JourneyID)
    navigation.navigate("SessionSplitView", {
        jobseekerID: jobseekerID,
        mentorID: mentorID,
        JourneyID: JourneyID,
        FirstName:FirstName,
        LastName:LastName
      });  
    };

  const renderItem = ({ item }) => {

    const mentor = item.mentor;
    const imageSource = mentor.picture == 'string'
      ? require('../assets/defaultProfileImage.jpg')
      : { uri: mentor.picture };

   
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={appliedStyles.container}>
          <Card style={appliedStyles.screenCard}>
            <Text style={appliedStyles.title}>All Matches</Text>
            
<FlatList
  data={mentors}
  keyExtractor={(item) => item.JourneyID.toString()}
  renderItem={({ item }) => (
        <View style={appliedStyles.itemRow}>
    <View style={appliedStyles.card}>
      <Image 
        source={{ uri: item.Picture }} 
        style={appliedStyles.picture} 
      />
      <Text style={appliedStyles.nameText}>
     {item.FirstName} {item.LastName}
      </Text>


 {/* Action Buttons Container */}
        <View style={appliedStyles.buttonContainer}>
          {/* Chat Button */}
        <TouchableOpacity 
  style={appliedStyles.actionButton}
  onPress={() => 
    navigation.navigate("ChatScreen", {
      user: Loggeduser,
     otherUser : {
    id: userType === 'mentor' ? item.JobSeekerID : item.MentorID,
    FirstName: item.FirstName,
    LastName: item.LastName,
    Picture: item.Picture,
  }
}
  )
  }
>
            <Ionicons name="chatbubble-outline" size={20} color="#4A90E2" />
            <Text style={appliedStyles.buttonText}>Chat</Text>
          </TouchableOpacity>
          
          {/* Sessions Button */}
          <TouchableOpacity 
            style={appliedStyles.actionButton}
            onPress={() => handleMentorPress(item.JobSeekerID, item.MentorID, item.JourneyID,item.FirstName,item.LastName)}
          >
            <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
            <Text style={appliedStyles.buttonText}>Sessions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
          
{userType === 'mentor' ? <NavBarMentor /> : <NavBar />}
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
      paddingHorizontal: 20,
    },
  
    screenCard:{
      //  margin: 20,
         padding: 16 ,
         width:'120%',
         alignSelf:'center',
         elevation:2,
         shadowColor:'#E4E0E1',
         flex: 1, // add this

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
    nameText: {
      fontWeight: '600',
      fontSize: 16,
      color: '#333',
    },
    picture:{
      width: 80, 
      height: 80, 
      borderRadius: 40, 
      marginBottom: 8,
      marginRight: 20,
      marginLeft:40 
    }
    ,
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
      bottom: -200,
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
      bottom: -150,
      right: 10,
      width: '50%',
      height: 400,
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
      width:"120%",
      margin:40,
  alignSelf:'center',
  },
 card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // recommended light color for contrast
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    //alignContent:'space-around',
    gap: 5, // ✅ adds spacing between items
    shadowColor: '#E4E0E1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  
    // ✅ Shadow for Android
    elevation: 4,
  },
  buttonContainer:{
//marginLeft:10,
    gap: 10, // ← cleaner spacing between buttons

},
  actionButton: {
  flexDirection: 'row',
left:0,
 // backgroundColor: '#9FF9D5',
  paddingVertical: 10,
  paddingHorizontal: 40,
  borderRadius: 10,
  //marginRight: 10,
  shadowColor: '#E4E0E1',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 2,

},

buttonText: {
  fontSize: 14,
  color: '#003D5B',
  fontWeight: '500',
 paddingHorizontal: 10

},
  });
const Webstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
alignContent:'space-around'
  },
  screenCard:{
    margin: 20,
     padding: 16 ,
 },
  title: {
  fontSize: 20,
        marginTop: 8,
        fontFamily:"Inter_300Light" ,  
         textAlign: 'center',
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
    alignContent:'space-around',
    gap: 30, // ✅ adds spacing between items
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
  nameText: {
     fontSize: 15,
      margin: 8,
      fontFamily:"Inter_300Light",
  },
  picture:{
      width: 100, 
      height: 100, 
      borderRadius: 50, 
      marginBottom: 8,
     // marginRight: 20,
     // marginLeft:40 
    },
  /*,
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
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
justifyContent: "center",
alignItems: "center",
zIndex: 9999,
},
itemRow:{
    width:"50%",
alignSelf:'center',
},
mentorText:{
fontFamily:"Inter_400Regular",
 
},
buttonRow: {
  flexDirection: 'row',
  marginTop: 10,
  gap: 10, // works in RN 0.71+
},

buttonContainer:{
marginLeft:50,
  gap: 10, // ← cleaner spacing between buttons

},
actionButton: {
  flexDirection: 'row',
left:0,
 // backgroundColor: '#9FF9D5',
  paddingVertical: 10,
  paddingHorizontal: 40,
  borderRadius: 10,
  //marginRight: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 2,

},

buttonText: {
  fontSize: 14,
  color: '#003D5B',
  fontWeight: '500',
 paddingHorizontal: 10

},

});

export default AllUserMatches;