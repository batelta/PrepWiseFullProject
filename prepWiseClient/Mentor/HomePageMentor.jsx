import { View, Text, ScrollView, Image,ActivityIndicator, TouchableOpacity, Platform, StyleSheet, SafeAreaView, Alert } from "react-native";
import NavBarMentor from "./NavBarMentor";
import { Card,Button } from "react-native-paper";
import { useEffect, useState } from "react";
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';
import AnimatedArrow from '../AnimatedArrow'
import AnimatedPlusIcon from "../AnimatedPlusIcon";
import GeminiChat from '../GeminiChat';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useContext } from 'react';
import { UserContext } from '../UserContext'; 
import { useNavigation } from '@react-navigation/native';
import {apiUrlStart} from '../api';
import MentorOffersCarousel from "./MentorOffersCarousel";




export default function HomePageMentor() {
    const navigation = useNavigation();
    const { Loggeduser } = useContext(UserContext);

    const [showChat, setShowChat] = useState(false);
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [firstname, setFirstname] = useState("Guest");
    
    // state עבור סשנים קרובים וjourney 
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(true);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

      //for offers
  const [hasOffers, setHasOffers] = useState(false);
  const [hasFetchedOffers, setHasFetchedOffers] = useState(false);
//for pending
const [pendingSessions, setPendingSessions] = useState([]);
const [loadingPendingSessions, setLoadingPendingSessions] = useState(false);

   useEffect(() => {
    if (Loggeduser) {
        setProfileImage(Loggeduser.picture); 
        setUser(Loggeduser);
        console.log(Loggeduser);
        loginAsUser(Loggeduser.email, Loggeduser.password);
        // טעינת ההתאמות
        fetchUserMatches(Loggeduser.userId || Loggeduser.id); 
        // טעינת הסשנים הקרובים - הוספה חדשה
        fetchUpcomingSessions(Loggeduser.userId || Loggeduser.id);
        //pending sessions for mentor
        fetchPendingSessions(Loggeduser.userId || Loggeduser.id)
      }
    }, [Loggeduser]);


// פונקציה חדשה לטעינת הסשנים הקרובים
const fetchUpcomingSessions = async (mentorId) => {
    try {
        setLoadingSessions(true);
        const API_URL = `${apiUrlStart}/api/Session/UpcomingSessionsForMentor/${Loggeduser.id}`;
        
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const sessionsData = await response.json();
            setUpcomingSessions(sessionsData);
            console.log('Upcoming sessions loaded:', sessionsData);
        } else {
            console.log('Failed to fetch upcoming sessions');
            setUpcomingSessions([]);
        }
    } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        setUpcomingSessions([]);
    } finally {
        setLoadingSessions(false);
    }
};
//loading pending sessions 
const fetchPendingSessions = async (mentorId) => {
            setLoadingPendingSessions(true); // <-- start loading

    try {
        const API_URL = `${apiUrlStart}/api/Session/PendingSessionsForMentor/${mentorId}`;
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const sessionsData = await response.json();
            setPendingSessions(sessionsData);
            console.log('Pending sessions loaded:', sessionsData);
        } else {
            console.log('Failed to fetch pending sessions');
            setPendingSessions([]);
        }
    } catch (error) {
        console.error('Error fetching pending sessions:', error);
        setPendingSessions([]);
      } finally {
        setLoadingPendingSessions(false); // <-- stop loading
    }
};




