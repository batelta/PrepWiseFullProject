import React, { useState, useEffect } from "react";
import { View, Text,Dimensions, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView,Platform  } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Button, Checkbox, Provider as PaperProvider } from 'react-native-paper';
import LanguageSelector from './LanguageSelector';
import CareerFieldSelector from './CareerFieldSelector';
import RolesSelector from './RolesSelector';
import { useFonts } from 'expo-font';
import {Inter_400Regular,Inter_300Light, Inter_700Bold,Inter_100Thin,Inter_200ExtraLight } from '@expo-google-fonts/inter';
import NavBar from "./NavBar";
import CustomPopup from "./CustomPopup";   
import ModalRN  from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { UserContext } from './UserContext'; // adjust the path
import defaultProfile from './assets/defaultProfileImage.jpg'; // make sure this path is correct
import fields from './CareerFields.json';
import {apiUrlStart} from './api';

const { width,height } = Dimensions.get('window');
const EditProfile = () => {


const { Loggeduser ,setLoggedUser } = useContext(UserContext);
const [popupVisible, setPopupVisible] = useState(false);
const navigation = useNavigation();

//fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light
  });

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    facebookLink: "",
    linkedinLink: "",
    picture: "",
    experience: "",
    language:[],
    careerField:[],
    roles:[],
  isMentor: false, // ← תוודאי שיש לך את זה באובייקט
  mentoringType:  "", // ← אם יש בחירה
  company:  "", // ← מה שהמשתמש בחר
  gender:  "", // ← אם יש בחירה של מגדר
  
});


//בדיקות התאמה לתבנית של השדות
const [errors, setErrors] = useState({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  facebookLink: "",
  linkedinLink: "",

});


