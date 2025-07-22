import { View, Text,Dimensions, ScrollView, Image,Button,Modal, TouchableOpacity, Platform, StyleSheet, SafeAreaView, Alert } from "react-native";
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
import { Card ,RadioButton,TextInput,Appbar,Icon,Checkbox,HelperText } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalRN  from 'react-native-modal';
  const { width } = Dimensions.get('window');
  import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import CalendarScreen from '../CalendarScreen'
import StarRating from 'react-native-star-rating-widget';
import { FileUp } from 'lucide-react-native'; // optional icon
import FileSelectorModal from "../FilesComps/FileSelectorModal";
import NavBarMentor from "../Mentor/NavBarMentor";
import SessionFiles from "../FilesComps/SessionFiles";
import CustomPopup from "../CustomPopup";
import { db } from "../firebaseConfig"; // או איפה שהגדרת את החיבור ל־firebase
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRoute } from '@react-navigation/native';
import {apiUrlStart} from '../api';
export default function Session(props){
    const route = useRoute();

   // Merge props from route (mobile) and direct props (web)
  const {
    hideNavbar,
    sessionId,
    sessionMode,
    jobseekerID,
    mentorID,
    JourneyID,
    setSessionId,
    OtherUserName,
    onSessionCreated,
  } = {
    ...props,
    ...(route.params || {}),
  };  
  const { Loggeduser } = useContext(UserContext);


  console.log("navbar", hideNavbar, "sessid", sessionId, "isnew", sessionMode, jobseekerID, mentorID, JourneyID, OtherUserName, onSessionCreated);
  const navigation = useNavigation();


  

 // Optional: If you need to track files in parent component
  const [sessionFileCount, setSessionFileCount] = useState(0);

  // Optional callback to track file changes in parent
  const handleFilesChange = (files) => {
    setSessionFileCount(files.length);
    // You can do other things here like updating a badge, etc.
  };
    // Form state
    const [selectedDateTime, setSelectedDateTime] = useState(null);
    const [selectedDateTimeForView, setSelectedDateTimeForView] = useState(null);

    const [sessionLink, setSessionLink] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState(0);
    const [existingFeedback, setExistingFeedback] = useState(false); // for button logic

    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
const [fileSelectorVisible, setFileSelectorVisible] = useState(false);


const [wasManuallyChanged, setWasManuallyChanged] = useState(false);

// NEW: Add a state to track the current session being displayed
const [currentSessionId, setCurrentSessionId] = useState(sessionId);

const [tasks, setTasks] = useState([]);
const [newTaskTitle, setNewTaskTitle] = useState('');
const [newTaskDesc, setNewTaskDesc] = useState('');
const [selectedTask, setSelectedTask] = useState(null);
const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
const [completedTasks, setCompletedTasks] = useState([]);
const [isEditModalVisible, setIsEditModalVisible] = useState(false);

const [successPopupVisible, setSuccessPopupVisible] = useState(false);
const [popupMessage, setPopupMessage] = useState('');

const [errorPopupVisible, setErrorPopupVisible] = useState(false);
const [errpopupMessage, setErrPopupMessage] = useState('');

useEffect(() => {
    setWasManuallyChanged(false); // reset when session changes

  if (sessionId) {
    getTasks(sessionId);
  }
}, [sessionId]);


// FIXED: Reset all form states when sessionId changes
useEffect(() => {
    // Only reset if sessionId actually changed
    if (sessionId !== currentSessionId) {
        console.log('Session ID changed from', currentSessionId, 'to', sessionId);
        
        // Reset all form states
        setSelectedDateTime(null);
        setSelectedDateTimeForView(null);
        setSessionLink('');
        setAttachedFiles([]);
        setFeedbackText('');
        setRating(0);
        setExistingFeedback(false);
        setNotes('');
        setIsSubmitting(false);
        setFileSelectorVisible(false);
        
        // Update current session ID
        setCurrentSessionId(sessionId);
    }
}, [sessionId, currentSessionId]);

    const [userType, setUserType] = useState('');

    // FIXED: Separate useEffect for fetching data after sessionId and states are reset
    useEffect(() => {
        if (sessionMode==="edit" && sessionId && sessionId === currentSessionId
          &&
    userType // ✅ Wait until userType is available
  ) {
            console.log('Fetching data for session:', sessionId);
            fetchSessionDetails();
            fetchFeedbackDetails();
                fetchCompletedTasks(); // 👈 Add this

        }
    }, [sessionId, sessionMode, currentSessionId,Loggeduser.id,userType]);


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
//fetch completed tasks 
const fetchCompletedTasks = async () => {
  try {
    const res = await fetch(
      `${apiUrlStart}/api/Session/CompletedTasks?sessionId=${sessionId}&jobSeekerId=${Loggeduser.id}`
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch completed tasks: ${errorText}`);
    }

    const taskIds = await res.json(); // Expected: array of task IDs
    setCompletedTasks(taskIds || []);
  } catch (err) {
    console.error("Error fetching completed tasks:", err);
  }
};


//fetch existing feedback details for edit mode
const fetchFeedbackDetails = async () => {
  try {
    const response = await fetch(`${apiUrlStart}/api/Session/feedback/${sessionId}/${Loggeduser.id}`);
    if (response.ok) {
      const data = await response.json();
      setFeedbackText(data.comment);
      setRating(data.rating);
      setExistingFeedback(true); // mark as update mode
    } else {
      console.log("No feedback found.");
    }
  } catch (err) {
    console.error("Error fetching feedback:", err);
  }
};
//add feedback 

const handleAddFeedback = async (sessionId, submittedBy, rating, comment) => {
    try {
        const response = await fetch(`${apiUrlStart}/api/Session/feedback?sessionId=${sessionId}&submittedBy=${submittedBy}&rating=${rating}&comment=${encodeURIComponent(comment)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Feedback submitted successfully:", result.message);
            setPopupMessage("Feedback submitted successfully!");
            setSuccessPopupVisible(true);
            return true;
        } else {
            const text = await response.text(); // קרא כטקסט במקום json
    console.error("Error submitting feedback:", text);
           // const errorData = await response.json();
          //  console.error("Error submitting feedback:", errorData);
          console.log("sessionId:", sessionId);
console.log("submittedBy:", submittedBy);
console.log("rating:", rating);
console.log("comment:", comment);
              setErrPopupMessage("Feedback Submission Failed!");
            setErrorPopupVisible(true);
            return false;
        }
    } catch (err) {
        console.error("Error submitting feedback:", err);
           setErrPopupMessage("Something went wrong while submitting feedback.");
    setErrorPopupVisible(true);
        return false;
    }
};

 // Fetch existing session details for edit mode
  const fetchSessionDetails = async () => {
    try {
      const response = await fetch(`${apiUrlStart}/api/Session/${sessionId}`);
      if (response.ok) {
        const sessionData = await response.json();
        // Populate form fields with existing data
      const formattedDate = sessionData.scheduledAt
  ? new Date(sessionData.scheduledAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long', // "June"
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // to get AM/PM
    })
  : "Not scheduled yet"; // or 'Not scheduled yet'


setSelectedDateTimeForView(formattedDate);
if (!wasManuallyChanged) {
  setSelectedDateTime(sessionData.scheduledAt);
}

        setSessionLink(sessionData.meetingUrl || '');
try {
let parsedNotes = {};
if (sessionData.notes) {
  try {
    const firstParse = JSON.parse(sessionData.notes);
    parsedNotes = typeof firstParse === 'string'
      ? JSON.parse(firstParse)
      : firstParse;
      console.log('parsedNotes:', parsedNotes, 'userType:', userType);

  } catch (error) {
    console.warn('Failed to parse notes JSON:', error);
    parsedNotes = {};
  }
}
const userNote = parsedNotes[userType] || '';
setNotes(userNote);

} catch (error) {
  console.warn('Failed to parse notes JSON:', error);
  setNotes('');
}
        setAttachedFiles(sessionData.files || []);
        console.log('session data:',sessionData,sessionLink,selectedDateTime)

      }
    } catch (error) {
      console.error('Error fetching session details:', error);
         setErrPopupMessage("Failed to load session details");
    setErrorPopupVisible(true);
    }
  };

  useEffect(() => {
  console.log("🔁 selectedDateTime state updated:", selectedDateTime);
}, [selectedDateTime]);

  // Handle form submission
 // Fixed handleSubmit function - focus only on session data
const handleSubmit = async () => {
  if (isSubmitting) return;
  
  setIsSubmitting(true);
  
  try {
    // Basic validation
    if (!selectedDateTime) {
        console.log('⛔ selectedDateTime is missing!');

      Alert.alert('Missing Information', 'Please select a date and time for the session');
      setIsSubmitting(false);
      return;
    }
if (!isValidMeetingLink(sessionLink)) {
  Alert.alert("Invalid Meeting Link", "Please enter a valid URL for the meeting link.");
  setIsSubmitting(false);
  return;
}


      // Check required parameters for new/add sessions
    if ((sessionMode === 'new' || sessionMode === 'add') && (!jobseekerID || !mentorID)) {
      console.log('❌ Missing jobseekerID or mentorID for new session');
      console.log('jobseekerID:', jobseekerID, 'mentorID:', mentorID);
      Alert.alert('Missing Information', 'Jobseeker ID and Mentor ID are required for new sessions');
      setIsSubmitting(false);
      return;
    }

    // Check JourneyID
    if (!JourneyID) {
      console.log('❌ Missing JourneyID');
      Alert.alert('Missing Information', 'Journey ID is required');
      setIsSubmitting(false);
      return;
    }
    // Prepare session data - simplified and consistent
    let sessionData = {
      sessionID: (sessionMode === 'edit') ? sessionId : 0,
      JourneyID: JourneyID,
      scheduledAt: selectedDateTime, // Ensure this is ISO string format
      meetingUrl: sessionLink || null,
      status: 'scheduled',
      notes: notes || null,

    };

    let response;
    let successMessage;

   switch (sessionMode) {
      case 'new':
      case 'add':
        // Create new session with mentor-jobseeker relationship
        console.log("Creating or adding a new session:", sessionData,'session mode :',sessionMode);
        response = await fetch(`${apiUrlStart}/api/Session/userAddSessions/${jobseekerID}/${mentorID}?userType=${userType}&sessionMode=${sessionMode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sessionData)
        });
        successMessage = 'Session created successfully!';
        break;

      case 'edit':
        // Update existing session
        console.log("Updating existing session:", sessionData);
        response = await fetch(`${apiUrlStart}/api/Session/update/${sessionId}?userType=${userType}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
  
          body: JSON.stringify(sessionData)
        });
        successMessage = 'Session updated successfully!';
        break;

      default:
        throw new Error('Invalid session mode');
    }



    if (response.ok) {
      const result = await response.text();
      console.log('✅ Response text:', result);
      
      // Try to parse response for session ID
      let newSessionId = null;
      if (result) {
        try {
          const parsedResult = JSON.parse(result);
          console.log('✅ Parsed response:', parsedResult);
          newSessionId = parsedResult.sessionID || parsedResult.sessionId || parsedResult.id;
          console.log('✅ Extracted session ID:', newSessionId);
        } catch (parseError) {
          console.warn('⚠️ Failed to parse session ID from response:', parseError);
          console.warn('⚠️ Raw response:', result);
        }
      }

      console.log('✅ Showing success - executing callback immediately');

      // Execute the callback immediately instead of waiting for alert
      if (newSessionId && (sessionMode === 'new' || sessionMode === 'add')) {
        console.log('✅ Setting new session ID:', newSessionId);
        setCurrentSessionId(newSessionId);

        if (typeof onSessionCreated === 'function') {
          onSessionCreated(newSessionId);
          console.log('✅ onSessionCreated called successfully');
        } else if (typeof setSessionId === 'function') {
          console.log('✅ Calling setSessionId instead...');
          setSessionId(newSessionId);
        }
      }

      // Show success popup
setPopupMessage(successMessage);
setSuccessPopupVisible(true);
    } else {
      // Get error details
      const errorText = await response.text();
      console.error('❌ Error response text:', errorText);
      console.error('❌ Request data sent:', JSON.stringify(sessionData, null, 2));
      
      throw new Error(errorText || `HTTP ${response.status}: Failed to process session`);
    }

  } catch (error) {
    console.error('💥 Error in handleSubmit message:', error.message);
    
      setErrPopupMessage("Session Submission Failed!");
            setErrorPopupVisible(true);
  } finally {
    console.log('🏁 Setting isSubmitting to false');
    setIsSubmitting(false);
  }
};