// פונקציה להצגת תאריך ושעה בפורמט יפה
const formatSessionDateTime = (dateTime) => {
    const date = new Date(dateTime);

    if (isNaN(date)) {
        console.warn("⚠️ Invalid date received:", dateTime);
        return { date: "Invalid date", time: "" };
    }

    const dateOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    return {
        date: date.toLocaleDateString('en-US', dateOptions),
        time: date.toLocaleTimeString('en-US', timeOptions)
    };
};



    // פונקציה לטעינת ההתאמות
    const fetchUserMatches = async (userId) => {
        try {
            setLoadingMatches(true);
            const API_URL = `${apiUrlStart}/api/MentorMatching/UserMatches/${Loggeduser.id}?userType=mentor`;
            
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const matchesData = await response.json();
                setMatches(matchesData);
                console.log('Matches loaded:', matchesData);
            } else {
                console.log('Failed to fetch matches');
                setMatches([]);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            setMatches([]);
        } finally {
            setLoadingMatches(false);
        }
    };
  
    const loginAsUser=async (email,password )=>{
        console.log(email,password,Loggeduser.password)
    
        try{
          console.log("Sending request to API...");
      const API_URL = `${apiUrlStart}/api/Users/SearchUser` 
          const response =await fetch (API_URL, { 
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
                IsMentor:false
            })
          });
    
          console.log("response ok?", response.ok);
    
          if(response.ok)
           {
            console.log('user found ')
            
            const userData = await response.json();   
            if(userData.picture==="string") 
                setProfileImage(require('../assets/defaultProfileImage.jpg'))  
              else
          setProfileImage({ uri: userData.picture })        
        setFirstname(userData.firstName)
           }
      
      if(!response.ok){
        throw new Error('failed to find user')
      }
        }catch(error){
      console.log(error)
        }
    }     
    
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

    // פונקציה להצגת תמונת פרופיל של התאמה
    const getMatchProfileImage = (picture) => {
        if (!picture || picture === "string") {
            return require('../assets/defaultProfileImage.jpg');
        }
        return { uri: picture };
    };


const handleApprove = async (sessionID,jobSeekerID,journeyID,mentorID,firstName,lastName) => {
  try {
    const response = await fetch(`${apiUrlStart}/api/session/approve/${sessionID}`, {
      method: 'POST',
    });

    if (response.ok) {
      const result = await response.json();
      if (result === true) {
        console.log('Session approved successfully.');
        // Optional: update state or UI to reflect the approval
         navigation.navigate('SessionSplitView', {
          initialSessionId: sessionID,
            jobseekerID:jobSeekerID,
            mentorID: mentorID,
            JourneyID: journeyID,
            FirstName: firstName,
          LastName: lastName,
        });
      } else {
        console.warn('Approval failed on server.');
      }
    } else {
      console.error('Failed to approve session:', response.status);
    }
  } catch (error) {
    console.error('Error approving session:', error);
  }
};

