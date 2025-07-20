

import { useEffect, useRef, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function MeetingNotifications(userEmail) {
  const prevMeetingsRef = useRef(new Map());
  const isInitialLoadRef = useRef(true);
  const [notificationModal, setNotificationModal] = useState({
    visible: false,
    meeting: null
  });

  useEffect(() => {
    if (!userEmail) {
      console.log('No userEmail provided, listener not started');
      return;
    }

    console.log('🔔 Starting meeting listener for user:', userEmail);

    const q = query(
      collection(db, 'meetings'),
      where('participants', 'array-contains', userEmail)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const currentMeetings = new Map();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        currentMeetings.set(doc.id, {
          title: data.title,
          datetime: data.Datetime.toDate(),
          participants: data.participants,
          createdBy: data.createdBy || data.participants[0] // fallback if createdBy doesn't exist
        });
      });

      console.log('📊 Current meetings count:', currentMeetings.size);

      // Skip alert on initial load
      if (isInitialLoadRef.current) {
        console.log('⏳ Initial load of meetings, no alert');
        prevMeetingsRef.current = currentMeetings;
        isInitialLoadRef.current = false;
        return;
      }

      // Check for new meetings
      currentMeetings.forEach((meetingData, meetingId) => {
        if (!prevMeetingsRef.current.has(meetingId)) {
          // Only show modal if the current user is NOT the creator
          const isCreator = meetingData.createdBy === userEmail;
          console.log('🆕 New meeting detected:', {
            title: meetingData.title,
            isCreator,
            createdBy: meetingData.createdBy,
            currentUser: userEmail
          });
          
          if (!isCreator) {
            setNotificationModal({
              visible: true,
              meeting: meetingData
            });
          } else {
            console.log('👤 User created this meeting, no notification needed');
          }
        }
      });

      prevMeetingsRef.current = currentMeetings;
    }, (error) => {
      console.error('❌ Error in meeting listener:', error);
    });

    return () => {
      console.log('🔕 Unsubscribing meeting listener');
      unsubscribe();
    };
  }, [userEmail]);

  const closeNotification = () => {
    setNotificationModal({
      visible: false,
      meeting: null
    });
  };

  const NotificationModal = () => {
    if (!notificationModal.meeting) return null;

    const formattedDate = notificationModal.meeting.datetime.toLocaleDateString('he-IL');
    const formattedTime = notificationModal.meeting.datetime.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={notificationModal.visible}
        onRequestClose={closeNotification}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="event" size={50} color="#d6cbff" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>🗓️ New Meeting</Text>
            <Text style={styles.modalSubtitle}>A new meeting has been scheduled for you :</Text>
            
            <View style={styles.meetingDetails}>
              <Text style={styles.meetingTitle}>📌 {notificationModal.meeting.title}</Text>
              <Text style={styles.meetingDate}>🗓️ {formattedDate}</Text>
              <Text style={styles.meetingTime}>🕒 {formattedTime}</Text>
            </View>

            <TouchableOpacity 
              onPress={closeNotification} 
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return { NotificationModal };
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  meetingDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  meetingTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  meetingDate: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  meetingTime: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#d6cbff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 100,
  },
  modalButtonText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
});