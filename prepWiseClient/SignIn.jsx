
import React, { useState,useEffect } from 'react';
import { View,Dimensions,ScrollView, Text, TextInput, TouchableOpacity, Image, StyleSheet,Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
  import CustomPopup from "./CustomPopup"; // Import the custom popup
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or any other icon set
  import { useContext } from 'react';
  import { UserContext } from './UserContext'; // adjust the path
import {apiUrlStart} from './api';

  const { height,width } = Dimensions.get('window');

const SignIn = ({navigation}) => {
    const { setLoggedUser} = useContext(UserContext);

  const [isMentor, setIsMentor]=useState(false)
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [errorPopupVisible, setErrorPopupVisible] = useState(false);

   const loginAsUser=async (email,password )=>{
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

          if (response.ok) {
            const rawText = await response.text();
            console.log("response text:", rawText);
      
            if (rawText === "") {
              console.log("User not found (empty response)");
              setErrorPopupVisible(true); // Show custom popup
              return;
            }
      
            const userData = JSON.parse(rawText); // Safe to parse now
            console.log("Parsed user:", userData);
      
            const filteredUserData = {
              password: userData.password,
              email: userData.email,
              id: userData.userID,
            };
      
            await AsyncStorage.setItem("user", JSON.stringify(filteredUserData));
            setLoggedUser(filteredUserData);
            setIsMentor(userData.isMentor);
            setSuccessPopupVisible(true); // Success popup
          } else {
            console.error("API response not OK");
            setErrorPopupVisible(true);
          }
      
        } catch (error) {
          console.error("Error in loginAsUser:", error);
          setErrorPopupVisible(true);
        }
      };



  const [fontsLoaded] = useFonts({
      Inter_400Regular,
      Inter_700Bold,
      Inter_100Thin,
      Inter_200ExtraLight,
      Inter_300Light
    });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [secureText, setSecureText] = React.useState(true); // State to toggle password visibility

   
  
   const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
  
  return (
    
    <ScrollView keyboardShouldPersistTaps="handled">
  {successPopupVisible && (
            <View style={styles.overlay}>
                    <CustomPopup visible={successPopupVisible}
                  onDismiss={() => {
   
  setTimeout(() => {
    navigation.navigate(isMentor ? "HomePageMentor" : "HomePage");
  }, 150); // Wait a bit so the popup can show
                    setSuccessPopupVisible(false); 

                  }}
                    icon="check-circle" message="User Logged In successfully!"
                     />
                     </View>   )}
                     {errorPopupVisible && (
            <View style={styles.overlay}>
                    <CustomPopup visible={errorPopupVisible}
                  onDismiss={() => {
                    setErrorPopupVisible(false);
                  }}
                    icon="alert-circle-outline" message="Failed to Log In!"
                     />
                     </View>   )}
    <View style={appliedStyles.container}>
  
    {/**  <Image source={require('./assets/prepWise Logo.png')}
      style={styles.logo}/> */}
      <View style={appliedStyles.loginBox}>
       
        <View  style={appliedStyles.avatarContainer}>
        <AntDesign name="user" size={60} color="white"/>
        </View>
        <TextInput
          style={appliedStyles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={appliedStyles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
        />
          <TouchableOpacity onPress={() => setSecureText(!secureText)} style={appliedStyles.eyeIcon}>
            <Icon name={secureText ? 'eye-off' : 'eye'} size={24} color="#BFB4FF" />
          </TouchableOpacity>
  
        <View style={{flexDirection:'row',marginTop:30,marginBottom:20}}>
      <Text style={appliedStyles.footer}>Don't have an account? </Text>
      <Text style={appliedStyles.CreateAccounttext}
      onPress={()=> navigation.navigate('SignUp')}>Create Account</Text>
      </View>
        <TouchableOpacity style={appliedStyles.loginButton} onPress={() => loginAsUser(email, password)}>
          <Text style={appliedStyles.loginText} >LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',    
    alignItems: 'center',       
    backgroundColor: '#f9f9f9',
    height:height
  },
  loginBox: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    elevation: 5,

  },
  
  avatarContainer: {
    backgroundColor: '#BFB4FF',
    width: 80, 
    height: 80, 
    borderRadius: 40,
    justifyContent: 'center',
    alignSelf:'center',
    alignItems: 'center',
    marginBottom: 20,  
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    fontFamily: 'Inter_200ExtraLight',
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#BFB4FF',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,  
  },
  CreateAccounttext: {
    textDecorationLine: 'underline',
    color: '#003D5B',
  },
  overlay: 
  {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",alignItems: "center",zIndex: 9999,
  },
  loginText: {
    color: 'white',
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    fontFamily: 'Inter_200ExtraLight',
    fontSize: 14,
    color: '#555',
  },
  eyeIcon: {
    position: 'absolute',
    right: 30,
    top: '60%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
});


const Webstyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#white',
  },
  loginBox: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  avatarContainer: {
    backgroundColor: '#BFB4FF',
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    width: '100%',
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    fontFamily:'Inter_200ExtraLight',
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  overlay: 
  {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",alignItems: "center",zIndex: 9999,
  },
  loginButton: {
    backgroundColor: '#BFB4FF',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  CreateAccounttext:{
    textDecorationLine:'underline',
    color:'#003D5B',
    bottom:3
  },
  loginText: {
    color: 'white',
    fontFamily:'Inter_400Regular',

  },
  footer: {
    fontFamily: 'Inter_200ExtraLight',
    fontSize: 13,
    color: '#555',
  },
  eyeIcon: {
    position: 'absolute',
    right:30,
    top: '50%',
    zIndex: 1
  },
});

export default SignIn;