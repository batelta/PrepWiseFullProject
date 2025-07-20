import { View, Text,ActivityIndicator, ScrollView, Image, TouchableOpacity, Platform, StyleSheet, SafeAreaView, Alert } from "react-native";
import NavBar from "./NavBar";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Card } from "react-native-paper";
import { useEffect, useState,useMemo } from "react";
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
import AnimatedArrow from './AnimatedArrow'
import AnimatedPlusIcon from "./AnimatedPlusIcon";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import GeminiChat from './GeminiChat';
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useContext } from 'react';
import { UserContext } from './UserContext'; 
import {apiUrlStart} from './api';
import JobSeekerRelevantOffersCarousel from "./JobSeeker/JobSeekerRelevantOffersCarousel";

export default function HomePage() {
    const { Loggeduser } = useContext(UserContext);

    const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
  const navigation = useNavigation();

    const [showChat, setShowChat] = useState(false);
 const [applications, setApplications] = useState([]);
  const [loadingApp, setLoadingApp] = useState(true);
   const [profileImage, setProfileImage] = useState(null);
   const [firstname, setFirstname] = useState("Guest");

const[userType,setUserType]=useState("");
const[userID,setUserID]=useState(null);
   ////this is a check to know if the job seeker has applications or matchrequests 
   const hasApplications = applications.length > 0;
  // const [hasFetchedExtras, setHasFetchedExtras] = useState(false);


   ///THIS IS IN ORDER TO CHECK IF THE USER ANSWERED THE QUERY BEFORE,HE DOESNT NEED TO AGAIN 
   //AND HE HAS OPENED A MATCH REQUEST BEFORE SO HE SHOULD'NT SEE THE BUTTON FOR OPEN YOUR FIRST MATCH REQUEST
  // FIX 1: Change queryAnswers to a more specific state
  const [hasAnsweredQuery, setHasAnsweredQuery] = useState(false);
  const [queryLoading, setQueryLoading] = useState(true);

  const [totalTasks, setTotalTasks] = useState(0);
const [completedTasks, setCompletedTasks] = useState(0);
  // FIX 2: Remove the problematic useMemo and use the boolean state directly
  const hasMatchRequests = hasAnsweredQuery;

      // FIX 3: Optimize the fetchQuery function with proper error handling
      const fetchQuery = useCallback(async () => {
        if (!Loggeduser?.id) return;
        
        try {
            setQueryLoading(true);
            const response = await fetch(`${apiUrlStart}/api/Users/${Loggeduser.id}/Traits`);
            
            if (response.ok) {
                const data = await response.json();
                console.log("User traits data:", data);
                // Check if user has answered the query (adjust this condition based on your API response)
                setHasAnsweredQuery(data && data.userID > 0);
            } else if (response.status === 404) {
                console.log("User has not answered the query yet");
                setHasAnsweredQuery(false);
            } else {
                throw new Error("Failed to fetch traits");
            }
        } catch (error) {
            console.error("Failed to fetch traits", error);
            setHasAnsweredQuery(false);
        } finally {
            setQueryLoading(false);
        }
    }, [Loggeduser?.id, apiUrlStart]);
  
    // FIX 4: Use useEffect with proper dependencies
    useEffect(() => {
      fetchQuery();
  }, [fetchQuery]);

 // This runs only once when Loggeduser is first set
 // FIX 6: Optimize the loginAsUser effect
 useEffect(() => {
  if (Loggeduser?.id && Loggeduser?.email && Loggeduser?.password ) {
      loginAsUser(Loggeduser.email, Loggeduser.password);
          fetchTaskProgress(Loggeduser.id);

  }
}, [Loggeduser?.id, Loggeduser?.email, Loggeduser?.password]);
  

const fetchTaskProgress = async (jobSeekerId) => {
  try {
    const res = await fetch(`${apiUrlStart}/api/Session/TaskProgress/${jobSeekerId}`);
    if (!res.ok) throw new Error("Failed to fetch task progress");

    const data = await res.json();
    setTotalTasks(data.total);
    setCompletedTasks(data.completed);
  } catch (err) {
    console.error("Error fetching task progress:", err);
  }
};

const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  // This runs every time the screen is focused
   // FIX 7: Optimize the applications fetch
   const fetchApplications = useCallback(async () => {
    if (!Loggeduser?.id) return;
    
    try {
        setLoadingApp(true);
        const response = await fetch(
            `${apiUrlStart}/api/JobSeekers/${Loggeduser.id}/applications`
        );
        const data = await response.json();
        setApplications(data);
    } catch (error) {
        console.error("Failed to fetch applications", error);
    } finally {
        setLoadingApp(false);
    }
}, [Loggeduser?.id, apiUrlStart]);

// This runs every time the screen is focused
useFocusEffect(
    useCallback(() => {
        fetchApplications();
        // Also refetch query status when screen is focused
        fetchQuery();
    }, [fetchApplications, fetchQuery])
);

  
    
     // FIX 5: Optimize loginAsUser function
     const loginAsUser = useCallback(async (email, password) => {
      console.log(email, password, Loggeduser.password);

      try {
          console.log("Sending request to API...");
          const API_URL = `${apiUrlStart}/api/Users/SearchUser`;
          const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  UserId: 0,
                  FirstName: "String",
                  LastName: "String",
                  Email: email,
                  Password: password,
                  CareerField: ["String"],
                  Roles: ["String"],
                  Company: ["String"],
                  Experience: "String",
                  Picture: "String",
                  Language: ["String"],
                  FacebookLink: "String",
                  LinkedInLink: "String",
                  IsMentor: false
              })
          });

          console.log("response ok?", response.ok);

          if (response.ok) {
              console.log('user found');
              const userData = await response.json();
              
              if (userData.picture === "string") {
                  setProfileImage(require('./assets/defaultProfileImage.jpg'));
              } else {
                  setProfileImage({ uri: userData.picture });
              }
              
              setFirstname(userData.firstName);
              setUserType(userData.isMentor ? "mentor" : "jobSeeker");
              console.log("user type :",userData.isMentor)
              setUserID(userData.userID);
              console.log("user id :",userData.userID)

          } else {
              throw new Error('failed to find user');
          }
      } catch (error) {
          console.log(error);
      }
  }, [apiUrlStart, Loggeduser.password]);


      const handleDelete = async (applicationID) => {
          try {
            console.log(applicationID)
            const API_URL =
              `${apiUrlStart}/api/JobSeekers/deleteById/${Loggeduser.id}/${applicationID}`
      
            console.log("Deleting application at URL:", API_URL);
      
            const response = await fetch(API_URL, { method: "DELETE" });
      
            if (!response.ok) throw new Error("Failed to delete");
      
            setApplications((prev) =>
              prev.filter((app) => app.applicationID !== applicationID)
            );
          } catch (error) {
            console.error(" Error deleting:", error);
            Alert.alert("Error", "Could not delete application.");
          }
        };
      ///
 // FIX 9: Optimize navigation handler
 const handleNavigateToQuery = useCallback(() => {
  // Make sure we have valid userType and userID before navigating
  if (userType && userID) {
      navigation.navigate("Query", { userType, userID });
  } else {
    console.log(userType,userID)
      console.error("Missing userType or userID for navigation");
      Alert.alert("Error", "Unable to navigate. Please try again.");
  }
}, [navigation, userType, userID]);

    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light
      });
    const [Name, setName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const LogoImage = () => {
      if (Platform.OS !== "web") {
          return <Image source={require('./assets/prepWise Logo.png')} style={appliedStyles.logo} />;
      }
  };
   

    return (
        <SafeAreaView style={appliedStyles.container}>
            <ScrollView>
                {/** logo component is here only for mobile*/}
                <LogoImage />

                <View style={appliedStyles.container}>
                 
                    <View style={appliedStyles.header}>
                     

                        {/*this is for now only */}
                        <View style={appliedStyles.profileImageContainer}>

                        <View  style={appliedStyles.profileImage}>
  <Image
    source={ profileImage }
    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
  />

                                </View>
                                </View>
                          <View style={{flex:1}}>
     
                        <Text style={appliedStyles.title}>Welcome {firstname} , to your Home page!</Text>
                        <Text style={appliedStyles.subtitle}>What to do next?</Text> 
<View style={{ left:60}}>
  <AnimatedArrow />
</View>        
                    </View>
                    </View>
                </View>
                {/* To-Do List */}
                <View style={appliedStyles.ToDoAndApplications}>
                <View style={appliedStyles.section}>
                    <Text style={appliedStyles.sectionTitle}>Your To-Do List 📃</Text>
                    <View style={appliedStyles.toDoList}>
                        <Card style={appliedStyles.ToDocard}>
                        <Card.Content style={appliedStyles.Cardcontent}>
                        <View style={appliedStyles.toDoItem}>
                            <AnimatedCircularProgress
                                size={50}
                                width={10}
                                fill={progress}
                                tintColor="#9FF9D5"
                                backgroundColor="#e0e0e0"
                            />
                            <Text style={appliedStyles.toDoText}>
                                {completedTasks}/{totalTasks}

                            </Text>
                            <Text style={appliedStyles.toDoLabel}>Sessions Goals</Text>
                        </View>
                        </Card.Content>
                        </Card>
                  {/** 
                        <Card style={appliedStyles.ToDocard}>
                        <Card.Content style={appliedStyles.Cardcontent}>
                        <View style={appliedStyles.toDoItem}>
                            <AnimatedCircularProgress
                                size={50}
                                width={10}
                                fill={progress}
                                tintColor="#9FF9D5"
                                backgroundColor="#e0e0e0"
                            />
                            <Text style={appliedStyles.toDoText}>0/0</Text>
                            <Text style={appliedStyles.toDoLabel}>Personal Goals</Text>
                        </View>
                        </Card.Content>
                        </Card>
                        */}
                    </View>
                </View>
       
{/* Applications Section */}
<View style={appliedStyles.Applicationsection}>
    <Text style={appliedStyles.ApplicationsectionTitle}>All Applications 💻</Text>
    <Card style={appliedStyles.Applicationcard}>
        <Card.Content style={appliedStyles.ApplicationCardcontent}>
            {/* Show the "no applications" message only if the applications array is empty */}
            {applications.length === 0 ? (
                <Text style={appliedStyles.sectionDescription}>
                    You haven’t started yet—let’s add your first application and kick off your adventure! ✨
                </Text>
            ) : (
                <>
                    {/* Show loading spinner if loadingApp is true */}
                    {loadingApp ? (
                        <View style={appliedStyles.centered}>
                            <ActivityIndicator size="small" color="#666" />
                            <Text>Loading applications...</Text>
                        </View>
                    ) : (
                        <View style={appliedStyles.applicationsList}>
                            <TouchableOpacity style={appliedStyles.seeAllText}
                            onPress={() => {console.log("Navigating to:all jobs");
                                if(Platform.OS === 'web' )
                            navigation.navigate("ApplicationSplitView")
                        else navigation.navigate("AllUserApplications")

                            }}>
                                <Text>See All</Text>
                            </TouchableOpacity>
                            {/* Display applications */}
                            {applications.map((app) => (
                                <View key={app.applicationID} style={appliedStyles.ApplicationcardContainer}>
                                    <TouchableOpacity
                                        style={appliedStyles.deleteIcon}
                                        onPress={() => handleDelete(app.applicationID)}
                                    >
                                        <Text style={{ fontSize: 16, color: "#9FF9D5" }}>X</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={appliedStyles.Applicationcard}
                                        onPress={() => {
                                            console.log("Navigating to:", app.applicationID);
                                            if(Platform.OS === 'web' )
                                            navigation.navigate("ApplicationSplitView", { applicationID: app.applicationID }); 
                                          else  navigation.navigate("Application", {applicationID: app.applicationID});  // FIXED: use proper parameter passing
                                        }}
                                   >
                                        <View style={appliedStyles.Applicationrow}>
                                            <MaterialIcons
                                                name="work-outline"
                                                size={36}
                                                color="#9FF9D5"
                                                style={{ marginRight: 12 }}
                                            />
                                            <View>
                                                <Text style={appliedStyles.Applicationtitle}>{app.title}</Text>
                                                <Text style={appliedStyles.Applicationcompany}>{app.companyName}</Text>
                                            </View>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={24} color="#9FF9D5" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}
        </Card.Content>
    </Card>
</View>
</View>
                       {/* Bot Icon */}
     <TouchableOpacity
  style={appliedStyles.chatIcon}
  onPress={() => setShowChat(!showChat)}
>
<FontAwesome6 name="robot" size={24} color="#9FF9D5" />
</TouchableOpacity>

    {/* new user section */}

{!hasApplications || !hasMatchRequests ? (
  <>
    <Text style={appliedStyles.sectionTitle}>Get Started 💫</Text>
    <View style={appliedStyles.pressContainer}>
      {/* Job Application Prompt */}
      {!hasApplications && (
        <Card style={appliedStyles.pressCard}>
          <Card.Content style={appliedStyles.pressCardcontent}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'web')
                  navigation.navigate("ApplicationSplitView");
                else
                  navigation.navigate("AddApplication");
              }}
            >
              <Text style={appliedStyles.pressText}>
                Press <AnimatedPlusIcon /> to add your first Job Application
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}

      {/* Match Request Prompt */}
      {!hasMatchRequests && (
        <Card style={appliedStyles.pressCard}>
          <Card.Content style={appliedStyles.pressCardcontent}>
            <TouchableOpacity
              onPress={handleNavigateToQuery}
            >
              <Text style={appliedStyles.pressText}>
                Press <AnimatedPlusIcon /> to open your first mentor match request
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}
    </View>
  </>
) : null}



 {/* Mentor Offers Section */}
        <View style={{ width: "100%", maxWidth: 400 , marginRight:15}}>
          <View style={appliedStyles.Applicationsection}>
            <Text style={appliedStyles.sectionTitle}>
              Upcoming Mentor Events 🎓
            </Text>
            <Card style={appliedStyles.mentorCard}>
              <Card.Content style={appliedStyles.pressCardcontent}>
                <JobSeekerRelevantOffersCarousel navigation={navigation} />
              </Card.Content>
            </Card>
          </View>
        </View>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
       // padding: 50,
        flexDirection: 'row', 
    },
    logo: {
        position: 'relative',
        width: '23%',
        resizeMode: 'contain',
        height: 100,
    },
    header: {
        flexDirection: "row-reverse",
    alignItems: "center",
    width: "130%",
    left: "-15%", 
    paddingHorizontal: 16,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 80, 
        overflow: 'hidden', // Prevents image from going beyond border
        alignSelf: 'flex-start', // גורם לתמונה להיצמד לימין 
        marginRight:10
},
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 50,

 },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Inter_400Regular",
        flex: 1, // Allows text to expand properly
        padding:50
    },
    subtitle: {
        color: "gray",
        fontFamily:"Inter_200ExtraLight",
        paddingLeft:50

    },
    section: {
        flexDirection: "row",
        justifyContent: "flex-start",
        flexWrap: "wrap", //  Allows wrapping if needed for responsiveness
        alignItems: "center", // Ensures proper alignment
    },
    Applicationsection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 15,
        fontFamily: "Inter_300Light",
        left: 9,
        marginBottom: 10, //Added margin to space out title from the cards
    },
    ApplicationsectionTitle:{
        fontSize: 15,
        fontFamily: "Inter_300Light",
        left: 9,
        marginBottom: 10, //Added margin to space out title from the cards
    },
    sectionDescription: {
          color: "gray",
        fontFamily:"Inter_200ExtraLight",
      
    },
    ToDoAndApplications:{
        flexDirection:'column',
        justifyContent:'flex-start',
        marginBottom:60,
            },
    toDoList: {
        flexDirection: "row",
        justifyContent: "space-between", // Ensures even spacing between cards
        paddingHorizontal: 10,
        flexWrap: "nowrap", //Prevents wrapping so both cards stay in one row
    },
    ToDocard:{
        width: "50%", //Adjusted width so both cards fit in one row
       height:120,
           elevation:0,
          shadowColor:'transparent'
       },
       Cardcontent:{
           alignItems: 'center', // Centers items inside Card.Content
           justifyContent: 'center',
       },
    toDoItem: {
        width: "80%",
        height:"130%",
        backgroundColor: "#f3f4f6",
        padding: 10,
        borderRadius: 12,
        alignItems: "center",

    },
    toDoText: {
        color: "gray",

    },
    toDoLabel: {
        marginTop: 8,
        fontWeight: "500",
        fontFamily:"Inter_200ExtraLight"

    },
    Applicationcard:{
     width:'100%',
    },
    ApplicationCardcontent:{
        alignItems: 'center', // Centers items inside Card.Content
    },

    pressText: {
        fontWeight: "500",
        fontSize: 15,
        fontFamily:"Inter_300Light",
      },
    pressCard:{
        width: "90%", // Increased width to make it look more like a card
        margin: 10,
        alignSelf: "center", // Centered the card
        padding: 15, // Added padding to make it visually distinct
        backgroundColor: "#f3f4f6", // Ensures it looks like a card
        borderRadius: 12, // Gives a card-like appearance
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // Adds shadow effect for Android
    },
      mentorCard:{
       width: "100%", // Increased width to make it look more like a card
        margin: 10,
        alignSelf: "center", // Centered the card
        padding: 15, // Added padding to make it visually distinct
        backgroundColor: "#f3f4f6", // Ensures it looks like a card
        borderRadius: 12, // Gives a card-like appearance
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // Adds shadow effect for Android
    },
    pressContainer:{
        marginBottom:80
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
      ApplicationcardContainer:{
        marginBottom: 25,
        position: "relative",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      deleteIcon: {
        position: "absolute",
        left: 10,
        top: 10,
        zIndex: 999,
      },
      Applicationcard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        paddingLeft: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
      },
      Applicationrow: {
        flexDirection: "row",
        alignItems: "flex-start",
      },
      Applicationtitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#163349",
      },
      seeAllText:{
    marginBottom:10
    },
      Applicationcompany: {
        fontSize: 14,
        color: "#555",
      },
      centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
});

const Webstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 130,
        flexDirection: 'row', // Ensures text and image are side by side

    },
    header: {
        alignItems: "center",
        marginTop: 16,
        flexDirection: "row-reverse", // הופך את הסדר של התמונה והטקסט)
        justifyContent: "space-between",
        width: "90%",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,

 },
    title: {
        fontSize: 20,
        marginTop: 8,
        fontFamily:"Inter_400Regular"

    },
    subtitle: {
        color: "gray",
        fontFamily:"Inter_300Light"

    },
    Applicationsection: {
        marginTop: 3,
        paddingRight:40
    },
    sectionTitle: {
        fontSize: 18,
        position:'relative',
        fontFamily:"Inter_400Regular",
     paddingHorizontal:25,

    },
    seeAllText:{
    },
    ApplicationsectionTitle:{
        fontSize: 18,
          position:'relative',
          fontFamily:"Inter_400Regular",
       paddingHorizontal:10,
    marginBottom:10
    },
    sectionDescription: {
        color: "gray",
        fontFamily:"Inter_300Light",

    },
    ToDoAndApplications:{
        flexDirection:'column',
        justifyContent:'space-between',
        marginBottom:90,
            },
    toDoList: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 16,
    paddingHorizontal:25,
    },
    ToDocard:{
     width:'70%',
    height:130,
    marginRight:15
    },
    Cardcontent:{
        alignItems: 'center', // Centers items inside Card.Content
        justifyContent: 'center',
    },
    toDoItem: {
        width: "50%",
        borderRadius: 12,
        alignItems: "center",

    },
    toDoText: {
        color: "gray",
    },
    toDoLabel: {
        marginTop: 8,
        fontWeight: "500",
        fontFamily:"Inter_300Light",
        textAlign:'center'


    },
    ToDoAndApplications:{
flexDirection:'row',
justifyContent:'space-between',
marginBottom:90,
    },
    Applicationcard:{
        width:'100%',
        marginTop: 16,
    },
    ApplicationCardcontent:{
        alignItems: 'center', // Centers items inside Card.Content
        justifyContent: 'center',
        padding:0
    },

    pressText: {
        fontWeight: "500",
        fontSize: 15,
        fontFamily:"Inter_300Light",
      },
    pressCard:{
        width:'35%',
        margin:10,
        marginLeft: 20, marginBottom: 30
    },
    pressCardcontent:{
    },
     mentorCard:{
        width:'100%',
        margin:10,
        marginLeft: 20, marginBottom: 30
    },
    profileImageContainer: {
        width: 300,
        height: 300,
        borderRadius: 60, // Ensures full circle
        overflow: 'hidden', // Prevents image from going beyond border
        alignSelf: 'flex-start', // גורם לתמונה להיצמד לימין ) 
},
    profileImage: {
        width: 300,
        height: 300,
        borderRadius: 150, 
        overflow: 'hidden', // Ensures the content stays within the round shape
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
      ApplicationcardContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E0E0E0",
      },

      deleteIcon: {
        position: "absolute",
        left: 10,
        top: 10,
        zIndex: 2,
      },
      Applicationcard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        paddingLeft: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
       
        elevation: 2,
      },
      Applicationrow: {
        flexDirection: "row",
        alignItems: "center",
      },
      Applicationtitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#163349",
      },
      Applicationcompany: {
        fontSize: 14,
        color: "#555",
      },
      centered: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20, 
      }
,      
      applicationsList: {
        marginTop: 10,
        gap: 12, // spacing between cards
      },
});