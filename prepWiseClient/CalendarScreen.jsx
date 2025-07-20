import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert,TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { TimePickerModal } from 'react-native-paper-dates';
import { PaperProvider,TextInput } from 'react-native-paper';
import { UserContext } from './UserContext';
import { db } from './firebaseConfig';
import { Timestamp, collection, addDoc, query, where, getDocs, onSnapshot, deleteDoc, doc,updateDoc } from 'firebase/firestore';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_300Light, Inter_700Bold, Inter_100Thin, Inter_200ExtraLight } from '@expo-google-fonts/inter';
import { Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


export default function CalendarScreen({ onMeetingSaved }) {
  const { Loggeduser } = useContext(UserContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [title, setTitle] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [duration,setDuration]=useState('')

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light
  });

  useEffect(() => {
    if (!Loggeduser?.email) return;

    // המרת המייל לאותיות קטנות לחיפוש
    const userEmailLower = Loggeduser.email.toLowerCase();
    
    const q = query(collection(db, 'meetings'), where('participants', 'array-contains', userEmailLower));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedMeetings = [];
      const newMarkedDates = {};

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const date = data.Datetime.toDate();
        const dateString = date.toISOString().split('T')[0];

        newMarkedDates[dateString] = { marked: true, dotColor: '#9FF9D5' };

        loadedMeetings.push({
          id: doc.id,
          title: data.title,
          date: dateString,
          time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
          participants: data.participants,
          duration: data.duration || 30, // fallback to 30 mins if missing
        });
      });

      setMeetings(loadedMeetings);
      setMarkedDates(newMarkedDates);

      if (selectedDate) {
        const filtered = loadedMeetings.filter(m => m.date === selectedDate);
        setFilteredMeetings(filtered);
      }
    });

    return () => unsubscribe();
  }, [Loggeduser, selectedDate]);

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    const filtered = meetings.filter(m => m.date === day.dateString);
    setFilteredMeetings(filtered);
  };
  
  const handleConfirmTime = ({ hours, minutes }) => {
    setShowTimePicker(false);
    setSelectedTime({ hours, minutes });
  };

  const handleSaveMeeting = async () => {
    if (!selectedDate || !selectedTime || !title ||!duration) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!Loggeduser?.email) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    const datetime = new Date(`${selectedDate}T${String(selectedTime.hours).padStart(2, '0')}:${String(selectedTime.minutes).padStart(2, '0')}:00`);

    // המרת כל המיילים לאותיות קטנות
    const extraParticipants = emailInput
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email && email !== Loggeduser.email.toLowerCase());

    const participants = [Loggeduser.email.toLowerCase(), ...extraParticipants];

    // Check for time conflicts (within 30 minutes)
    const conflict = meetings.some(meeting => {
      if (editingMeetingId && meeting.id === editingMeetingId) return false; // דלג על הפגישה שנערכת

      const existingDate = new Date(`${meeting.date}T${meeting.time}:00`);
      const timeDiff = Math.abs(existingDate.getTime() - datetime.getTime());
      return timeDiff < 30 * 60 * 1000;
    });

    if (conflict) {
      setConflictModalVisible(true);
      return;
    }

    const meetingData = {
      title,
      Datetime: Timestamp.fromDate(datetime),
      participants,
      duration: parseInt(duration),
      createdBy: Loggeduser.email.toLowerCase(),
    };

    try {
      if (editingMeetingId) {
        // UPDATE existing meeting
        const docRef = doc(db, 'meetings', editingMeetingId);
        await updateDoc(docRef, meetingData);
        Alert.alert('Success', 'The meeting was updated successfully!');
      } else {
        // CREATE new meeting
        await addDoc(collection(db, 'meetings'), meetingData);
        Alert.alert('Success', 'The meeting was saved successfully!');
      }

      // ✅ Notify parent with date + time
      if (typeof onMeetingSaved === 'function') {
        onMeetingSaved({
          date: selectedDate,
          time: selectedTime
        });
      }

      // Reset fields
      setTitle('');
      setSelectedTime(null);
      setEmailInput('');
      setEditingMeetingId(null);
      setDuration('');

      setMarkedDates({
        ...markedDates,
        [selectedDate]: { marked: true, dotColor: '#50cebb' },
      });

    } catch (error) {
      console.error("Error saving/updating meeting:", error);
      Alert.alert('Error', 'There was a problem saving the meeting.');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
      Alert.alert('Success', 'The meeting was deleted successfully!');
    } catch (error) {
      console.error("Error deleting meeting:", error);
      Alert.alert('Error', 'There was a problem deleting the meeting.');
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
           {/*<View style={{ flex: 1 }}>
        <Header title="לוח פגישות" />*/}
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          hideExtraDays={false}
          minDate={new Date().toISOString().split('T')[0]} // disables past dates
        />
        
        {selectedDate && (
          <Text style={{ fontSize: 16, marginVertical: 10, color: '#5E5E5E' }}>
            Chosen date: {selectedDate}
          </Text>
        )}

        <Modal
          transparent={true}
          animationType="fade"
          visible={conflictModalVisible}
          onRequestClose={() => setConflictModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Icon name="warning" size={40} color="#d6cbff" style={{ marginBottom: 10 }} />
              <Text style={styles.modalText}>There is already a meeting in this time slot, please choose another time</Text>
              <TouchableOpacity onPress={() => setConflictModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {selectedDate && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              label="Enter a meeting topic"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
            />

            <Text style={styles.label}>Time :</Text>
            <View style={{ marginBottom: 15 }}>
              <Button title="Select a time" onPress={() => setShowTimePicker(true)} color="#d6cbff" />
              {selectedTime && (
                <Text style={styles.selectedTime}>
                  Selected time : {String(selectedTime.hours).padStart(2, '0')}:{String(selectedTime.minutes).padStart(2, '0')}
                </Text>
              )}
            </View>
            
            <TextInput
              label="Duration (minutes)"
              value={duration}
              onChangeText={(text) => setDuration(text)}
              keyboardType="numeric"
              mode="outlined"
            />
            
            <TextInput
              style={styles.input}
              label="Enter email addresses of additional participants: example1@email.com, example2@email.com"
              value={emailInput}
              onChangeText={setEmailInput}
              mode="outlined"
            />

            <Button title="Save a meeting" onPress={handleSaveMeeting} color="#d6cbff" />
          </View>
        )}

        {selectedDate && filteredMeetings.length > 0 && (
          <View style={styles.meetingsContainer}>
            <Text style={styles.label}>The meetings on {selectedDate} :</Text>
            {filteredMeetings.map((meeting) => (
              <View key={meeting.id} style={styles.meetingItem}>
                <Text>🗓 {meeting.date} - 🕒 {meeting.time}</Text>
                <Text>{`Duration: ${meeting.duration || 30} mins`}</Text>
                <Text>📌 {meeting.title}</Text>
                <Text>👥 {meeting.participants.join(', ')}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      setTitle(meeting.title);
                      const [hour, minute] = meeting.time.split(':');
                      setSelectedTime({ hours: parseInt(hour), minutes: parseInt(minute) });
                      
                      // מציג את המיילים ללא המייל של המשתמש הנוכחי
                      const otherParticipants = meeting.participants.filter(p => 
                        p.toLowerCase() !== Loggeduser.email.toLowerCase()
                      );
                      setEmailInput(otherParticipants.join(', '));
                      setEditingMeetingId(meeting.id);
                      setDuration(meeting.duration?.toString() || '');
                    }}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMeeting(meeting.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedDate && filteredMeetings.length === 0 && (
          <Text style={{ marginTop: 10 }}>There are no meetings on the selected date.</Text>
        )}

        <TimePickerModal
          visible={showTimePicker}
          onDismiss={() => setShowTimePicker(false)}
          onConfirm={handleConfirmTime}
          hours={selectedTime?.hours}
          minutes={selectedTime?.minutes}
          label="Select a time"
          cancelLabel="cancel"
          confirmLabel="confirm"
          animationType="fade"
          locale="he"
        />
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  inputContainer: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: "Inter_400Regular"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 25,
    fontFamily: "Inter_400Regular"
  },
  selectedTime: {
    fontSize: 16,
    marginVertical: 8,
  },
  meetingsContainer: {
    marginTop: 20,
  },
  meetingItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 10,
  },
  buttonRow: {
  flexDirection: 'row',
  marginTop: 10,
  gap: 10,
},

actionButton: {
  flex: 1,
  paddingVertical: 8,
  borderRadius: 10,
  alignItems: 'center',

},

editButton: {
  backgroundColor: "white",

},

deleteButton: {
  backgroundColor: "white",
},

buttonText: {
  fontFamily: 'Inter_400Regular',
  fontSize: 16,
  color: '#d6cbff',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
modalText: {
  fontSize: 16,
  fontFamily: 'Inter_400Regular',
  textAlign: 'center',
  marginBottom: 20,
},
modalButton: {
  backgroundColor: '#d6cbff',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
},
modalButtonText: {
  color: 'white',
  fontFamily: 'Inter_400Regular',
  fontSize: 16,
},

});