const handleReject = async (sessionID) => {
  try {
    const response = await fetch(`${apiUrlStart}/api/session/reject/${sessionID}`, {
      method: 'POST',
    });

    if (response.ok) {
      const result = await response.json();
      if (result === true) {
        console.log('Session rejected successfully.');
        // Optional: update state or UI to reflect the rejection
      } else {
        console.warn('Rejection failed on server.');
      }
    } else {
      console.error('Failed to reject session:', response.status);
    }
  } catch (error) {
    console.error('Error rejecting session:', error);
  }
};


    // פונקציה להצגת רשימת ההתאמות
    const renderMatches = () => {
        if (loadingMatches) {
            return (
                <Card style={appliedStyles.Applicationcard}>
                    <Card.Content style={appliedStyles.ApplicationCardcontent}>
                        <Text style={appliedStyles.sectionDescription}>
                            Loading your journeys...
                        </Text>
                    </Card.Content>
                </Card>
            );
        }

        if (matches.length === 0) {
            return (
                <Card style={appliedStyles.Applicationcard}>
                    <Card.Content style={appliedStyles.ApplicationCardcontent}>
                        <Text style={appliedStyles.sectionDescription}>
                            You have no Journeys yet 
                        </Text>
                    </Card.Content>
                </Card>
            );
        }

        return (
            <Card style={appliedStyles.matchesMainCard}>
                <Card.Content style={appliedStyles.matchesMainCardContent}>
                    <TouchableOpacity onPress={() => navigation.navigate('AllUserMatches')}>
          <Text style={appliedStyles.seeAllText}>See All</Text>
        </TouchableOpacity>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={appliedStyles.matchesScrollView}>
                         
                         
                        {matches.map((match, index) => (
                            <View key={index} style={appliedStyles.matchCard}>
                                <View style={appliedStyles.matchHeader}>
                                    <Image 
                                        source={getMatchProfileImage(match.Picture)} 
                                        style={appliedStyles.matchProfileImage}
                                    />
                                    <View style={appliedStyles.matchInfo}>
                                        <Text style={appliedStyles.matchName}>
                                            {match.FirstName} {match.LastName}
                                        </Text>
                                        {/*<Text style={appliedStyles.matchEmail}>
                                            {match.Email}
                                        </Text>
                                        <Text style={appliedStyles.journeyId}>
                                            Journey ID: {match.JourneyID}
                                        </Text>*/}
                                    </View>
                                </View>
                                <TouchableOpacity style={appliedStyles.viewJourneyButton}>
                                    <Text style={appliedStyles.viewJourneyButtonText}>
                                        View Journey
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </Card.Content>
            </Card>
        );
    };

    // פונקציה להצגת רשימת הסשנים הקרובים - הועברה לתוך הקומפוננטה
  // Updated renderUpcomingSessions function with vertical scrolling
const renderUpcomingSessions = () => {
    if (loadingSessions) {
        return (
            <Card style={appliedStyles.Applicationcard}>
                <Card.Content style={appliedStyles.ApplicationCardcontent}>
                    <Text style={appliedStyles.sectionDescription}>
                        Loading upcoming sessions...
                    </Text>
                </Card.Content>
            </Card>
        );
    }

    if (upcomingSessions.length === 0) {
        return (
            <Card style={appliedStyles.Applicationcard}>
                <Card.Content style={appliedStyles.ApplicationCardcontent}>
                    <Text style={appliedStyles.sectionDescription}>
                        You have no Upcoming sessions yet 
                    </Text>
                </Card.Content>
            </Card>
        );
    }
    return (
        <Card style={appliedStyles.sessionsMainCard}>
            <Card.Content style={appliedStyles.sessionsMainCardContent}>
                {/* Scroll indicator at the top */}
                <View style={appliedStyles.scrollIndicator}>
                    <Text style={appliedStyles.scrollIndicatorText}>↓ Scroll down to see more sessions ↓</Text>
                </View>
                
                <ScrollView 
                    vertical 
                    showsVerticalScrollIndicator={true}
                    style={appliedStyles.sessionsScrollView}
                    nestedScrollEnabled={true}
                    contentContainerStyle={appliedStyles.sessionsScrollContent}
                >
                    {upcomingSessions.map((session, index) => {
                        const sessionDateTime = formatSessionDateTime(session.ScheduledAt || session.scheduledAt);
                        return (
                            <View key={index} style={appliedStyles.sessionCard}>
                                <View style={appliedStyles.sessionHeader}>
                                    <Image 
                                        source={getMatchProfileImage(session.jobSeekerPicture)} 
                                        style={appliedStyles.sessionProfileImage}
                                    />
                                    <View style={appliedStyles.sessionInfo}>
                                        <Text style={appliedStyles.sessionName}>
                                            {session.jobSeekerFirstName} {session.jobSeekerLastName}
                                        </Text>
                                        <Text style={appliedStyles.sessionDate}>
                                            📅 {sessionDateTime.date}
                                        </Text>
                                        <Text style={appliedStyles.sessionTime}>
                                            🕐 {sessionDateTime.time}
                                        </Text>
                                        {session.Notes && (
                                            <Text style={appliedStyles.sessionNotes}>
                                                💬 {session.Notes}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <View style={appliedStyles.sessionButtons}>
                                    {session.MeetingUrl && (
                                        <TouchableOpacity 
                                            style={appliedStyles.joinMeetingButton}
                                            onPress={() => {
                                                // פתיחת קישור הפגישה
                                                if (Platform.OS === 'web') {
                                                    window.open(session.MeetingUrl, '_blank');
                                                } else {
                                                    // עבור מובייל - תצטרכי להוסיף Linking
                                                    // Linking.openURL(session.MeetingUrl);
                                                }
                                            }}
                                        >
                                            <Text style={appliedStyles.joinMeetingButtonText}>
                                                Join Meeting
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={appliedStyles.viewSessionButton}
                                      onPress={() => {
    const targetScreen = Platform.OS === 'web' ? 'SessionSplitView' : 'SessionListMobile';
    
    navigation.navigate(targetScreen, {
      jobseekerID: session.jobSeekerID,
      mentorID: Loggeduser.id,
      JourneyID: session.journeyID,
      FirstName: session.jobSeekerFirstName,
      LastName: session.jobSeekerLastName,
      initialSessionId: session.sessionID,
    });
  }}

                                    >
                                        <Text style={appliedStyles.viewSessionButtonText}>
                                            View Details
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
                
                {/* Scroll indicator at the bottom */}
                <View style={appliedStyles.scrollIndicatorBottom}>
                    <Text style={appliedStyles.scrollIndicatorText}>↑ Scroll up to see previous sessions ↑</Text>
                </View>
            </Card.Content>
        </Card>
    );
};
     
//function for pending sessions 
const renderPendingSessions = () => {
    if (loadingPendingSessions) {
        return (
            <Card style={appliedStyles.Applicationcard}>
                <Card.Content style={appliedStyles.ApplicationCardcontent}>
                    <Text style={appliedStyles.sectionDescription}>
                        Loading pending sessions...
                    </Text>
                </Card.Content>
            </Card>
        );
    }

    if (pendingSessions.length === 0) {
        return (
            <Card style={appliedStyles.Applicationcard}>
                <Card.Content style={appliedStyles.ApplicationCardcontent}>
                    <Text style={appliedStyles.sectionDescription}>
                        You have no pending session requests.
                    </Text>
                </Card.Content>
            </Card>
        );
    }

return (
    <Card style={appliedStyles.sessionsMainCardPending}>
        <Card.Content style={appliedStyles.sessionsMainCardContent}>
            {/* Scroll indicator at the top */}
            <View style={appliedStyles.scrollIndicator}>
                <Text style={appliedStyles.scrollIndicatorText}>↓ Scroll down to see more sessions ↓</Text>
            </View>
            
            <ScrollView 
                vertical 
                showsVerticalScrollIndicator={true}
                style={appliedStyles.sessionsScrollView}
                nestedScrollEnabled={true}
                contentContainerStyle={appliedStyles.sessionsScrollContent}
            >
                {pendingSessions.map((session) => (
                    <Card key={session.sessionID} style={appliedStyles.Applicationcard}>
                        <Card.Content style={appliedStyles.ApplicationCardcontent}>
                            <View style={appliedStyles.sessionCard}>
                                <View style={appliedStyles.sessionHeader}>
                                    <Image 
                                        source={getMatchProfileImage(session.jobSeekerPicture)} 
                                        style={appliedStyles.sessionProfileImage}
                                    />
                                    <View style={appliedStyles.sessionInfo}>
                                        <Text style={appliedStyles.sessionName}>
                                            {session.jobSeekerFirstName} {session.jobSeekerLastName}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                    <Button
                                        icon="check"
                                        mode="contained"
                                        onPress={() => handleApprove(session.sessionID,session.jobSeekerID,session.journeyID,Loggeduser.id,session.jobSeekerFirstName,session.jobSeekerLastName
)}
                                        style={{ marginRight: 10, backgroundColor: 'green' }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        icon="close"
                                        mode="contained"
                                        onPress={() => handleReject(session.sessionID)}
                                        style={{ backgroundColor: 'red' }}
                                    >
                                        Reject
                                    </Button>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
            
            {/* Scroll indicator at the bottom */}
            <View style={appliedStyles.scrollIndicatorBottom}>
                <Text style={appliedStyles.scrollIndicatorText}>↑ Scroll up to see previous sessions ↑</Text>
            </View>
        </Card.Content>
    </Card>
);

};
    const LogoImage = () => {
      if (Platform.OS !== "web") {
          return <Image source={require('../assets/prepWise Logo.png')} style={appliedStyles.logo} />;
      }
  };
   
    const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;

    return (
        <SafeAreaView style={appliedStyles.container}>
            <ScrollView>
                <LogoImage />
                <View style={appliedStyles.container}>
             
                    <View style={appliedStyles.header}>
                        <View style={appliedStyles.profileImageContainer}>
                            <View  style={appliedStyles.profileImage}>
                                <Image source={profileImage}
                                       style={{  width: '100%',
                                        height: '100%',
                                        resizeMode: 'cover'}}
                                         />
                            </View>
                        </View>
                        <View style={{flex:1}}>
                            <Text style={appliedStyles.title}>Welcome {firstname}, to your Home page!</Text>
                            <Text style={appliedStyles.subtitle}>What to do next?</Text> 
                          <View style={{ left:60}}>
  <AnimatedArrow />
</View>
                        </View>
                    </View>
                </View>
                
                <View style={appliedStyles.ToDoAndApplications}>
                    <View style={appliedStyles.section}>
                        <Text style={appliedStyles.sectionTitle}>Mentorship Journeys 📃</Text>
                        <View style={appliedStyles.toDoList}>
                            {renderMatches()}
                        </View>
                    </View>
                    
                    <View style={appliedStyles.Applicationsection}> 
                        <Text style={appliedStyles.ApplicationsectionTitle}>Upcoming Sessions💻</Text>
                        {renderUpcomingSessions()}
                    </View>
             

                </View>
       <View style={appliedStyles.Pendingsection}>
    <Text style={appliedStyles.ApplicationsectionTitle}>Pending Sessions 🕒</Text>
    {renderPendingSessions()}
</View>
                <TouchableOpacity
                    style={appliedStyles.chatIcon}
                    onPress={() => setShowChat(!showChat)}
                >
                    <FontAwesome6 name="robot" size={24} color="#9FF9D5" />
                </TouchableOpacity>

          {/*<Text style={appliedStyles.sectionTitle}>Get Started 💫</Text>
        <View style={appliedStyles.pressContainer}>
          <Card style={appliedStyles.pressCard}>
            <Card.Content style={appliedStyles.pressCardcontent}>
              <Text style={appliedStyles.pressText}>
                Press
                <Text style={{ marginRight: 10 }}> </Text>
                <AnimatedPlusIcon />
                <Text style={{ marginHorizontal: 10 }}>
                  to Open your first Offer
                </Text>
              </Text>
            </Card.Content>
          </Card>
        </View>


      {Loggeduser?.id && (
          <View style={{ paddingVertical: 20 }}>
            <MentorOffersCarousel mentorId={Loggeduser.id} />
          </View>
        )}*/}

        {Loggeduser?.id && (
          <View style={{ paddingVertical: 20 }}>
            {/* תמיד טוען את הקרוסלה כדי שתוכל לבדוק אם יש הצעות */}
            <MentorOffersCarousel
              mentorId={Loggeduser.id}
              onHasOffers={(val) => {
                setHasOffers(val);
                setHasFetchedOffers(true);
              }}
            />

            {/* אם עדיין טוען — רק Spinner */}
            {!hasFetchedOffers && (
              <ActivityIndicator color="#999" size="small" />
            )}

            {/* אם יש הצעות — מציג את כל המבנה כולל הכותרת והכפתור */}
            {hasFetchedOffers && hasOffers && (
              <View style={appliedStyles.ToDoAndApplications}>
                <View style={appliedStyles.section}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 8,
                      marginBottom: 6,
                    }}
                  ></View>
                </View>
              </View>
            )}

            {/* fallback אם אין הצעות */}
            {hasFetchedOffers && !hasOffers && (
              <>
                <Text style={appliedStyles.sectionTitle}>Get Started 💫</Text>
                <View style={appliedStyles.pressContainer}>
                  <Card style={appliedStyles.pressCard}>
                    <Card.Content style={appliedStyles.pressCardcontent}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("CreateOffer")}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={appliedStyles.pressText}>
                          Press <AnimatedPlusIcon /> to open your first Offer
                        </Text>
                      </TouchableOpacity>
                    </Card.Content>
                  </Card>
                </View>
              </>
            )}
          </View>
        )}
           
                <NavBarMentor />

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
        marginRight:50
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
        flex: 1, 
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
        flexWrap: "wrap", 
    },
    Applicationsection: {
        marginTop: 24,
    },
       Pendingsection:{
        marginTop: 3,
        width:'35%',
        paddingRight:100
    },
    sectionTitle: {
        fontSize: 15,
        fontFamily: "Inter_300Light",
        left: 9,
        marginBottom: 10, 
    },
    ApplicationsectionTitle:{
        fontSize: 15,
        fontFamily: "Inter_300Light",
        left: 9,
        marginBottom: 10, 
    },
    sectionDescription: {
        color: "gray",
        fontFamily:"Inter_200ExtraLight",
    },
    ToDoAndApplications:{
        flexDirection:'column',
        justifyContent:'flex-start',
        marginBottom:30,
    },
    toDoList: {
        flexDirection: "row",
        paddingHorizontal: 10,
    },
    ToDocard:{
        width: "48%", 
        height:120,
    },
    Cardcontent:{
        alignItems: 'center', 
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
        elevation:0,
        shadowColor:'#E4E0E1'
    },
    ApplicationCardcontent:{
        justifyContent: 'flex-start',
    },
    // סגנונות חדשים עבור ההתאמות
    matchesMainCard: {
        width: '100%',
        flexDirection:'column',
        elevation: 0,
        shadowColor: '#E4E0E1',
        backgroundColor: '#fff',
    },
    matchesMainCardContent: {
        padding: 0,
    },
    
    matchesScrollView: {
        paddingVertical: 5,
    },
    matchCard: {
        width: 200,
        marginRight: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    matchCardContent: {
        padding: 15,
    },
    matchHeader: {
        alignItems: 'center',
        marginBottom: 10,
    },
    matchProfileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 8,
    },
    matchInfo: {
        alignItems: 'center',
    },
    matchName: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Inter_400Regular',
        marginBottom: 3,
        textAlign: 'center',
    },
    /*matchEmail: {
        fontSize: 12,
        color: 'gray',
        fontFamily: 'Inter_300Light',
        marginBottom: 3,
        textAlign: 'center',
    },
    journeyId: {
        fontSize: 10,
        color: '#666',
        fontFamily: 'Inter_200ExtraLight',
        textAlign: 'center',
        marginBottom: 8,
    },*/
    viewJourneyButton: {
        backgroundColor: '#9FF9D5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        alignSelf: 'center',
    },
    viewJourneyButtonText: {
        color: '#000',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    
    pressText: {
        fontWeight: "500",
        fontSize: 15,
        fontFamily:"Inter_300Light",
    },
    pressCard:{
        width: "90%", 
        margin: 10,
        alignSelf: "center", 
        padding: 15, 
        backgroundColor: "#f3f4f6", 
        borderRadius: 12, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, 
    },
    pressContainer:{
        marginBottom:80
    },
    chatIcon:{
        position: 'absolute',
        bottom: 100,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 12,
        zIndex: 20, 
    },
    chatModal:{
        position: 'absolute',
        bottom: 90,
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
     sessionsMainCard: {
        width: '100%',
   marginRight: -80, // Compensate for the overflow
    //marginLeft: -40, // Negative margin to pull it back into view
      //  paddingRight:30,
       // marginHorizontal:20,
        elevation: 0,
        shadowColor: '#E4E0E1',
        backgroundColor: '#fff',
        maxHeight: 500, // Limit height to enable scrolling
    },
      sessionsMainCardPending: {
        width: '100%',
   marginRight: -80, // Compensate for the overflow
    //marginLeft: -40, // Negative margin to pull it back into view
      //  paddingRight:30,
       // marginHorizontal:20,
        elevation: 0,
        shadowColor: '#E4E0E1',
        backgroundColor: '#fff',
        maxHeight: 500, // Limit height to enable scrolling
    },
    sessionsMainCardContent: {
        padding: 0,
        height: '100%',
    },
    sessionsScrollView: {
        maxHeight: 400, // Set max height for scrollable area
       // paddingHorizontal: 10,
    },
    sessionsScrollContent: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    sessionCard: {
        width: '100%', // Full width instead of fixed 280px
        marginBottom: 20, // Space between cards vertically
       // backgroundColor: '#f8f9fa', // Changed from green to light gray
        borderRadius: 15,
        padding: 20,
                  shadowColor:'#E4E0E1',

       // shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
       // borderLeftWidth: 5,
       // borderLeftColor: '#9FF9D5',
        flexDirection: 'row', // Keep header and buttons side by side for better use of space
        alignItems: 'center',
    },
    sessionHeader: {
        alignItems: 'center',
        marginBottom: 0, // Remove bottom margin since we're using flexDirection: 'row'
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sessionProfileImage: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 15, // Space between image and info
    },
    sessionInfo: {
        alignItems: 'flex-start', // Align text to the left
        flex: 1,
    },
    sessionName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
        color: '#2d3748',
    },
    sessionDate: {
        fontSize: 14,
        color: '#4a5568',
        fontFamily: 'Inter_300Light',
        marginBottom: 3,
    },
    sessionTime: {
        fontSize: 14,
        color: '#4a5568',
        fontFamily: 'Inter_300Light',
        marginBottom: 6,
        fontWeight: '600',
    },
    sessionNotes: {
        fontSize: 12,
        color: '#718096',
        fontFamily: 'Inter_200ExtraLight',
        fontStyle: 'italic',
        marginBottom: 12,
        lineHeight: 16,
    },
    sessionButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        minWidth: 120, // Ensure buttons have minimum width
    },
    joinMeetingButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    joinMeetingButtonText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        fontWeight: '600',
    },
    viewSessionButton: {
        backgroundColor: '#9FF9D5',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 18,
        width: '100%',
        alignItems: 'center',
    },
    viewSessionButtonText: {
        color: '#000',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
    },
    
    // New styles for scroll indicators
    scrollIndicator: {
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    scrollIndicatorBottom: {
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        marginTop: 10,
        marginHorizontal: 10,
    },
    scrollIndicatorText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Inter_300Light',
        fontStyle: 'italic',
    },
});

const Webstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 130,
        flexDirection: 'row', 
    },
    header: {
        alignItems: "center",
        marginTop: 16,
        flexDirection: "row-reverse", 
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
        fontFamily:"Inter_300Light"
    },
    subtitle: {
        color: "gray",
        fontFamily:"Inter_300Light"
    },
    section: {
        marginTop: 3,
        width:'30%',
    },
    Applicationsection: {
        marginTop: 3,
        width:'35%',
        paddingRight:100
    },
    Pendingsection:{
        marginTop: 3,
        width:'55%',
        paddingRight:100
    },
    sectionTitle: {
        fontSize: 18,
        position:'relative',
        fontFamily:"Inter_300Light",
        paddingHorizontal:25,
    },
    ApplicationsectionTitle:{
        fontSize: 18,
        position:'relative',
        fontFamily:"Inter_300Light",
        paddingHorizontal:10,
    },
    sectionDescription: {
        color: "gray",
        fontFamily:"Inter_300Light",
    },
    ToDoAndApplications:{
        flexDirection:'row',
        justifyContent:'space-between',
    //paddingRight: 10, // Reduce padding to give more space
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
        alignItems: 'center', 
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
    Applicationcard:{
        width:'120%',
        marginTop: 16,
    },
    ApplicationCardcontent:{
        alignItems: 'center', 
        justifyContent: 'center',
    },
    // סגנונות עבור Web - התאמות
    matchesMainCard: {
        width: '100%',
        elevation: 0,
     alignContent:'center',
        shadowColor: '#E4E0E1',
        backgroundColor: '#fff',
    },
    matchesMainCardContent: {
             flexDirection:'column',

    },
    matchesScrollView: {
        paddingVertical: 10,
    },
    seeAllText:{
        alignSelf:'flex-end'
    },
    matchCard: {
        width: 220,
       // marginRight: 10,
       alignSelf:'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    matchCardContent: {
        padding: 20,
    },
    matchHeader: {
        alignItems: 'center',
        marginBottom: 15,
    },
    matchProfileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
    },
    matchInfo: {
        alignItems: 'center',
    },
    matchName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
        textAlign: 'center',
    },
    /*matchEmail: {
        fontSize: 14,
        color: 'gray',
        fontFamily: 'Inter_300Light',
        marginBottom: 4,
        textAlign: 'center',
    },
    journeyId: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Inter_200ExtraLight',
        textAlign: 'center',
        marginBottom: 10,
    },*/
    viewJourneyButton: {
        backgroundColor: '#9FF9D5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'center',
    },
    viewJourneyButtonText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    
    pressText: {
        fontWeight: "500",
        fontSize: 15,
        fontFamily:"Inter_300Light",
    },
    pressCard:{
        width:'35%',
        margin:10,
        marginLeft: 20, 
        marginBottom: 30
    },
    pressCardcontent:{
    },
    profileImageContainer: {
        width: 300,
        height: 300,
        borderRadius: 60, 
        overflow: 'hidden', 
        alignSelf: 'flex-start', 
    },
    profileImage: {
        width: 300,
        height: 300,
        borderRadius: 150, 
        overflow: 'hidden', 
    },
    chatIcon:{
        position: "absolute",
        bottom: 5,
        right: 45,
        backgroundColor: "#fff",
        borderRadius: 30,
        padding: 12,
        zIndex: 999, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3, 
        shadowRadius: 5,
        elevation: 8, 
        borderWidth: 1,
        borderColor: "rgba(159, 249, 213, 0.3)", 
        marginBottom: 12,
    },
    chatModal:{
        position: 'absolute',
        bottom: 0,
        right: 10,
        width: '40%',
        height: 450,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    overlay: {
        position: "absolute",top: 0,left: 0,right: 0,bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",alignItems: "center",zIndex: 9999,
    },

 sessionsMainCard: {
        width: '150%',
            marginRight: -100, // Compensate for the overflow
    marginLeft: -90, // Negative margin to pull it back into view

        marginHorizontal:20,
        elevation: 0,
        shadowColor: '#E4E0E1',
        backgroundColor: '#fff',
        maxHeight: 500, // Limit height to enable scrolling
    },
     sessionsMainCardPending: {
        width: '120%',
            marginRight: -100, // Compensate for the overflow
    marginLeft: 10, // Negative margin to pull it back into view

        marginHorizontal:20,
        elevation: 0,
        shadowColor: '#E4E0E1',
        backgroundColor: '#fff',
        maxHeight: 500, // Limit height to enable scrolling
    },
    sessionsMainCardContent: {
        padding: 0,
        height: '100%',
    },
    sessionsScrollView: {
        maxHeight: 400, // Set max height for scrollable area
        paddingHorizontal: 10,
    },
    sessionsScrollContent: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    sessionCard: {
        width: '85%', // Full width instead of fixed 280px
        marginBottom: 20, // Space between cards vertically
       // backgroundColor: '#f8f9fa', // Changed from green to light gray
        borderRadius: 15,
        padding: 20,
       // shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
       // borderLeftWidth: 5,
       // borderLeftColor: '#9FF9D5',
        flexDirection: 'row', // Keep header and buttons side by side for better use of space
        alignItems: 'center',
    },
    sessionHeader: {
        alignItems: 'center',
        marginBottom: 0, // Remove bottom margin since we're using flexDirection: 'row'
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sessionProfileImage: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 15, // Space between image and info
    },
    sessionInfo: {
        alignItems: 'flex-start', // Align text to the left
        flex: 1,
    },
    sessionName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
        color: '#2d3748',
    },
    sessionDate: {
        fontSize: 14,
        color: '#4a5568',
        fontFamily: 'Inter_300Light',
        marginBottom: 3,
    },
    sessionTime: {
        fontSize: 14,
        color: '#4a5568',
        fontFamily: 'Inter_300Light',
        marginBottom: 6,
        fontWeight: '600',
    },
    sessionNotes: {
        fontSize: 12,
        color: '#718096',
        fontFamily: 'Inter_200ExtraLight',
        fontStyle: 'italic',
        marginBottom: 12,
        lineHeight: 16,
    },
    sessionButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        minWidth: 120, // Ensure buttons have minimum width
    },
    joinMeetingButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    joinMeetingButtonText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        fontWeight: '600',
    },
    viewSessionButton: {
        backgroundColor: '#9FF9D5',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 18,
        width: '100%',
        alignItems: 'center',
    },
    viewSessionButtonText: {
        color: '#000',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
    },
    
    // New styles for scroll indicators
    scrollIndicator: {
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    scrollIndicatorBottom: {
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        marginTop: 10,
        marginHorizontal: 10,
    },
    scrollIndicatorText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Inter_300Light',
        fontStyle: 'italic',
    },
});