// Enhanced handleMeetingSaved with more logging
const handleMeetingSaved = (meetingDetails) => {
  console.log('📅 handleMeetingSaved called with:', meetingDetails);
  
  if (!meetingDetails) {
    console.error('❌ No meeting details provided');
    return;
  }
  
  if (!meetingDetails.date || !meetingDetails.time) {
    console.error('❌ Invalid meeting details structure:', meetingDetails);
    Alert.alert('Error', 'Invalid meeting details');
    return;
  }
  
  try {
    // Create proper ISO date string
    const dateString = `${meetingDetails.date}T${String(meetingDetails.time.hours).padStart(2, '0')}:${String(meetingDetails.time.minutes).padStart(2, '0')}:00`;
    console.log('📅 Created date string:', dateString);
    
    const dateObj = new Date(dateString);
    console.log('📅 Created date object:', dateObj);
    
    // Make sure it's a valid date
    if (isNaN(dateObj.getTime())) {
      console.error('❌ Invalid date created from:', dateString);
      Alert.alert('Error', 'Invalid date selected');
      return;
    }
    
    const isoString = dateObj.toISOString();
    console.log('📅 ISO string created:', isoString);
    
    setSelectedDateTime(isoString);
    setWasManuallyChanged(true); // ✅ indicate manual change

    console.log('✅ selectedDateTime updated to:', isoString);
  } catch (error) {
    console.error('❌ Error in handleMeetingSaved:', error);
    Alert.alert('Error', 'Failed to set meeting time');
  }
};

  const [showChat, setShowChat] = useState(false);
    const appliedStyles = Platform.OS === 'web' ? Webstyles : styles;
    const LogoImage = () => {
        if (Platform.OS === "android") {
            return <Image source={require('../assets/prepWise Logo.png')} style={appliedStyles.logo} />;
        }
    };