const handleChange = (field, value) => {
setUser(prevUser => ({ ...prevUser, [field]: value }));

  // בדיקות שדה לפי השם של השדה
  if (field === "firstName") {
    if (!value.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, firstName: "" }));
    } else if (!/^[A-Za-z]{1,15}$/.test(value)) {
      setErrors(prevErrors => ({ ...prevErrors, firstName: "Only letters, up to 15 characters." }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, firstName: "" }));
    }
  }

  if (field === "lastName") {
    if (!value.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, lastName: "" }));
    } else if (!/^[A-Za-z]{1,15}$/.test(value)) {
      setErrors(prevErrors => ({ ...prevErrors, lastName: "Only letters, up to 15 characters." }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, lastName: "" }));
    }
  }

  if (field === "email") {
    if (!value.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, email: "" }));
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      setErrors(prevErrors => ({ ...prevErrors, email: "Enter a valid email address." }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, email: "" }));
    }
  }

  if (field === "password") {
    if (!value.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, password: "" }));
    } else if (!/[A-Za-z0-9]{5,10}$/.test(value)) {
      setErrors(prevErrors => ({ ...prevErrors, password: "Password must be 5-10 characters (Numbers/Letters)." }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, password: "" }));
    }
  }

  if (field === "facebookLink") {
    if (!value.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, facebookLink: "" }));
    } else if (!/^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9(\.\?)?(\#)?&%=+_\-\/]+$/.test(value)) {
      setErrors(prevErrors => ({ ...prevErrors, facebookLink: "Enter a valid Facebook URL." }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, facebookLink: "" }));
    }
  }

  if (field === "linkedinLink") {
    if (!value.trim()) {
      setErrors(prevErrors => ({ ...prevErrors, linkedinLink: "" }));
    } else if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+$/.test(value)) {
      setErrors(prevErrors => ({ ...prevErrors, linkedinLink: "Enter a valid LinkedIn URL." }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, linkedinLink: "" }));
    }
  }

};

  //const [fieldModalVisible, setFieldModalVisible] = React.useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  //const [selectedField, setSelectedField] = useState(null);

  //const Fields = ["Software Engineering", "Data Science", "Product Management", "UI/UX Design"];
  

  ///כל לחיצה על תחום = לבחור או לבטל בחירה
  /*const toggleField = (field) => {
    setSelectedField((prev) =>/* פה שונה גם הs*/
    //prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    //);
  //}
  ////
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const experiences = [
    "I'm just getting started! (0 years)",
    "I have some experience, but I'm still learning! (1-2 years)",
    "I'm building my career and expanding my skills. (2-4 years)",
    "I am an experienced professional in my field. (5-7 years)",
    "I have extensive experience and lead projects. (8+ years)",
    "I'm a seasoned expert in my area. (10+ years)"
  ];
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [userID, setUserID] = useState(null); // To store userID

  useEffect(() => {
    if (Loggeduser) {
      setUserID(Loggeduser.id);
        console.log(Loggeduser);
      }
    }, [Loggeduser]);

  //Get the user information and display it in inputs
  useEffect(() => {
  const fetchUserDetails = async () => {
    try {

      // קריאה ל-API לפי ID כדי לקבל את כל הנתונים (כולל תחומים ושפות)
      const response = await fetch(`${apiUrlStart}/api/Users?userId=${userID}`);
      if (!response.ok) {
        console.error("Failed to fetch full user data from API.");
        return;
      }

      const fullUserData = await response.json();
      console.log("Full user data from API:", fullUserData);

      // עדכון כל שדות המשתמש
      setUser({
        firstName: fullUserData.firstName || "",
        lastName: fullUserData.lastName || "",
        email: fullUserData.email || "",
        password: fullUserData.password || "",
        facebookLink: fullUserData.facebookLink || "",
        linkedinLink: fullUserData.linkedinLink || "",
        picture: fullUserData.picture === "string" 
      ? defaultProfile 
    : { uri: fullUserData.picture },
        experience: fullUserData.experience || "",
        language: fullUserData.language || [],
        careerField: fullUserData.careerField|| [],
        roles:fullUserData.roles||[],
        isMentor: fullUserData.isMentor || false,
  mentoringType: fullUserData.mentoringType || "",
  company: fullUserData.company || "",
  gender: fullUserData.gender || "",
 
        
      });
console.log(fullUserData.careerField ,fullUserData.roles);
      //נעשה להם set -עדכון התחומים והשפות לתצוגה
      //בנפרד מאחר ויש להם מספר ערכים שיכולים להישמר ונעדיף לשים אותם בstate נפרד
      //setSelectedField(fullUserData.careerField || []);
      if (fullUserData.careerField && fullUserData.careerField.length > 0) {
        // מציאת התחום הראשון במערך ה-fields על פי השם
        const firstFieldName = fullUserData.careerField[0];
        const fieldFromJson = fields.find(f => f.name === firstFieldName);
        if (fieldFromJson) {
          setSelectedField(fieldFromJson);
        }
      }
      setSelectedRoles(fullUserData.roles||[]);
      setSelectedLanguages(fullUserData.language || []);

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchUserDetails();
}, [userID]);

//ברגע שנטענו שפות חדשות למשתמש → הן יועתקו אל
//ה־State של בחירת השפות במסך
//אם המערך של השפות לא ריק, תעביר את הבחירות לselectedlanguages
//כלומר לעדכן את הבחירות על המסך
useEffect(() => {
  if (user.language.length > 0) {
    setSelectedLanguages(user.language);
  }
}, [user.language]);

useEffect(() => {
  if (user.roles.length > 0) {
    setSelectedRoles(user.roles);
  }
}, [user.roles]);

useEffect(() => {
  if (selectedField) {
    setUser(prevUser => ({
      ...prevUser,
      careerField: [selectedField.name] // שמירת שם התחום במערך
    }));
  }
}, [selectedField]);


const [base64Image, setBase64Image] = useState(null);
const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,//בשביל לקחת תמונה מגלריה
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
    base64: true, 
  });

  if (!result.canceled) {
    setUser(prevState => ({
      ...prevState,
      picture: result.assets[0].uri
    }));
    setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`);
  }
};

  
  const saveChanges = async () => {
    try {
      //  יצירת אובייקט עדכון המשתמש
      const updatedUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        experience: user.experience,
        facebookLink: user.facebookLink,
        linkedinLink: user.linkedinLink,
        careerField: user.careerField,
        roles : selectedRoles,
        language: selectedLanguages,
        picture: base64Image || (user.picture.uri || user.picture), 
        isMentor: user.isMentor ?? false,
        mentoringType: user.mentoringType ?? "",
       company: user.company ?? "",
        gender: user.gender ?? "", 
      };
      // ביצוע קריאת PUT עם ה- userId מתוך AsyncStorage
      const response = await fetch(`${apiUrlStart}/api/Users/${userID}`, 
        {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log("User updated successfully:", responseData);
        //  Add userID only to the local object you're storing
        const filteredUserData = {
          password: updatedUser.password, 
          email: updatedUser.email,       // Store the email if needed
          id: userID,// Store the user id if needed
        };
        //  Save to AsyncStorage with userID included
        await AsyncStorage.setItem("user", JSON.stringify(filteredUserData));
        setLoggedUser(filteredUserData); // ← This updates the context immediately!

        setPopupVisible(true);
      } else {
        const errorData = await response.json();
        console.log("Error updating user:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    }

  };
  
  const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
  return (
      <PaperProvider>
        <ScrollView contentContainerStyle={appliedStyles.container} >{/*גלילה של הדף */}
           {/* קומפוננטת הפופאפ */}
           {popupVisible && (
            <View style={styles.overlay}>
            <CustomPopup
        visible={popupVisible}
        onDismiss={() => setPopupVisible(false)}
        icon="check-circle-outline" // ניתן לשנות לאייקון אחר
        message="Your changes have been saved successfully!"
      />
      </View>
      )}     
    
          <Image source={require("../prepWise/assets/backgroundProfileImage2.jpg")} style={appliedStyles.headerBackground} />
          {/**image */}

          <View style={appliedStyles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={appliedStyles.imageWrapper}>
              <Image source={user.picture} style={appliedStyles.profileImage} />
              <TouchableOpacity onPress={pickImage} style={appliedStyles.editIcon}>
                <AntDesign name="edit" size={20} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
  
          <Text style={appliedStyles.title}>Edit Profile</Text>

  
            {/* First Name */}
            <View style={appliedStyles.cardContainer}>
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>First Name</Text>
              <TextInput
                style={appliedStyles.input}
                value={user.firstName}
                onChangeText={(text) => {
                  setUser({ ...user, firstName: text });  // עדכון ה-state של firstName
                  handleChange("firstName", text);  // קריאה לפונקציה handleChange לביצוע הבדיקה
                }}
                placeholder="First Name"
                placeholderText={appliedStyles.placeholderText}

              />
              {errors.firstName ? <Text style={appliedStyles.errorText}>{errors.firstName}</Text> : null}
            </View>
    
            {/* Last Name */}
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>Last Name</Text>
              <TextInput
                style={appliedStyles.input}
                value={user.lastName}
                onChangeText={(text) => {
                  setUser({ ...user, lastName: text });
                  handleChange("lastName", text);
                }}
                placeholder="Last Name"

              />
              {errors.lastName ? <Text style={appliedStyles.errorText}>{errors.lastName}</Text> : null}
            </View>
    
            {/* Email */}
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>Email Address</Text>
              <TextInput
                style={appliedStyles.input}
                value={user.email}
                onChangeText={(text) => {
                  setUser({ ...user, email: text });
                  handleChange("email", text);
                }}
                placeholder="Email Address"

              />
              
              {errors.email ? <Text style={appliedStyles.errorText}>{errors.email}</Text> : null}
            </View>
 
            {/* Password */}
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>Password</Text>
              <View style={appliedStyles.passwordContainer}>
                <TextInput
                  style={appliedStyles.input}
                  secureTextEntry={secureTextEntry}
                  value={user.password}
                  onChangeText={(text) => {
                    setUser({ ...user, password: text });
                    handleChange("password", text);
                  }}
                  placeholder="Password"
                />
                   <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={appliedStyles.eyeIcon}>
                  <Ionicons name={secureTextEntry ? "eye-off" : "eye"} size={24} color="#d6cbff" />
                </TouchableOpacity>
                </View>

                {errors.password ? <Text style={appliedStyles.errorText}>{errors.password}</Text> : null}
             
              
            </View>
    
           {/* Fields Modal */}
           <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>Career Fields</Text>
              {/*<Button
                mode="contained"
                onPress={() => setFieldModalVisible(true)}
                style={appliedStyles.input}
                labelStyle={appliedStyles.modalLabelText}
                contentStyle={appliedStyles.modalText} 
                >
                {selectedFields.length ? selectedFields.join(', ') : 'Select Your Career Fields'}
              </Button>*/}
              <CareerFieldSelector
  selectedField={selectedField}
  setSelectedField={setSelectedField}
   style={{marginBottom:15}}
      />
      {selectedField?.id && (<>
        <Text style={appliedStyles.label}>Roles</Text>
        <RolesSelector
        
          careerFieldId={selectedField.id}
          selectedRoles={selectedRoles}
          setSelectedRoles={setSelectedRoles}
        />
      </>
)}

               {/*<ModalRN 
                  isVisible={fieldModalVisible} 
                  onBackdropPress={() => setFieldModalVisible(false)} 
                  onBackButtonPress={() => setFieldModalVisible(false)}
                  style={{ justifyContent: 'flex-end', margin: 0 }} //makes it appear from the bottom
              
                >
                  <View style={appliedStyles.modalBox}>
                    {Fields.map((field, index) => (
                      <Checkbox.Item 
                        key={index} 
                        label={field} 
                        status={selectedFields.includes(field) ? 'checked' : 'unchecked'} 
                        onPress={() => toggleField(field)} 
                        color="#d6cbff"
                      />
                    ))}
                    <Button onPress={() => setFieldModalVisible(false)}
                    labelStyle={{ fontFamily: "Inter_400Regular", color:"#d6cbff"}}
                       >Done</Button>
                  </View>
                </ModalRN>*/}
            </View>
            
    
            {/* Experience */}
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>Years of Experience</Text>
              <Button 
                mode="contained"
                onPress={() => setExperienceModalVisible(true)}
                style={appliedStyles.input}
                labelStyle={appliedStyles.modalLabelText}
                contentStyle={appliedStyles.modalText} 
                >
                {user.experience || "Select Your Experience Level"}
              </Button>
              <ModalRN 
                 isVisible={experienceModalVisible} 
                 onBackdropPress={() => setExperienceModalVisible(false)} 
                 onBackButtonPress={() => setExperienceModalVisible(false)}
                 style={{ justifyContent: 'flex-end', margin: 0 }} // makes it appear from the bottom
             
               >
                 <View style={appliedStyles.modalBox}>
                     {experiences.map((exp, index) => (
                 <Checkbox.Item key={index} label={exp} status={user.experience === exp ? 'checked' : 'unchecked'} onPress={() => setUser({ ...user, experience: exp })}
                    labelStyle={{ fontFamily: "Inter_400Regular" }}
                     color="#d6cbff"/>
                   ))}
                   <Button onPress={() => setExperienceModalVisible(false)}
                 labelStyle={{ fontFamily: "Inter_400Regular", color:"#d6cbff"}} 
              >Done</Button>
                 </View>
               </ModalRN>
            </View>
    
            {/* Languages */}
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>Languages</Text>
              <LanguageSelector 
                selectedLanguages={selectedLanguages} 
                setSelectedLanguages={setSelectedLanguages} />
                </View>
            
            
    
            {/* Facebook Link */}
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>Facebook Link</Text>
              <TextInput
                style={appliedStyles.input}
                value={user.facebookLink}
                onChangeText={(text) => {
                  setUser({ ...user, facebookLink: text });
                  handleChange("facebookLink", text);
                }}
                placeholder="Facebook link (optional)"

              />
              {errors.facebookLink ? <Text style={appliedStyles.errorText}>{errors.facebookLink}</Text> : null}
            </View>
    
            {/* LinkedIn Link */}
            <View style={appliedStyles.inputContainer}>
              <Text style={appliedStyles.label}>LinkedIn Link</Text>
              <TextInput
                style={appliedStyles.input}
                value={user.linkedinLink}
                onChangeText={(text) => {
                  setUser({ ...user, linkedinLink: text });
                  handleChange("linkedinLink", text);
                }}
                placeholder="LinkedIn link (optional)"

              />
              {errors.linkedinLink ? <Text style={appliedStyles.errorText}>{errors.linkedinLink}</Text> : null}
            </View>
    
          {/* Save Button */}
          <View style={appliedStyles.footerContainer}>
            <TouchableOpacity style={appliedStyles.saveButton} onPress={saveChanges}>
              <Text style={appliedStyles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
         

          <View style={{ flex: 1 }}>
          {Platform.OS === "web" && <NavBar />} {/* מציג רק ב-Web */}
          </View>
          </View>
        </ScrollView>
      </PaperProvider>
    );
    
};

const styles = StyleSheet.create({
  placeholderText:{color:"#A9A9A9",fontFamily:"Inter_300Light", },
  container: { flexGrow: 1, backgroundColor: "#FFFFFF", alignItems: "center", paddingTop: 190 },
  title: { fontSize: 22,  color: "#003D5B",fontFamily:"Inter_300Light",marginBottom:8,marginRight:233,},
  imageContainer: {flexDirection:'row',alignSelf:'flex-start',marginLeft: 15,marginBottom:20},
  profileImage: {width: 150,height:  150,
  borderRadius:  80,borderWidth: 3,borderColor: "white",},
  inputContainer: { width: "80%", marginBottom: 10 },
  input:{width: '100%',padding:1,marginVertical: 8,borderWidth: 1,fontFamily:'Inter_200ExtraLight',borderColor: '#ccc',
  borderRadius: 6,backgroundColor: '#fff',paddingLeft:0,height: 50,  paddingLeft: 10,},
  label: { fontSize: 14, color: "#003D5B", marginBottom: 5,fontFamily:"Inter_300Light",},
  passwordContainer: { flexDirection: "row", alignItems: "center", },
  eyeIcon: { position: "absolute", right: 15 },
  saveButton: { backgroundColor: "#BFB4FF", padding: 15, borderRadius: 20, marginTop: 20,fontFamily:"Inter_300Light",marginBottom:60,width:"80%" },
  saveText: { color: "#003D5B", fontSize: 16, textAlign: "center", },
  editIcon: {position: "absolute",bottom: 5,right: 5,backgroundColor: "#d6cbff",borderRadius: 15,width: 30,
  height: 30,alignItems: "center",justifyContent: "center",borderWidth: 2,borderColor: "white"},
  headerBackground: {position: "absolute",top: 0,width: "100%",height: Platform.OS === "web" ? 420 : 220,
  borderBottomLeftRadius: 10,borderBottomRightRadius: 10,alignSelf: "center",resizeMode: "cover", },
  modalContent: {backgroundColor: "white",},//חלונית מודאל של התחומי קריירה
  cardContainer:{width:"100%",marginLeft:95},
  overlay: {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",alignItems: "center",zIndex: 9999,},
  modalText:{justifyContent: 'left', paddingLeft:1,borderRadius: 10},
  modalBox: {backgroundColor: 'white',padding: 20,borderTopLeftRadius: 20,borderTopRightRadius: 20,maxHeight: '70%',
  width: width * 0.9,alignSelf: 'center',shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.2,
  shadowRadius: 4,elevation: 5,},
  modalLabelText:{color: "#A9A9A9", fontSize:13,fontFamily:'Inter_200ExtraLight',marginLeft:0,fontSize:14},
});

const Webstyles = StyleSheet.create({
  overlay: {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",alignItems: "center",zIndex: 9999,},
  container: { flexGrow: 1, backgroundColor: "#FFFFFF", alignItems: "center", paddingTop: 190, },
  title: { fontSize: 22,  color: "#003D5B",fontFamily:"Inter_400Regular",marginBottom:8,},
  imageContainer: {flexDirection:'row',marginLeft: 20,marginBottom:20},
  profileImage: {width:200 ,height:  200 ,
  borderRadius:  130 ,borderWidth: 3,borderColor: "white",},
  inputContainer: { width: "80%", marginBottom: 10},
  input:{width: '100%',padding:1,marginVertical: 8,borderWidth: 1,fontFamily:'Inter_200ExtraLight',borderColor: '#ccc',
  borderRadius: 6,backgroundColor: '#fff',paddingLeft:0,height: 50,  paddingLeft: 10,color: "#A9A9A9",},
  label: { fontSize: 14, color: "#003D5B", marginBottom: 5,fontFamily:"Inter_300Light", },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  eyeIcon: { position: "absolute", right: 15 },
  saveButton: { backgroundColor: "#BFB4FF", padding: 15, borderRadius: 20, marginTop: 20,fontFamily:"Inter_300Light", },
  saveText: { color: "#003D5B", fontSize: 16, textAlign: "center" },
  editIcon: {position: "absolute",bottom: 5,right: 5,backgroundColor: "#d6cbff",borderRadius: 15,width: 30,
  height: 30,alignItems: "center",justifyContent: "center",borderWidth: 2,borderColor: "white"},
  headerBackground: {position: "absolute",top: 0,left: 0,height: "100%", opacity: 0.5, resizeMode: "cover",zIndex: -1,},
  modalContent: {backgroundColor: "white",width:"35%",marginLeft:580,borderRadius:15},//חלונית מודל של התחומי קריירה
  cardContainer:{width:"35%",backgroundColor: "white",borderRadius: "12px",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  padding: "20px",alignItems:"center",position: "relative",zIndex:1,},
  modalText:{justifyContent: 'left', paddingLeft:1,borderRadius: 10},
  modalBox: {backgroundColor: 'white',padding: 20,borderTopLeftRadius: 20,borderTopRightRadius: 20,maxHeight: '70%',
  width: '50%',alignSelf: 'center',shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.2,
  shadowRadius: 4,elevation: 5,},
  modalLabelText:{color: "#888", fontSize:13,fontFamily:'Inter_200ExtraLight',marginLeft:1,},
});



export default EditProfile;