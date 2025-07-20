import React, { useState } from 'react';
import { View,Dimensions ,KeyboardAvoidingView, Text, TextInput, TouchableOpacity, Image, StyleSheet,Platform,ScrollView} from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
  import CustomPopup from "./CustomPopup"; 
  import Ionicons from '@expo/vector-icons/Ionicons';
  import * as ImagePicker from 'expo-image-picker';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
  import ModalRN  from 'react-native-modal';
  import LanguageSelector from './LanguageSelector';
  import CareerFieldSelector from './CareerFieldSelector';
  import RolesSelector from './RolesSelector';
import { Button, Checkbox } from 'react-native-paper';
  import AsyncStorage from '@react-native-async-storage/async-storage';
 import { useContext } from 'react';
 import { UserContext } from './UserContext'; // adjust the path
 import * as DocumentPicker from "expo-document-picker";
import {apiUrlStart} from './api';

  const { width } = Dimensions.get('window');


const SignUpJobSeeker = ({navigation}) => {
  const { setLoggedUser} = useContext(UserContext);

  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [errorPopupVisible, setErrorPopupVisible] = useState(false);

     ///////////////////////////////

     const [FirstNametext, setFirstNameText] = useState("");
     const [FirstNameError, setFirstNameError] = useState(""); //for validating the first name
   
     const handleFirstNameChange = (text) => {
       setFirstNameText(text);
         // If input is empty, clear the error message
       if(!text.trim()) {
         setFirstNameError(""); 
        // If input is not valid (only letters, max 15), show error message// .test() checks if the input matches the regex pattern
       } else if (!/^[A-Za-z]{1,15}$/.test(text)) {
         setFirstNameError("Only letters, up to 15 characters.");
       } else {
         setFirstNameError(""); // Clear error if input becomes valid
       }
     };
   
     const [LastNametext, setLastNameText] = useState("");
     const [LastNameError, setLastNameError] = useState(""); //for validating the Last name
   
     const handleLastNameChange = (text) => {
       setLastNameText(text);
      // If input is empty, clear the error message
     if (!text.trim()) {
       setLastNameError(""); // Clear error if input is empty// .test() checks if the input matches the regex pattern
     } else if (!/^[A-Za-z]{1,15}$/.test(text)) {
       setLastNameError("Only letters, up to 15 characters.");
     } else {
       setLastNameError(""); // Clear error if input becomes valid
     }
   };
   
     const [Emailtext, setEmailText] = useState("");
     const [EmailError, setEmailError] =useState(""); //for validating the Email
   
     const handleEmailChange = (text) => {
       setEmailText(text);
      // If input is empty, clear the error message
      if (!text.trim()) {
       setEmailError(""); // Clear error if input is empty // .test() checks if the input matches the regex pattern
     } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text)) {
       setEmailError("Enter a valid email address.");
     } else {
       setEmailError(""); // Clear error if input becomes valid
     }
   };
   
   const [secureText, setSecureText] = useState(true); // State to toggle password visibility
     const [Passwordtext, setPasswordText] = useState("");
     const [PasswordError, setPasswordError] = useState(""); //for validating the password
     const handlePasswordChange = (text) => {
       setPasswordText(text);
      // If input is empty, clear the error message
      if (!text.trim()) {
       setPasswordError(""); // Clear error if input is empty // .test() checks if the input matches the regex pattern
     } else if (!/[A-Za-z0-9]{5,10}$/.test(text)) {
       setPasswordError("Password must be 5-10 characters.");
     } else {
       setPasswordError(""); // Clear error if input becomes valid
     }
   };
   
   //this is sent as a prop to language selector component
   const [selectedLanguages, setSelectedLanguages] = useState([]);
   
     const [FacebookLink, setFacebookLink] = useState("");
     const [FacebookLinkError, setFacebookLinkError] = useState(""); 
     const handleFacebookLinkChange = (text) => {
       setFacebookLink(text);
       if (!text.trim()) {
         setFacebookLinkError(""); 
       } else if (!/^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9(\.\?)?(\#)?&%=+_\-\/]+$/.test(text)) {
         setFacebookLinkError("Enter a valid Facebook URL.");
       } else {
         setFacebookLinkError(""); 
       }
     };
   
     const [LinkedInLink, setLinkedInLink] = useState("");
     const [LinkedInLinkError, setLinkedInLinkError] = useState(""); 
   
     const handleLinkedInLinkChange = (text) => {
       setLinkedInLink(text);
       if (!text.trim()) {
         setLinkedInLinkError(""); 
       } else if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+$/.test(text)) {
         setLinkedInLinkError("Enter a valid LinkedIn URL.");
       } else {
         setLinkedInLinkError(""); 
       }
     };
   //adding this , to prevent the selectors from being empty (language,careerfield ,roles)
     const [formErrors, setFormErrors] = useState({});


    //this is sent as a prop to field selector component
    const [selectedField, setSelectedField] = useState([]);

      //this is sent as a prop to role selector component
      const [selectedRoles, setSelectedRoles] = useState([]);

     const [statusModalVisible, setStatusModalVisible] = useState(false);
     const [selectedStatus, setSelectedStatus] = useState("");
     const statuses = [
       "I'm just getting started! (0 years)",
       "I have some experience, but I'm still learning! (1-2 years)",
       "I'm building my career and expanding my skills. (2-4 years)",
       "I am an experienced professional in my field. (5-7 years)",
       "I have extensive experience and lead projects. (8+ years)",
       "I'm a seasoned expert in my area. (10+ years)"
     ];
   
     const [image, setImage] = React.useState(null);
     const [base64Image, setBase64Image] = React.useState("string");
   
     const pickImage = async () => {  
       let result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
         base64: true, 
   
       });
   
       if (!result.canceled) {
         console.log(result);
         setImage(result.assets[0].uri);
         setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`); // Convert to base64 format
       }
     };
   
   
     const toggleStatus = (status) => {
      setSelectedStatus(status); // תשמור סטטוס אחד בלבד
    };
   
    const [resumeFile, setResumeFile] = useState(null);

    const pickResumeFile = async () => {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.doc,.docx";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            console.log("✅ File selected:", file);
            setResumeFile({
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              file,
            });
          } else {
            console.log("❌ No file selected");
          }
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
          copyToCacheDirectory: true,
        });
  
        if (result.type === "success") {
          console.log("✅ Picked file:", result);
          setResumeFile(result);
        } else {
          console.log("❌ No file selected or cancelled");
        }
      }
    };




    const [FielderrorPopupVisible, setFieldErrorPopupVisible] = useState(false);
    const [fieldErrorMessage, setFieldErrorMessage] = useState('');
    const [fieldErrorIcon, setFieldErrorIcon] = useState('alert-circle-outline');
 
    
     const addNewUser=async (FirstNametext,LastNametext,Emailtext,Passwordtext,selectedField,
      selectedRoles,selectedStatus,selectedLanguages,
       FacebookLink,LinkedInLink,    MentoringType = "",Company = "",isHr=false
      )=>{
        if (!FirstNametext?.trim()) {
          setFieldErrorMessage("Please enter your first name.");
          setFieldErrorIcon("account-outline");
          setFieldErrorPopupVisible(true);
          return;
        }
      
        if (!LastNametext?.trim()) {
          setFieldErrorMessage("Please enter your last name.");
          setFieldErrorIcon("account-outline");
          setFieldErrorPopupVisible(true);
          return;
        }
      
        if (!Emailtext?.trim()) {
          setFieldErrorMessage("Please enter your email.");
          setFieldErrorIcon("email-outline");
          setFieldErrorPopupVisible(true);
          return;
        }
      
        if (!Passwordtext?.trim()) {
          setFieldErrorMessage("Please enter your password.");
          setFieldErrorIcon("lock-outline");
          setFieldErrorPopupVisible(true);
          return;
        }
      
        if (!selectedStatus) {
          setFieldErrorMessage("Please add your experiece.");
          setFieldErrorIcon("account-check-outline");
          setFieldErrorPopupVisible(true);
          return;
        }
        if (!selectedField?.name) {
          setFieldErrorMessage("Please select your career field.");
          setFieldErrorIcon("briefcase-outline"); // or anything fitting
          setFieldErrorPopupVisible(true);
           return;
        }
        
        if (!selectedRoles || selectedRoles.length === 0) {
          setFieldErrorMessage("Please select at least one role.");
          setFieldErrorIcon("account-outline");
          setFieldErrorPopupVisible(true);
          return;
        }
        
        if (!selectedLanguages || selectedLanguages.length === 0) {
          setFieldErrorMessage("Please select at least one language.");
          setFieldErrorIcon("translate");
          setFieldErrorPopupVisible(true);          
          return;
        }
        
         try{
           console.log("Sending request to API...");
           console.log('field:', [selectedField.name])
           console.log('roles:',selectedRoles)
           console.log('language:',selectedLanguages)


       const isMentor=false;
       const API_URL = `${apiUrlStart}/api/Users` 
console.log('url:',API_URL)


const formData = new FormData();

formData.append("FirstName", FirstNametext);
formData.append("LastName", LastNametext);
formData.append("Email", Emailtext);
formData.append("Password", Passwordtext);
formData.append("CareerField", [selectedField.name]);
formData.append("Roles", selectedRoles);
formData.append("Experience", selectedStatus);
formData.append("Company",  ["string"] );
formData.append("Picture", base64Image);
formData.append("Language",selectedLanguages);
formData.append("FacebookLink", FacebookLink);
formData.append("LinkedInLink", LinkedInLink);
formData.append("IsMentor", isMentor);
formData.append("IsHr", isMentor);
formData.append("MentoringType", "");
formData.append("Gender", "Male");

// הוספת הקובץ אם נבחר
if (!isMentor && resumeFile) {
  if (Platform.OS === "web") {
    // Web file (אמיתי מתוך DOM)
    formData.append("File", resumeFile.file); // זה האובייקט האמיתי של File מה-DOM
  } else {
    // Mobile file
    formData.append("File", {
      uri: resumeFile.uri,
      name: resumeFile.name,
      //type: resumeFile.mimeType || "application/pdf",
    });
  }

  formData.append("FileType", "Resume"); // אם יש צורך
}

console.log("FormData content:");
formData.forEach((value, key) => {
  console.log(`${key}:`, value);
});
const response = await fetch(API_URL, {
  method: "POST",
  body: formData,
});

const responseClone = response.clone(); // for checking
const text = await responseClone.text(); // for checking

console.log("Response status:", response.status);
console.log("Response body:", text);

if (response.ok) {
  const result = await response.json(); // for checking
  console.log("✅ User created:", result);
  await loginAsUser(Emailtext, Passwordtext);
} else {
  setErrorPopupVisible(true);
  throw new Error("Failed to register user");
}
} catch (error) {
console.log("Registration error:", error);
}
};
   



  //////////////////////////
///here we are fetching the new user info from our database in order to save his info in the local storage
const loginAsUser = async (email, password) => {
    try {
      console.log("Sending request to API...");
      const API_URL = `${apiUrlStart}/api/Users/SearchUser`
  
      const response = await fetch(API_URL, {
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
          Experience: "String",
          Company: ["String"],
          Picture: "String",
          Language: ["String"], // Convert to an array
          FacebookLink: "String",
          LinkedInLink: "String",
          IsMentor: false
        })
      });
  
      console.log("response ok?", response.ok);
  
      if (response.ok) {
        console.log('User found');
        
        const userData = await response.json(); // get the full user details
        console.log('User :',userData);
      // save only the fields you need (password, email, id)
      const filteredUserData = {
        password: userData.password, 
        email: userData.email,       
        id: userData.userID,      
      };
      console.log("filtered",filteredUserData)
        //store the full user data
        await AsyncStorage.setItem("user", JSON.stringify(filteredUserData));
        setLoggedUser(filteredUserData);
        setSuccessPopupVisible(true);
  
      } else {
        setErrorPopupVisible(true);
        throw new Error('Failed to find user');
      }
  
    } catch (error) {
      console.log(error);
    }
  };
  const [fontsLoaded] = useFonts({
      Inter_400Regular,
      Inter_700Bold,
      Inter_100Thin,
      Inter_200ExtraLight,
      Inter_300Light
    });
  



  const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
  
  return (

<ScrollView contentContainerStyle={styles.scrollViewContent}>
    
    <View style={appliedStyles.container}>
       
    {/**  <Image source={require('./assets/prepWise Logo.png')}
      style={styles.logo}/> */}
      {successPopupVisible && (
            <View style={styles.overlay}>
                    <CustomPopup visible={successPopupVisible}
                  onDismiss={() => {
                    setSuccessPopupVisible(false);
                    navigation.navigate("HomePage"); // Navigate after closing popup
                  }}
                    icon="check-circle" message="User Signed Up successfully!"
                     />
                     </View>   )}
                     {errorPopupVisible && (
            <View style={styles.overlay}>
                    <CustomPopup visible={errorPopupVisible}
                  onDismiss={() => {
                    setErrorPopupVisible(false);
                  }}
                    icon="alert-circle-outline" message="Failed to sign Up!"
                     />
                     </View>   )}
                     {FielderrorPopupVisible && (
                    <View style={styles.overlay}>
                      <CustomPopup
                        visible={FielderrorPopupVisible}
                        onDismiss={() => setFieldErrorPopupVisible(false)}
                        icon={fieldErrorIcon}
                        message={fieldErrorMessage}
                      />
                    </View>
                  )}
      <View style={appliedStyles.loginBox}>
      
                     {image ? (
  <View style={appliedStyles.imageAndIconContainer}>
    <Image source={{ uri: image }} style={appliedStyles.profileImage} />
    <TouchableOpacity onPress={pickImage} style={appliedStyles.cameraButtonAfter}>
      <Ionicons name="camera-outline" size={24} color="white" />
    </TouchableOpacity>
  </View>
) : (
  <View style={appliedStyles.imageAndIconContainer}>
        <View style={appliedStyles.avatarContainer}>
    <Image source={require('./assets/defaultProfileImage.jpg')}style={appliedStyles.profileImage}></Image> 
   </View>
    <TouchableOpacity onPress={pickImage} style={appliedStyles.cameraButtonAfter}>
      <Ionicons name="camera-outline" size={24} color="white" />
    </TouchableOpacity>
  </View>
)}


<View style={appliedStyles.rowPair}>
  <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>First Name</Text>

  <TextInput
    style={appliedStyles.halfInput}
    placeholder="First Name"
    placeholderTextColor="#888"
    value={FirstNametext}
    onChangeText={handleFirstNameChange}
  />
  {FirstNameError ? <Text style={{ color: "#003D5B",marginBottom:'1%' }}>{FirstNameError}</Text> : null}

</View>

<View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>Last Name</Text>
  <TextInput
    style={appliedStyles.halfInput}
    placeholder="Last Name"
    placeholderTextColor="#888"
    value={LastNametext}
    onChangeText={handleLastNameChange}
  />
{LastNameError ? <Text style={{ color: "#003D5B",marginBottom:'1%' }}>{LastNameError}</Text> : null}

  </View>
</View>


<View style={appliedStyles.rowPair}>
<View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>Email</Text>
        <TextInput
    style={appliedStyles.halfInput}
    placeholder="Email"
          placeholderTextColor="#888"
          value={Emailtext}
          onChangeText={handleEmailChange}
        />
        {EmailError ? <Text style={{ color: "#003D5B",marginBottom:'1%' }}>{EmailError}</Text> : null}
        </View>

        <View style={appliedStyles.passwordContainer}>
        <View style={appliedStyles.inputBlock}>
        <Text style={appliedStyles.inputTitle}>Password</Text>
  <TextInput
    style={[appliedStyles.halfInput, { paddingRight: 40 }]} 
    secureTextEntry={secureText}
    placeholder="Enter password"
    placeholderTextColor="#888"
    value={Passwordtext}
    onChangeText={handlePasswordChange}
  />
  <TouchableOpacity onPress={() => setSecureText(!secureText)} style={appliedStyles.eyeIcon}>
    <Icon name={secureText ? 'eye-off' : 'eye'} size={24} color="#BFB4FF" />
  </TouchableOpacity>
  
  </View>
  {PasswordError ? <Text style={{ color: "#003D5B",marginBottom:'1%' }}>{PasswordError}</Text> : null}

</View>


    </View>
   
<View style={appliedStyles.rowPair}>

  {/* Fields Modal */}
  <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>Career Field</Text>
<CareerFieldSelector
                selectedField={selectedField} 
                setSelectedField={setSelectedField}
              />
                {console.log('selectedfieldid:',selectedField.id)}
                {selectedField?.id&&(<Text style={appliedStyles.inputTitle}>Roles</Text>)}
{selectedField?.id  && (
 
  <RolesSelector   careerFieldId={selectedField.id}
  selectedRoles={selectedRoles}
  setSelectedRoles={setSelectedRoles} />

)}
</View>
  {/* Status Modal */}
  <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>Years Of Experience</Text>
  <Button 
    mode="outlined" 
    onPress={() => setStatusModalVisible(true)} 
    style={appliedStyles.modalsInput} 
    contentStyle={appliedStyles.modalText} 
    labelStyle={appliedStyles.modalLabelText}
  >
  {selectedStatus ? selectedStatus : 'Select Your Professional Status'}
  </Button>
  </View>

  <ModalRN 
    isVisible={statusModalVisible} 
    onBackdropPress={() => setStatusModalVisible(false)} 
    onBackButtonPress={() => setStatusModalVisible(false)}
    style={{ justifyContent: 'flex-end', margin: 0 }} 

  >
    <View style={appliedStyles.modalBox}>
      {statuses.map((status, index) => (
        <Checkbox.Item 
          key={index} 
          label={status} 
          status={selectedStatus === status ? 'checked' : 'unchecked'} 
          onPress={() => toggleStatus(status)} 
        />
      ))}
      <Button onPress={() => setStatusModalVisible(false)}>Done</Button>
    </View>
  </ModalRN>

</View>

          
<View style={appliedStyles.rowPair}>
<View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>Facebook</Text>

<TextInput 
                    onChangeText={handleFacebookLinkChange}
                    style={appliedStyles.halfInput} 
                    placeholder="Facebook Link (Optional)"
                    placeholderTextColor="#888"
                    value={FacebookLink} />
 {FacebookLinkError ? <Text style={{ color: "#003D5B",marginBottom:'1%' }}>{FacebookLinkError}</Text> : null}                 
      </View>
      <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.inputTitle}>LinkedIn</Text>
                  <TextInput  
                    onChangeText={handleLinkedInLinkChange} 
                    style={appliedStyles.halfInput} 
                    placeholder="LinkedIn Link (Optional)"
                    placeholderTextColor="#888"
                    value={LinkedInLink} />
 {LinkedInLinkError ? <Text style={{ color: "#003D5B",marginBottom:'1%' }}>{LinkedInLinkError}</Text> : null}
                    </View>
  </View>

 <View style={appliedStyles.languageContainer}>
 <Text style={appliedStyles.inputTitle}>Language</Text>
    <LanguageSelector
                selectedLanguages={selectedLanguages} 
                setSelectedLanguages={setSelectedLanguages}
              />
</View>
<TouchableOpacity
            style={appliedStyles.loginButton}
            onPress={pickResumeFile}
          >
            <Text style={appliedStyles.loginText}>
              {resumeFile ? "Resume Selected ✅" : "Upload Resume (PDF/Word)"}
            </Text>
          </TouchableOpacity>
        <View style={appliedStyles.rowContainer}>
       {/**  <Text style={appliedStyles.forgotText}>Forgot Password?</Text> */}
        </View>
        <View style={{flexDirection:'row',marginTop:30,marginBottom:25}}>
      <Text style={appliedStyles.footer}>Already have an account?</Text>
      <Text style={appliedStyles.CreateAccounttext}
      onPress={()=> navigation.navigate('SignIn')}>Login Here</Text>
      </View>
        <TouchableOpacity style={appliedStyles.loginButton}>
          <Text style={appliedStyles.loginText} onPress={() => {addNewUser(FirstNametext, LastNametext, Emailtext, Passwordtext, selectedField, 
                      selectedRoles,selectedStatus, selectedLanguages, FacebookLink, LinkedInLink) }}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );
};

const Webstyles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 20,  
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  loginBox: {
    width: 700,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },

  forgotText: {
    color: '#BFB4FF',
    fontFamily:'Inter_200ExtraLight',

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
  },
  loginText: {
    color: 'white',
    fontFamily:'Inter_400Regular',

  },
  overlay: 
  {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",alignItems: "center",zIndex: 9999,
  },

  profileImage:{
    width: 100,
     height: 100, 
     borderRadius: 50,
      marginTop: 20, 
      borderWidth: 2,
       borderColor: '#BFB4FF',
       mode:"contained",

  },
  cameraButtonAfter: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#d6cbff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  
  imageAndIconContainer: {
    flexDirection: 'row',
    position:'relative',
    alignSelf: 'center',
    marginLeft: 10,
    marginBottom: 20,
    marginTop:10,
  },

 
  languageContainer:{
    paddingLeft:20,
    alignSelf:'center',
    fontFamily:'Inter_200ExtraLight',
    fontSize:13,
    width: '50%',
    height: 40,
    marginTop:10,
    marginBottom:15,
    flex: 1,

},
modalLabelText:{
  color: "#888", 
  fontSize:13,
   fontFamily:'Inter_200ExtraLight', 
   marginLeft:1,

  },
  modalText:{
    justifyContent: 'left', 
    paddingLeft:10,
    borderRadius: 10
  },
inputBlock: {
  width: '50%', 
},

inputTitle: {
  fontSize: 14,
  marginBottom: 10,
  color: '#003D5B',
},
halfInput: {
  width: 300,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  fontFamily:'Inter_200ExtraLight',
  fontSize:13,
  height:35
},
rowPair: {
flexDirection: 'row',
gap:20,
justifyContent:'flex-start',
alignSelf:'center',
marginBottom:10,
width:'90%'
},
modalsInput:{
  width: 300,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  fontFamily:'Inter_200ExtraLight',
  fontSize:13,
  height:35

},
  passwordContainer: {
    width: '99%',
  },
  eyeIcon: {
    position: 'absolute',
    right:0,
    top: '74%',
    transform: [{ translateY: -12 }],
    zIndex: 1
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    width: '50%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    backgroundColor: '#fff',
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:10,
  },
  
});
const styles = StyleSheet.create({

  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,  
  },
  
  loginBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  loginButton: {
    backgroundColor: '#BFB4FF',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  CreateAccounttext: {
    textDecorationLine: 'underline',
    color: '#003D5B',
    fontFamily:'Inter_400Regular',
  },
  loginText: {
    color: 'white',
    fontFamily: 'Inter_400Regular',
  },
  overlay: 
  {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",alignItems: "center",zIndex: 9999,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#BFB4FF',
  },
  modalLabelText:{
    color: "#888", fontSize:13,
     fontFamily:'Inter_200ExtraLight',
      marginLeft:1,
  },
  cameraButtonAfter: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: '#d6cbff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  
  imageAndIconContainer: {
    flexDirection: 'row',
    position:'relative',
    alignSelf: 'center',
    marginLeft: 10,
    marginBottom: 20,
    marginTop:10,
  },

  languageContainer: {
    paddingLeft: 0,
    alignSelf: 'center',
    fontFamily: 'Inter_200ExtraLight',
    fontSize: 13,
    width: '100%',
    marginTop: 5,
    marginBottom: 30,
    zIndex:1,
  },

    inputBlock: {
      width: '100%', 
    maxHeight:'auto'
    },
  
    inputTitle: {
      fontSize: 14,
      marginBottom: 5,
      color: '#003D5B',
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
    modalsInput:{
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      fontFamily:'Inter_200ExtraLight',
      fontSize:13,
      height:40,
     marginBottom: 7, 
    },
  rowPair: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    marginBottom: '1%',  
    height: 'auto',  
  },
  
  passwordContainer: {
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: '60%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    width: width * 0.9,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText:{
    justifyContent: 'left', 
    paddingLeft:10,
    borderRadius: 10
  },
  avatarContainer: {
    backgroundColor: '#ccc',
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:10
  },
  });
export default SignUpJobSeeker;