const canShowFeedback = () => {
  return sessionMode === "edit" && sessionId; // only show feedback and tasks for mentor for existing sessions
};


const getTasks = async (sessionId) => {
  try {
    const res = await fetch(`${apiUrlStart}/api/Session/${sessionId}/tasks`);
    if (!res.ok) throw new Error("Failed to load tasks");
    
    const data = await res.json();

    // 🛠️ Normalize field names for React:
    const formattedTasks = data.map(task => ({
      id: task.TaskID,                      // 👈 Fix here
      title: task.Title,
      desc: task.Description,
      isArchived: task.IsArchived,
      createdAt: task.CreatedAt,
      sessionID: task.SessionID,
    }));

    setTasks(formattedTasks);
    console.log("tasks:", formattedTasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }
};

const addTask = async () => {
  if (newTaskTitle.trim() === "") return;

  try {
    const res = await fetch(`${apiUrlStart}/api/Session/${sessionId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: newTaskTitle, 
        description: newTaskDesc,
        jobSeekerID: jobseekerID
       })
    });

    if (!res.ok) throw new Error("Failed to add task");
    const data = await res.json();

    // שליפת נתוני הג'ובסיקר
    const userRes = await fetch(`${apiUrlStart}/api/Users?userId=${jobseekerID}`);
    const userData = await userRes.json();

    // ✅ שליפת נתוני המנטור מה-API
    const mentorRes = await fetch(`${apiUrlStart}/api/Users?userId=${mentorID}`);
    const mentorData = await mentorRes.json();
    const mentorFullName = `${mentorData.firstName || ''} ${mentorData.lastName || ''}`.trim() || 'Unknown Mentor';

    // שמירה ב-Firebase עם כל המידע הנדרש
    await addDoc(collection(db, "tasks"), {
      taskID: data.taskID,
      sessionID: Number(sessionId),
      jobSeekerID: jobseekerID,
      jobSeekerEmail: userData.email.toLowerCase(),
      // ✅ פרטי המנטור
      mentorID: mentorID,
      mentorName: mentorFullName, // ✅ שם מלא
      mentorFirstName: mentorData.firstName || '',
      mentorLastName: mentorData.lastName || '',
      mentorEmail: mentorData.email || '',
      // פרטי המשימה
      title: newTaskTitle,
      description: newTaskDesc,
      createdAt: serverTimestamp()
    });

    getTasks(sessionId);
    setNewTaskTitle("");
    setNewTaskDesc("");
  } catch (err) {
    console.error("Error adding task:", err);
  }
};


const toggleTaskCompletion = async (taskId) => {
  const alreadyCompleted = completedTasks.includes(taskId);
  const newStatus = !alreadyCompleted;

  try {
    const res = await fetch(`${apiUrlStart}/api/Session/TaskCompletion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskID: taskId,
        jobSeekerID: Loggeduser.id,
        isCompleted: newStatus
      })
    });
