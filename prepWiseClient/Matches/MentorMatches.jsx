
import React from 'react';
import { useState ,useEffect} from 'react';
import { View, Text, StyleSheet,ScrollView,SafeAreaView, FlatList, Image, TouchableOpacity ,Platform} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../NavBar';
import GeminiChat from '../GeminiChat'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Card } from 'react-native-paper';
import MentorProfileDialog  from './MentorProfileDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';





const MentorMatches = () => {
    const [showChat, setShowChat] = useState(false);
    const [mentorModalVisible, setMentorModalVisible] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [mentors,setMentors]=useState(null)
    const handleMentorPress = (mentor) => {
        setSelectedMentor(mentor);
        setMentorModalVisible(true);
      };
    const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
  

    useEffect(() => {
        const fetchMentors = async () => {
          try {
            const storedMentors = await AsyncStorage.getItem("mentors");
            if (storedMentors !== null) {
              setMentors(JSON.parse(storedMentors));
            }
          } catch (e) {
            console.error("Failed to load mentors:", e);
          }
        };
    
        fetchMentors();
      }, []);
      const renderItem = ({ item }) => {
        const imageSource =
          item.picture === "string"
            ? require('../assets/defaultProfileImage.jpg')
            : { uri: item.picture };
    
        return (
            <TouchableOpacity style={appliedStyles.itemRow} onPress={() => handleMentorPress(item)} >
            <View style={appliedStyles.card}>
            <Image source={imageSource} style={appliedStyles.avatar} />
            <View>
              <Text style={appliedStyles.name}>{item.firstName}</Text>
              <Text style={appliedStyles.role}>
                {Array.isArray(item.careerField)
                  ? item.careerField.join(', ')
                  : String(item.careerField)}
              </Text>
            </View>
        
          </View>
          </TouchableOpacity>
      
        );
        
      };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <ScrollView
      
      style={{ flex: 1 }}>


    <View style={appliedStyles.container}>
                <Card style={appliedStyles.screenCard}>

      <Text style={appliedStyles.title}>
        Based on your areas of interest and preferences, {"\n"}
        here are your mentor matches!🎯
      </Text>

      <FlatList
        data={mentors}
        keyExtractor={(item) => item.userID}
        renderItem={renderItem}
        contentContainerStyle={appliedStyles.list}
        showsVerticalScrollIndicator={false}
      />

         {/* Bot Icon */}
 <TouchableOpacity
  style={appliedStyles.chatIcon}
  onPress={() => setShowChat(!showChat)}
>
<FontAwesome6 name="robot" size={24} color="#9FF9D5" />
</TouchableOpacity>

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
    
    {mentorModalVisible &&selectedMentor && (
        <View style={appliedStyles.overlay}>
  <MentorProfileDialog 
    visible={mentorModalVisible} 
    onClose={() => setMentorModalVisible(false)} 
    mentor={selectedMentor}
  />
</View>
)
}
  {/* תפריט תחתון */}
  <NavBar/>
    </View>
 </ScrollView>
</SafeAreaView>
);
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      //padding: 60,
      paddingHorizontal: 20,
    },
    screenCard:{
        margin: 20,
         padding: 16 ,
         width:'100%',
         alignSelf:'center',
         elevation:2,
         shadowColor:'#E4E0E1',
           flex: 1, // add this

     },
    title: {
        fontSize: 15,
        marginTop: 8,
        fontFamily:"Inter_300Light",
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
     padding: 16 ,

 },
 title: {
  fontSize: 20,
  marginTop: 8,
  fontFamily:"Inter_300Light",
marginBottom: 30,
alignSelf:'center'
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
  name: {
    fontFamily:'Inter_200ExtraLight',
    fontSize: 16,
    color: '#333',
  },
  role: {
    fontFamily:'Inter_200ExtraLight',
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

export default MentorMatches;