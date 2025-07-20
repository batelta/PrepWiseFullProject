import { View, Text,Dimensions, ScrollView, Image, TouchableOpacity, Platform, StyleSheet, SafeAreaView, Alert } from "react-native";
import NavBar from "../NavBar";
import { useEffect, useState } from "react";
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import GeminiChat from '../GeminiChat';
import { useContext } from 'react';
import { UserContext } from '../UserContext'; 
import { SegmentedButtons,Card ,RadioButton,TextInput,Switch} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  const { width } = Dimensions.get('window');
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import CompanySelector from '../CompanySelector'
  import CustomPopup from "../CustomPopup"; 
import { Navigation } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import {apiUrlStart} from '../api';



export default function MatchRequestJobSeeker(){
    const { Loggeduser } = useContext(UserContext);

    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light
      });
      const getButtonStyle = (option) => ({
        backgroundColor: selectedOption === option ? '#E8EAF6' : 'transparent',
        fontFamily: 'Inter_200ExtraLight', // or any font you've loaded
      });
    // This runs only once when Loggeduser is first set
useEffect(() => {
  if (Loggeduser?.id) {
    fetchUser(Loggeduser.id);
    }
  }, [Loggeduser?.id]);

  const fetchUser=async (userID)=>{
    console.log("fetching user with this id:",userID)
  try {
    console.log("Sending GET request to API...");
    const API_URL = `${apiUrlStart}/api/Users?userId=${userID}`;
    
    const response = await fetch(API_URL);
    console.log("response ok?", response.ok);

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await response.json();
    console.log("Full user data:", userData);

    setKnownLanguges(userData.language|| [])
    console.log("languages:", userData.language);
    
  } catch (error) {
    console.log("Error in fetchUser:", error);
  }
};
  const [showChat, setShowChat] = useState(false);
    const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
    const LogoImage = () => {
        if (Platform.OS === "ios") {
            return <Image source={require('../assets/prepWise Logo.png')} style={appliedStyles.logo} />;
        }
    };


    const [FielderrorPopupVisible, setFieldErrorPopupVisible] = useState(false);
const [fieldErrorMessage, setFieldErrorMessage] = useState('');
const [fieldErrorIcon, setFieldErrorIcon] = useState('alert-circle-outline');

    const [selectedOption, setSelectedOption] = useState('option1');

  // Optional: you can make this a helper function, or just use inline logic
const getMessage = (option) => {
    switch (option) {
      case 'journey':
        return 'Get ongoing support with tasks, tracking progress, and continuous feedback during your job hunt.';
      case 'session':
        return 'A one-time mock interview or job simulation paired with a matching mentor.';
      case 'both':
        return 'Combine long-term mentoring with quick, focused sessions for the best of both worlds.';
      default:
        return 'Please select an option.';
    }
  };


  const MatchPrioritySwitch = ({label, value, onToggle }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text style={appliedStyles.subtitle}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        color="#9FF9D5"
        style={{ marginLeft: 10 }}
      />
    </View>
  );
  
const [isGenderImportant,setIsGenderImportant]=useState(false);
      const [mentorGender, setMentorGender] = useState('');

const [knownLanguages,setKnownLanguges]=useState([])

const [selectedLanguages, setSelectedLanguages] = useState([]);
const [isLanguageImportant, setIsLanguageImportant] = useState(false);

const toggleLanguage = (lang) => {
  setSelectedLanguages(prev =>
    prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
  );
};

const [selectedCompanies, setSelectedCompanies] = useState([]);
const [isCompanyImportant, setIsCompanyImportant] = useState(false);

const [Companytext, setCompanyText] = useState('');
const [CompanyError, setCompanyError] = useState('');

const isOtherSelected = selectedCompanies.includes('Other');
console.log('selected companies :',selectedCompanies)
const handleCompanyChange = (text) => {
  setCompanyText(text);

  if (!text.trim()) {
    setCompanyError('');
  } else if (!/^[A-Za-z]{1,15}$/.test(text)) {
    setCompanyError('Only letters, up to 15 characters.');
  } else {
    setCompanyError('');
  }
};