if (res.ok)
{
  setPopupMessage("Task completion updated successfully!");
setSuccessPopupVisible(true);
}
   if (!res.ok) {
  const errorText = await res.text(); // try parsing
  throw new Error(`Failed to update task completion: ${errorText}`);
}


    setCompletedTasks(prev =>
      newStatus
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  } catch (err) {
    console.error("Error updating completion:", err);
  }
};

// EDIT button handler
const handleEditTask = (taskId, currentTitle, currentDesc) => {
  setSelectedTask({ id: taskId, title: currentTitle, desc: currentDesc });
  setIsEditModalVisible(true);
};

// Call backend to update task
const confirmEditTask = async (taskId, updatedTitle, updatedDesc) => {
  try {
    const res = await fetch(`${apiUrlStart}/api/Session/${sessionId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: updatedTitle, description: updatedDesc }),
    });

    if (res.ok) {
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, title: updatedTitle, desc: updatedDesc } : task
        )
      );
    } else {
      Alert.alert('Error', 'Failed to update task');
    }
  } catch (err) {
    console.error('Update task error:', err);
  }
};

// DELETE button handler
const handleDeleteTask = async (taskId) => {
  try {
    const res = await fetch(`${apiUrlStart}/api/Session/${sessionId}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } else {
      Alert.alert('Error', 'Failed to delete task');
    }
  } catch (err) {
    console.error('Delete task error:', err);
  }
};


