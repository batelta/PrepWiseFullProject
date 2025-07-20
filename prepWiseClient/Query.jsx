import { View, Text,Dimensions, ScrollView, Image, TouchableOpacity, Platform, StyleSheet, SafeAreaView, Alert } from "react-native";
import NavBar from "./NavBar";
import {  useState } from "react";
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import GeminiChat from './GeminiChat';
import { useContext } from 'react';
import { UserContext } from './UserContext'; 
import { Card ,RadioButton,TextInput} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalRN  from 'react-native-modal';
  const { width } = Dimensions.get('window');
  import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { useRoute,useNavigation } from "@react-navigation/native";
import {apiUrlStart} from './api';


export default function Query(){
    const navigation = useNavigation();
    const route = useRoute();
    const { userType ,userID} = route.params;


    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light
      });
   
      
    // This runs only once when Loggeduser is first set

       
  const [showChat, setShowChat] = useState(false);
    const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
    const LogoImage = () => {
        if (Platform.OS === "ios") {
            return <Image source={require('./assets/prepWise Logo.png')} style={appliedStyles.logo} />;
        }
    };


    const handleSelect = (questionKey, selectedItem) => {
        setTraits(prev => ({
          ...prev,
          [questionKey]: selectedItem.id
        }));
      };
      const questionTextByUserType = {
        socialStyle: {
          jobSeeker: 'How do you feel in social situations?',
          mentor: 'How do you feel in social situations?'
        },
        guidanceStyle: {
          jobSeeker: 'What kind of guidance helps you most?',
          mentor: 'How do you prefer to guide mentees?'
        },
        communicationStyle: {
          jobSeeker: 'How do you prefer to communicate?',
          mentor: 'What communication style do you naturally use with mentees?'
        },
        learningStyle: {
          jobSeeker: 'How do you learn best?',
          mentor: 'How do you prefer to teach or explain things?'
        },
        jobExperienceLevel: {
          jobSeeker: 'Where are you in your job search journey?',
          mentor: 'What level of job seeker do you prefer to mentor?'
        }
      };
      const questionOptions = {
        socialStyle: [
          { id: 'Introvert', name: 'I prefer quiet and one-on-one conversations.' },
          { id: 'Extrovert', name: 'I enjoy group settings and talking to many people.' }
        ],
        guidanceStyle: [
          { id: 'Structured', name: 'Clear instructions and structure' },
          { id: 'Flexible', name: 'Open discussion and flexibility' }
        ],
        communicationStyle: [
          { id: 'Calm', name: 'Calm and thoughtful conversations' },
          { id: 'Energetic', name: 'Energetic and fast-paced discussions' }
        ],
        learningStyle: [
          { id: 'StepByStep', name: 'Step-by-step guidance' },
          { id: 'BigPicture', name: 'Big-picture explanations and examples' }
        ],
        jobExperienceLevel: {
            jobSeeker: [
              { id: 'Beginner', name: 'It’s my first job hunt.' },
              { id: 'Intermediate', name: 'I’ve looked before but haven’t landed a job yet.' },
              { id: 'Experienced', name: 'I’ve worked before and am looking again.' }
            ],
            mentor: [
              { id: 'Beginner', name: 'I prefer to mentor those just starting out.' },
              { id: 'Intermediate', name: 'I like helping people who have some experience.' },
              { id: 'Experienced', name: 'I prefer experienced job seekers aiming higher.' }
            ]
          }
      };
      
        const [traits, setTraits] = useState({
          socialStyle: '',
          guidanceStyle: '',
          communicationStyle: '',
          learningStyle: '',
          jobExperienceLevel: ''
        });
        const questionKeys = Object.keys(questionTextByUserType);

        const pageTitle = userType === 'mentor'
        ? 'Help Us Understand Your Mentoring Style 🫱🏼‍🫲🏼'
        : 'To Find Your Perfect Mentor, Tell Us a Bit About You 🙂';
    
      const pageSubtitle = userType === 'mentor'
        ? 'Your answers will help us match you with mentees who benefit from your unique strengths.'
        : 'Your answers will help us connect you with a mentor who truly fits your learning and communication style.';
  return(<>
<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
<ScrollView
    contentContainerStyle={{ paddingBottom: 60 }}
    style={{ flex: 1 }}
  >

                {/** logo component is here only for mobile*/}
                <LogoImage />
  
                <View style={appliedStyles.Topview}>
              
        <Card style={appliedStyles.screenCard}>
        <Text style={appliedStyles.title}>{pageTitle}</Text>
          <Card.Title 
            title={<Text style={appliedStyles.subtitle}>{pageSubtitle}</Text>}
           />
          <Card.Content>



          {questionKeys.map((key) => (
                <View key={key} style={appliedStyles.Dropcontainer}>
                  <Text style={appliedStyles.inputTitle}>
                    {questionTextByUserType[key][userType]}
                  </Text>
                  <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    data={
                        key === 'jobExperienceLevel'
                        ? questionOptions[key][userType]
                        : questionOptions[key]
                    }
                    labelField="name"
                    valueField="id"
                    placeholder="Select"
                    value={traits[key]}
                    onChange={(item) => handleSelect(key, item)}
                    />

  </View>
))}



      <TouchableOpacity   style={appliedStyles.loginButton}
  onPress={async () => {
    console.log('pressed');
    console.log(traits);
    console.log(userID);


    try {
      const response = await fetch(`${apiUrlStart}/api/Users/traits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...traits,
          userId: userID // Add this if needed for the backend to know which user's traits these are
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save traits");
      }

      console.log("Traits saved successfully");

      if (userType === 'jobSeeker') {
        console.log("Navigating to MatchRequestJobSeeker");
        navigation.navigate("MatchRequestJobSeeker");
      } else if (userType === 'mentor') {
        console.log("Navigating to HomePageMentor");
        navigation.navigate("HomePageMentor");
      }

    } catch (error) {
      console.error("Error submitting traits:", error);
      Alert.alert("Error", "Could not save your traits. Please try again.");
    }
  }}
>
      <Text style={appliedStyles.loginText}>SUBMIT</Text>
        </TouchableOpacity>
          </Card.Content>
        </Card>

        </View>



                       {/* Bot Icon */}
 <TouchableOpacity
  style={appliedStyles.chatIcon}
  onPress={() => setShowChat(!showChat)}
>
<FontAwesome6 name="robot" size={24} color="#9FF9D5" />
</TouchableOpacity>
<NavBar />

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

</ScrollView>
</SafeAreaView>
</>
  );


}

const styles = StyleSheet.create({
  
    title: {
      fontSize: 20,
      marginTop: 8,
      fontFamily:"Inter_300Light"
    },
    subtitle:{
      fontSize: 13,
      //  marginTop: 8,
        fontFamily:"Inter_300Light",

  },
    inputBlock: {
        width: '50%', 
      },
      inputTitle: {
        fontSize: 13,
        marginTop: 8,
        fontFamily:"Inter_300Light"

      },
      halfInput: {
        width: '150%',
        height:40,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor:'#fff',
        borderRadius: 5,
        fontFamily:'Inter_200ExtraLight',
        fontSize:13,
        marginBottom: 8, 
      },
      descriptionCard:{
        width:'100%',
        marginTop: 16,
           elevation:1,
          shadowColor:'#E4E0E1'
      },
   
    chatIcon:{
        position: "absolute",
        bottom: 65,
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
        width: '90%',
        height: 500,
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
      loginButton: {
        backgroundColor: '#BFB4FF',
        padding: 12,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
      },
      loginText: {
        color: 'white',
        fontFamily: 'Inter_400Regular',
      },
      screenCard:{
         margin: 20,
          padding: 16 ,
          width:'110%',
          alignSelf:'center',
          elevation:2,
          shadowColor:'#E4E0E1'
      },
      Topview:{
         paddingHorizontal: 20, 
         paddingTop:20,
         paddingBottom:40
      },
      Dropcontainer: {
        width: '100%',
      },
      dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginBottom:15

      },
      placeholderStyle: {
        color: '#888',
        fontSize: 13,
        fontFamily: 'Inter_200ExtraLight',
      },
      selectedTextStyle: {
        color: '#888',
        fontSize: 13,
        fontFamily: 'Inter_200ExtraLight',
      },
      itemTextStyle: {
        fontFamily: 'Inter_200ExtraLight',
        fontSize: 13,
        color: '#888',
      },
});
const Webstyles = StyleSheet.create({
   
    screenCard:{
      margin: 20,
       padding: 16 
   },
    title: {
        fontSize: 20,
        marginTop: 8,
        fontFamily:"Inter_300Light"

    },
    subtitle:{
        fontSize: 13,
      //  marginTop: 8,
        fontFamily:"Inter_300Light",
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
      inputBlock: {
        width: '50%', 
      },
      inputTitle: {
        fontSize: 13,
        marginTop: 8,
        fontFamily:"Inter_300Light"
      },
      halfInput: {
        width: 300,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor:'#fff',
        borderRadius: 5,
        fontFamily:'Inter_200ExtraLight',
        fontSize:13,
        height:35
      },
      descriptionCard:{
        width:'100%',
        marginTop: 16,
      },
      descriptionCardcontent:{
        alignItems: 'center', // Centers items inside Card.Content
       // justifyContent: 'center',
        padding:0,
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
      loginButton: {
        backgroundColor: '#BFB4FF',
        padding: 12,
        borderRadius: 5,
        width: '70%',
        alignItems: 'center',
        alignSelf:'center',
        marginTop:15
      },
      loginText: {
        color: 'white',
        fontFamily:'Inter_400Regular',
    
      },
      Topview:{
        paddingHorizontal: 20, 
        paddingTop: 100 
     },
     Dropcontainer: {
        width: '100%',
      },
      dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
      },
      placeholderStyle: {
        color: '#888',
        fontSize: 13,
        fontFamily: 'Inter_200ExtraLight',
      },
      selectedTextStyle: {
        color: '#888',
        fontSize: 13,
        fontFamily: 'Inter_200ExtraLight',
      },
      itemTextStyle: {
        fontFamily: 'Inter_200ExtraLight',
        fontSize: 13,
        color: '#888',
      },
});