// 🆕 Construct final company list (only include custom company if valid)
const finalCompanyList = isOtherSelected
  ? [
      ...selectedCompanies.filter((c) => c !== 'Other'),
      ...(Companytext.trim() && !CompanyError ? [Companytext.trim()] : [])
    ]
  : selectedCompanies;


  const handleSubmit = () => {
    if (selectedOption=='option1' ) {
      setFieldErrorMessage("Please specify the type of guidance you're looking for.");
      setFieldErrorIcon("account-question-outline"); // or use your preferred icon
      setFieldErrorPopupVisible(true);
      return;
    }
  
    if (!mentorArea || mentorArea.trim() === '') {
      setFieldErrorMessage("Please specify the type of mentor you're looking for.");
      setFieldErrorIcon("account-outline");
      setFieldErrorPopupVisible(true);
      return;
    }
  
    // ✅ Both fields are filled, continue with API call
     handleFindMentor();
  };
  
      const [mentorArea, setMentorArea] = useState('');


      const handleFindMentor = async () => {
        try {
          const userID = Loggeduser?.id;
          const gender = mentorGender;
          const mentorRole = mentorArea === "hr" ? true : false;
      
          const payload = {
            userID,
            gender,
            mentorRole,
            guidanceType: selectedOption,
            preferredLanguages: selectedLanguages,
            preferredCompanies: finalCompanyList, // 👈 see below
            isLanguageImportant,
            isCompanyImportant,
            isGenderImportant, // 👈 ADD THIS LINE
          };
      
          console.log("Sending payload:", payload);
      
          const response = await fetch(`${apiUrlStart}/api/MentorMatching/FindMentor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) throw new Error('Failed to fetch mentors');
          
          const data = await response.json();
          console.log('Matched mentors:', data);
          
          await AsyncStorage.setItem("mentors", JSON.stringify(data));
           navigation.navigate("MentorMatches")
        } catch (error) {
          console.error('Error fetching mentors:', error);
        }
      };
      
      
  return(<>
<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
<ScrollView
    contentContainerStyle={{ paddingBottom: 60 }}
    style={{ flex: 1 }}
  >

                {/** logo component is here only for mobile*/}
                <LogoImage />
                {FielderrorPopupVisible && (
  <View style={styles.POPUPoverlay}>
    <CustomPopup
      visible={FielderrorPopupVisible}
      onDismiss={() => setFieldErrorPopupVisible(false)}
      icon={fieldErrorIcon}
      message={fieldErrorMessage}
    />
  </View>
)}
                <View style={appliedStyles.Topview}>
              
        <Card style={appliedStyles.screenCard}>
        <Text style={appliedStyles.title}>
        Let's get started with your mentor match request ✨
      </Text>
          <Card.Title 
            title={<Text style={appliedStyles.subtitle}>What kind of guidance are you looking for?</Text>}
           />
          <Card.Content>
            <SegmentedButtons
              value={selectedOption}
              onValueChange={setSelectedOption}
              buttons={[
                { value: 'journey',
                    label: "Journey" ,
                    icon: () => <MaterialCommunityIcons name="hiking" color="#9FF9D5" size={16} />
                   , style: getButtonStyle('journey'),
                   labelStyle:appliedStyles.subtitle
                },
                { value: 'session', label: 'One-Time',
                    icon: () => <MaterialCommunityIcons name="timer-sand" color="#9FF9D5" size={16} />
                   ,style: getButtonStyle('session'),
                   labelStyle:appliedStyles.subtitle

                },
                { value: 'both', label: 'All-In-One', 
                    icon: () => <MaterialCommunityIcons name="chevron-double-right" color="#9FF9D5" size={16} />
                    ,style: getButtonStyle('both'),
                    labelStyle:appliedStyles.subtitle

                },
              ]}
            />
            <View style={{ marginTop: 20 ,marginBottom:30,padding:20}}>
              <Card style={appliedStyles.descriptionCard}>
                <Card.Content style={appliedStyles.descriptionCardcontent}>
                <Text style={appliedStyles.inputTitle}>{getMessage(selectedOption)}</Text> 
                </Card.Content>
                </Card>
            </View>


   
  <Text style={appliedStyles.inputTitle}>
  Who would you feel most comfortable talking to?
      </Text>
   
      <RadioButton.Group
        onValueChange={value => setMentorGender(value)}
        value={mentorGender}
      >
           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <RadioButton value="Female" color='#9FF9D5' />
          <Text style={appliedStyles.subtitle}>Female</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <RadioButton value="Male" color='#9FF9D5' />
          <Text style={appliedStyles.subtitle}>Male</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RadioButton value="No Preference" color='#9FF9D5' />
          <Text style={appliedStyles.subtitle}>No Preference</Text>
        </View>
      </RadioButton.Group>
      <MatchPrioritySwitch
  label="Would you like us to prioritize this in your match?"
  value={isGenderImportant}
  onToggle={setIsGenderImportant}
/>


<Text style={appliedStyles.inputTitle}>Which languages should your mentor speak?</Text>
<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {knownLanguages.map((lang, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => toggleLanguage(lang)}
      style={{
        margin: 5,
        padding: 10,
        borderRadius: 20,
        backgroundColor: selectedLanguages.includes(lang) ? '#9FF9D5' : '#E8EAF6',
      }}
    >
      <Text>{lang}</Text>
    </TouchableOpacity>
  ))}
</View>

<MatchPrioritySwitch
  label="Is language match important?"
  value={isLanguageImportant}
  onToggle={() => setIsLanguageImportant(!isLanguageImportant)}
/>




<Text style={appliedStyles.inputTitle}>Do you prefer mentors from specific companies?</Text>
<View style= {appliedStyles.inputTitle}   >
<CompanySelector
  selectedCompanies={selectedCompanies}
  setSelectedCompanies={setSelectedCompanies}
/>
</View>

{isOtherSelected && (
  <View style={{ marginTop: 10 }}>
    <Text style={appliedStyles.inputTitle}>Enter Company Name</Text>
    <TextInput 
                    onChangeText={handleCompanyChange}
                    style={appliedStyles.halfInput} 
                    placeholder="Company (Optional)"
                    placeholderTextColor="#888"
                    contentStyle={{backgroundColor:"#FFF"
                    }}
                    mode="outlined"
                    value={Companytext} />
    {CompanyError ? <Text style={{ color: 'red' }}>{CompanyError}</Text> : null}
  </View>
)}
<MatchPrioritySwitch
  label="Is company match important?"
  value={isCompanyImportant}
  onToggle={() => setIsCompanyImportant(!isCompanyImportant)}
/>



  <Text style={appliedStyles.inputTitle}>
        What kind of mentor are you looking for?
      </Text>
      <RadioButton.Group
        onValueChange={value => setMentorArea(value)}
        value={mentorArea}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <RadioButton value="hr" color='#9FF9D5' />
          <Text style={appliedStyles.subtitle}>HR</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RadioButton value="technical" color='#9FF9D5' />
          <Text style={appliedStyles.subtitle}>Technical</Text>
        </View>
      </RadioButton.Group>


      <TouchableOpacity style={appliedStyles.loginButton} onPress={handleSubmit}>
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
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 50,
        flexDirection: 'row', 
   //     flexWrap: 'wrap',     // required for children to wrap
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
      POPUPoverlay: 
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
      }
});
const Webstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 150,
        flexDirection: 'row', // Ensures text and image are side by side
    },  
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
      POPUPoverlay: 
      {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0, 0, 0, 0.5)",
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
      Topview:{
        paddingHorizontal: 20, 
        paddingTop: 100 
     }
});
