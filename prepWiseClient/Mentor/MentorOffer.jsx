import { View, Text,Dimensions, ScrollView, Image, TouchableOpacity, Platform, StyleSheet, SafeAreaView, Alert } from "react-native";
import NavBarMentor from "./NavBarMentor";
import { useEffect, useState } from "react";
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import GeminiChat from '../GeminiChat';
import { useContext } from 'react';
import { UserContext } from '../UserContext'; 
import { SegmentedButtons,Card ,RadioButton,TextInput} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalRN  from 'react-native-modal';
  const { width } = Dimensions.get('window');
  import {Calendar} from 'react-native-calendars';
  import Slider from '@react-native-community/slider';
import CalendarScreen from '../CalendarScreen'
import {apiUrlStart} from '../api';

export default function MentorOffer(){
    const { Loggeduser } = useContext(UserContext);


    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light
      });
     
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
       }
  
  if(!response.ok){
    throw new Error('failed to find user')
  }
    }catch(error){
  console.log(error)
    }
}     
  const [showChat, setShowChat] = useState(false);
    const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
    const LogoImage = () => {
        if (Platform.OS === "ios") {
            return <Image source={require('../assets/prepWise Logo.png')} style={appliedStyles.logo} />;
        }
    };



    const [value, setValue] = useState(1);


    
  return(<>
<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
<ScrollView
    contentContainerStyle={{ paddingBottom: 60 }}
    style={{ flex: 1 }}
  >
<NavBarMentor />

                {/** logo component is here only for mobile*/}
                <LogoImage />
  
                <View style={{ paddingHorizontal: 20, paddingTop: 100 }}>
              
        <Card style={{ margin: 20, padding: 16 }}>
        <Text style={appliedStyles.title}>
        Create A Mentoring Offer ✨
      </Text>
   
      <Text style={appliedStyles.subtitle}> Here you can open a lecture with a topic of your choice !</Text>
          <Card.Title 
            title={<Text style={appliedStyles.subtitle}>Date&Time</Text>}
           />
           <CalendarScreen/>
          <Card.Content>
       
            <View style={{ marginTop: 20 ,marginBottom:30,padding:20}}>
           
            </View>


            <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>Topic</Text>

<TextInput 
                    style={appliedStyles.halfInput} 
                    placeholder="What's the topic of your lecture? "
                    placeholderTextColor="#888"
                    contentStyle={{backgroundColor:"#FFF"
                    }}
                    mode="outlined"
                     />
      </View>

      <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>Add your message</Text>

<TextInput 
                    style={appliedStyles.halfInput} 
                    placeholder="Add "
                    placeholderTextColor="#888"
                    contentStyle={{backgroundColor:"#FFF"
                    }}
                    mode="outlined"
                     />
      </View>

            <Text style={appliedStyles.subtitle}>Max Participants</Text>
            <Text style={appliedStyles.subtitle}>{value}</Text>

            <Slider
        style={{ width: 250, height: 40 }}
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={value}
        minimumTrackTintColor="#9FF9D5"
        maximumTrackTintColor="#CCCCCC"
        thumbTintColor="#9FF9D5"
        onValueChange={(val) => setValue(val)}
      />


      <TouchableOpacity style={appliedStyles.loginButton} >
      <Text style={appliedStyles.loginText}>CREATE OFFER</Text>
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
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 50,
        flexDirection: 'row', 
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Inter_400Regular",
        flex: 1, // Allows text to expand properly
    },
    inputBlock: {
        width: '50%', 
      },
      inputTitle: {
        fontSize: 14,
        marginBottom: 5,
        fontFamily:"Inter_200ExtraLight",

      },
      halfInput: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        fontFamily:'Inter_200ExtraLight',
        fontSize:13,
        marginBottom: 8, 
      },
      descriptionCard:{
        width:'100%',
        marginTop: 16,
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
});
const Webstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 150,
        flexDirection: 'row', // Ensures text and image are side by side
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
        alignSelf:'center'
      },
      loginText: {
        color: 'white',
        fontFamily:'Inter_400Regular',
    
      },
});