const isValidMeetingLink = (link) => {
  if (!link) return true; // Allow empty — it's optional

  // General URL validation regex
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(:\d+)?(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

  return urlRegex.test(link);
};

 // Get button text based on session mode
    const getSubmitButtonText = () => {
      switch (sessionMode) {
        case 'new':
          return 'CREATE SESSION';
        case 'add':
          return 'ADD SESSION';
        case 'edit':
          return 'UPDATE SESSION';
        default:
          return 'SUBMIT';
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
  
  {successPopupVisible && (
  <View style={styles.overlay}>
    <CustomPopup 
      visible={successPopupVisible}
      onDismiss={() => {
        setSuccessPopupVisible(false);
      }}
      icon="check-circle"
      message={popupMessage || "Action completed successfully!"}
    />
  </View>
)}

{errorPopupVisible && (
  <View style={styles.overlay}>
    <CustomPopup 
      visible={errorPopupVisible}
      onDismiss={() => {
        setErrorPopupVisible(false);
      }}
      icon="alert-circle-outline"
      message={errpopupMessage || "Action Failed!"}
    />
  </View>
)}
                <View style={appliedStyles.Topview}>
              
        <Card style={appliedStyles.screenCard}>
        <Text style={appliedStyles.title}>Your Session Space</Text>
            <Text style={[appliedStyles.subtitle, { flexWrap: 'wrap',marginBottom:6  }]}>
    Schedule, share, prep, reflect — all in one place.
  </Text>
   <Text style={[appliedStyles.subtitle, { flexWrap: 'wrap',marginBottom:10 }]}>
    Come back anytime to update!
  </Text>
             <Text style={appliedStyles.subtitle}>Date&Time 🗓️</Text>
             {sessionMode === 'edit' && selectedDateTimeForView && (
              <Card>
  <View style={appliedStyles.meetingInfo}>
    <Text style={appliedStyles.subtitle}>
      A meeting for this session was scheduled for:
    </Text>
    <View style={appliedStyles.HighlightedText}>
    <Text >
      {selectedDateTimeForView}
    </Text>
    </View>
    <View >

      
    <Text style={[appliedStyles.subtitlesmall, { color: '#555' }]}>
      If you'd like to change it, you can pick a new time below or talk to {OtherUserName} first.
    </Text>
    </View>
  </View>
  </Card>
)}

             <Text style={appliedStyles.subtitlesmall}>Pick a time that works for you. We’ll send reminders and let {OtherUserName} know too!</Text>
           <Text style={[appliedStyles.subtitlesmall, { color: '#888', fontStyle: 'italic', marginBottom: 8 }]}>
  Both sides can view and update the meeting date&time.
</Text>
                         <CalendarScreen onMeetingSaved={handleMeetingSaved} />

               <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.subtitle}>Link 🔗</Text>
<Text style={appliedStyles.subtitlesmall}>Got the link already? Drop it here. If not — you can come back and add it anytime.</Text>
<Text style={[appliedStyles.subtitlesmall, { color: '#888', fontStyle: 'italic', marginBottom: 8 }]}>
  Both sides can view and update the meeting link.
</Text>

<TextInput 
                    style={appliedStyles.halfInput} 
                    placeholder="Paste your Zoom, Meet, or Teams link here"
                    placeholderTextColor="#888"
                     value={sessionLink}
                     onChangeText={setSessionLink}
                    contentStyle={{backgroundColor:"#FFF"
                    }}
                    mode="outlined"
                     />
                       <HelperText type="error" visible={!isValidMeetingLink(sessionLink)}>
        Please Enter A Valid Meeting Link
      </HelperText>
</View>    

{/**FILES SECTION */}
{canShowFeedback() && (
<>
 <SessionFiles
        sessionId={sessionId}
        Loggeduser={Loggeduser}
        apiUrlStart={apiUrlStart}
        appliedStyles={appliedStyles}
        onFilesChange={handleFilesChange} // Optional callback
      />
</>
)}

{/**FEEDBACK SECTION */}
{canShowFeedback() && (
  <>
<Text style={appliedStyles.subtitle}>Give Feedback 📃</Text>
      <Text style={appliedStyles.subtitlesmall}>How was the session? </Text>
 <Text style={[appliedStyles.subtitlesmall,{color: '#888', fontStyle: 'italic'}]}>
   Your Feedback is private.
</Text>
<View style={{flex: 1}}>
       <Card style={appliedStyles.feedbackCard}>
<Text style={[appliedStyles.subtitlesmall,{alignSelf:'center'}]}>Anything you'd like to share?</Text>
<TextInput 
                    style={[appliedStyles.halfInput,{alignSelf:'center'}]} 
                    placeholder="The session was really helpful because..."
                    placeholderTextColor="#888"
                     value={feedbackText}
                     onChangeText={setFeedbackText}
                    contentStyle={{backgroundColor:"#FFF"
                    }}
                    mode="outlined"
                     />

<Text style={[appliedStyles.subtitlesmall,{alignSelf:'center'}]}>Slide through the stars to rate(
        1 – Needs work,
        2 – Okay,
        3 – Good,
        4 – Great,
        5 – Excellent! )</Text>

      <StarRating
        rating={rating}
        onChange={setRating}
        style={{alignSelf:'center'}}
      />
    <TouchableOpacity onPress={()=>handleAddFeedback(sessionId,Loggeduser.id,rating,feedbackText)} style={appliedStyles.loginButton}>
  <Text style={appliedStyles.loginText}>
    {existingFeedback ? 'Update Feedback' : 'Add Feedback'}
  </Text>
</TouchableOpacity>
</Card>
</View>
  </>
)}

{/** TASKS SECTION */}
{canShowFeedback() && (
<>
  <Text style={appliedStyles.subtitle}>Tasks 📌</Text>
  <Text style={appliedStyles.subtitlesmall}>
    {userType === 'mentor'
      ? 'Add tasks for your mentee to work on between sessions.'
      : 'Here are your tasks – mark them as done when completed!'}
  </Text>

  <Card style={appliedStyles.taskCard}>
    {/* Mentor: Add New Task */}
    {userType === 'mentor' && (
      <>
      <View style={appliedStyles.newTaskContainer}>
        <TextInput
          style={[appliedStyles.halfInput, appliedStyles.taskTitleArea]}
          placeholder="Task Title"
          placeholderTextColor="#888"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          mode="outlined"
          contentStyle={appliedStyles.inputContent}
        />
        <TextInput
          style={[appliedStyles.halfInput, appliedStyles.taskTextArea]}
          placeholder="Task Description"
          placeholderTextColor="#888"
          value={newTaskDesc}
          onChangeText={setNewTaskDesc}
          mode="outlined"
          multiline
          contentStyle={appliedStyles.inputContent}
        />
        <TouchableOpacity onPress={addTask} style={appliedStyles.loginButton}>
          <Text style={appliedStyles.loginText}>Add Task</Text>
        </TouchableOpacity>
        </View>
      </>
    )}

 {/* Task List */}
{tasks.length === 0 ? (
  <Text style={appliedStyles.subtitlesmall}>No tasks yet.</Text>
) : (
  <>
    {/* Title for mentors */}
    {userType === 'mentor' && (
      <Text style={[appliedStyles.subtitlesmall, { marginTop: 16 }]}>
        Existing Tasks 👇🏼
      </Text>
    )}

    {/* Mentor layout - 2 per row */}
   <View style={{
  flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  flexWrap: 'wrap',
  justifyContent: Platform.OS === 'web' ? 'space-between' : 'flex-start'
}}>
  {tasks.map(task => (
    <View
      key={task.id}
      style={{
        width: Platform.OS === 'web' && userType === 'mentor' ? '48%' : '100%',
        marginBottom: 12
      }}
    >

          {userType === 'jobSeeker' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Checkbox
                status={completedTasks.includes(task.id) ? 'checked' : 'unchecked'}
                onPress={() => toggleTaskCompletion(task.id)}
                color="#BFB4FF"
              />
              <TouchableOpacity onPress={() => {
                setSelectedTask(task);
                setIsTaskModalVisible(true);
              }}>
                <Text style={appliedStyles.taskTitleLink}>{task.title}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Card style={appliedStyles.mentorTaskCard}>
              {/* 📌 icon top right */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={appliedStyles.taskTitle}>{task.title}</Text>
<Text style={{ fontSize: 10, color: '#BFB4FF', marginTop: 4 }}>●</Text>
              </View>

              <Text style={appliedStyles.taskDesc}>{task.desc}</Text>
              <View style={appliedStyles.taskActions}>
                <TouchableOpacity
                  onPress={() => handleDeleteTask(task.id)}
                  style={appliedStyles.deleteButton}
                >
                  <Text style={appliedStyles.deleteButtonText}>🗑 Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEditTask(task.id, task.title, task.desc)}
                  style={appliedStyles.deleteButton}
                >
                  <Text style={appliedStyles.deleteButtonText}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>
      ))}
    </View>
  </>
)}
</Card>

  {/* JOB SEEKER: View Task Details Modal */}
  <Modal
    visible={isTaskModalVisible}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setIsTaskModalVisible(false)}
  >
    <View style={appliedStyles.modalOverlay}>
      <View style={appliedStyles.modalContent}>
        <Text style={appliedStyles.subtitle}>Task Details</Text>
        <Text style={appliedStyles.subtitlesmall}>{selectedTask?.title}</Text>
        <Text style={appliedStyles.subtitlesmall}>{selectedTask?.desc}</Text>

        <TouchableOpacity onPress={() => setIsTaskModalVisible(false)} style={appliedStyles.loginButton}>
          <Text style={appliedStyles.loginText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

  {/* MENTOR: Edit Task Modal */}
  <Modal
    visible={isEditModalVisible}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setIsEditModalVisible(false)}
  >
    <View style={appliedStyles.modalOverlay}>
      <View style={appliedStyles.modalContent}>
        <Text style={appliedStyles.subtitle}>Edit Task</Text>
        <TextInput
          value={selectedTask?.title}
          onChangeText={(text) => setSelectedTask({ ...selectedTask, title: text })}
          placeholder="Task Title"
          style={[appliedStyles.halfInput, appliedStyles.taskTitleArea]}
        />
        <TextInput
          value={selectedTask?.desc}
          onChangeText={(text) => setSelectedTask({ ...selectedTask, desc: text })}
          placeholder="Task Description"
          multiline
          style={[appliedStyles.halfInput, appliedStyles.taskTextArea]}
        />
        <TouchableOpacity
          onPress={async () => {
            await confirmEditTask(selectedTask.id, selectedTask.title, selectedTask.desc);
            setIsEditModalVisible(false);
          }}
          style={appliedStyles.loginButton}
        >
          <Text style={appliedStyles.loginText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</>
)}

           <View style={appliedStyles.inputBlock}>
<Text style={appliedStyles.subtitle}>Notes 📝</Text>
<Text style={appliedStyles.subtitlesmall}>Here you can add your notes , if you have any.</Text>
<Text style={[appliedStyles.subtitlesmall,{color: '#888', fontStyle: 'italic'}]}>
  These notes are private — only you can see them.
</Text>

<TextInput 
                    style={appliedStyles.halfInput} 
                    placeholder="Notes"
                    placeholderTextColor="#888"
                    value={notes}
                    onChangeText={setNotes}
                    contentStyle={{backgroundColor:"#FFF"
                    }}
                    mode="outlined"
                     />
</View>   

<Text style={appliedStyles.subtitlesmall}>This is your space to reflect or shout out something awesome. Your feedback helps us and your mentor grow — but no pressure, you can always come back later.😊</Text>



{/** */}
          <Card.Content>



        


 <TouchableOpacity   
        style={[
          appliedStyles.loginButton,
          isSubmitting && { backgroundColor: '#ccc' }
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
      <Text style={appliedStyles.loginText}>
        {isSubmitting ? 'SUBMITTING...' : getSubmitButtonText()}
      </Text>
        </TouchableOpacity>

          </Card.Content>
        </Card>

        </View>



                       {/* Bot Icon */}
                       {!hideNavbar &&<TouchableOpacity
  style={appliedStyles.chatIcon}
  onPress={() => setShowChat(!showChat)}
>
<FontAwesome6 name="robot" size={24} color="#9FF9D5" />
</TouchableOpacity>}
{!hideNavbar && (userType === 'mentor' ? <NavBarMentor /> : <NavBar />)}
{console.log('hideNavbar:', hideNavbar)}
{console.log('showChat:', showChat)}
{ showChat && (
    <View style={appliedStyles.overlay}>
  <View style={appliedStyles.chatModal}>

  <TouchableOpacity onPress={() => setShowChat(false)} style={{ alignSelf: 'flex-end', padding: 5 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✖</Text>
</TouchableOpacity>
{!hideNavbar && <GeminiChat />}
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
      fontSize: 15,
       marginTop: 8,
        fontFamily:"Inter_300Light",

  },
  logo:{
     position: 'relative',
        width: '23%',
        resizeMode: 'contain',
        height: 100,
  },
subtitlesmall:{
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
        width: '70%',
        alignItems: 'center',
        alignSelf:'center',
        marginTop:15
      },
      loginText: {
        color: 'white',
        fontFamily: 'Inter_400Regular',
      },
      screenCard:{
         margin: 20,
          padding: 36 ,
          width:'120%',
          alignSelf:'center',
          elevation:2,
          shadowColor:'#E4E0E1',
      },
      Topview:{
         paddingHorizontal: 20, 
         paddingBottom:40
      },
    newTaskContainer:{
      marginTop: 16,
  width: '100%',
  paddingHorizontal: 0,
    },
   taskCard: {
 marginTop: 10,
  padding: 16,
  borderRadius: 16,
  backgroundColor: '#fff',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,

},
taskTitleArea: {
  height: 30,
  width:'100%'
},
taskTextArea: {
  height: 80,
  width:'100%'
},

checkbox: {
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#888',
  marginRight: 10,
},

checkboxChecked: {
  backgroundColor: '#BFB4FF',
},

taskTitleLink: {
  textDecorationLine: 'underline',
  color: '#003D5B',
  fontSize: 14,
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center'
},

modalContent: {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 12,
  width: '80%',
},

inputContent: {
  backgroundColor: '#FFF',
},
mentorTaskCard: {
   padding: 14,
  borderRadius: 12,
  backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
},
taskActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 10,
},
deleteButton: {
   paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 8,
  backgroundColor: 'transparent',
},
deleteButtonText: {
  color: '#003D5B',
  fontSize: 13,
  textDecorationLine: 'underline',
  fontWeight: '500',
},
HighlightedText:{
  backgroundColor: '#9FF9D5', 
  paddingHorizontal: 4,
  paddingVertical: 2,
  borderRadius: 4,
  alignSelf: 'flex-start', // 💡 this ensures the background hugs the text
  shadowColor: '#87E1C1',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 3,
  elevation: 3, // for Android shadow
  transform: [{ rotate: '-1deg' }], // ✨ subtle tilt for marker feel
        fontFamily:'Inter_400Regular',
},
meetingInfo:{
    flexWrap: 'wrap' 
    ,marginVertical: 10, 
    padding: 10,
     backgroundColor: '#F9F9F9', 
     borderRadius: 10 ,

},
feedbackCard:{
   padding: 20, 
   alignItems: 'center',
   alignContent:'center',
    borderStyle: 'dashed',
     borderWidth: 1,
      borderColor: '#ccc', 
      borderRadius: 12 ,
       shadowColor:'#E4E0E1',

}
});
const Webstyles = StyleSheet.create({
   
    screenCard:{
      margin: 20,
       padding: 16 ,
      paddingBottom:60

   },
    title: {
        fontSize: 20,
        marginTop: 8,
        fontFamily:"Inter_300Light"

    },
    subtitle:{
        fontSize: 15,
          margin: 8,
          fontFamily:"Inter_300Light",
  
    },
  subtitlesmall:{
    fontSize: 13,
      margin: 8,
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
        paddingTop: 10 
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
       taskCard: {
  padding: 20,
  alignItems: 'center',
  borderStyle: 'dashed',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  marginTop: 10,
},

taskTextArea: {
  height: 80,
},

taskRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},

checkbox: {
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#888',
  marginRight: 10,
},

checkboxChecked: {
  backgroundColor: '#BFB4FF',
},

taskTitleLink: {
  textDecorationLine: 'underline',
  color: '#003D5B',
  fontSize: 14,
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center'
},

modalContent: {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 12,
  width: '80%',
},

inputContent: {
  backgroundColor: '#FFF',
},
mentorTaskCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  marginVertical: 8,
  borderWidth: 1,
  borderColor: '#E4E4E4',
  shadowColor: '#BFB4FF',  // soft purple glow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3
},
taskActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 12,
  gap: 16,
},
deleteButton: {
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 8,
  backgroundColor: 'transparent',
},
deleteButtonText: {
  color: '#003D5B',
  fontSize: 13,
  textDecorationLine: 'underline',
  fontWeight: '500',
},
HighlightedText:{
  backgroundColor: '#9FF9D5', // soft yellow like a highlighter
  paddingHorizontal: 4,
  paddingVertical: 2,
  borderRadius: 4,
  alignSelf: 'flex-start', // 💡 this ensures the background hugs the text
  shadowColor: '#87E1C1',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 3,
  elevation: 3, // for Android shadow
  transform: [{ rotate: '-1deg' }], // ✨ subtle tilt for marker feel
        fontFamily:'Inter_400Regular',
},
meetingInfo:{
    flexWrap: 'wrap' 
    ,marginVertical: 10, 
    padding: 10,
     backgroundColor: '#F9F9F9', 
     borderRadius: 10 
},
feedbackCard:{
   padding: 20, 
   alignItems: 'center',
  justifyContent: 'center',    // vertical centering (in column direction)
    borderStyle: 'dashed',
     borderWidth: 1,
      borderColor: '#ccc', 
      borderRadius: 12 
}
});
