

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GlobalNotifications({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [mentorsData, setMentorsData] = useState(new Map());

  const [notificationModal, setNotificationModal] = useState({
    visible: false,
    data: null,
    type: null
  });
  
  const prevMeetingsRef = useRef(new Map());
  const prevTasksRef = useRef(new Map());
  const prevRejectionsRef = useRef(new Map()); // ✅ הוספה עבור דחיות
  const isInitialLoadRef = useRef(true);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const reminderIntervalRef = useRef(null);

  // המרת המייל לאותיות קטנות לשימוש בכל הפונקציות
  const userEmailLower = userEmail ? userEmail.toLowerCase() : '';

  // Load notifications from AsyncStorage when component mounts
  useEffect(() => {
    loadNotificationsFromStorage();
  }, []);

  // Save notifications to AsyncStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      saveNotificationsToStorage();
    }
  }, [notifications]);

  // Start reminder check interval
  useEffect(() => {
    startReminderCheck();
    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, [userEmailLower]);

  const loadNotificationsFromStorage = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(`notifications_${userEmailLower}`);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications).map(notif => ({
          ...notif,
          timestamp: new Date(notif.timestamp),
          ...(notif.meeting && {
            meeting: {
              ...notif.meeting,
              datetime: new Date(notif.meeting.datetime)
            }
          })
        }));
        setNotifications(parsedNotifications);
        const unreadNotifications = parsedNotifications.filter(notif => !notif.read);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  };

  const saveNotificationsToStorage = async () => {
    try {
      await AsyncStorage.setItem(`notifications_${userEmailLower}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  };

  // Function to check for upcoming meetings and create reminders
  const checkForUpcomingMeetings = async () => {
    if (!userEmailLower) return;

    try {
      const q = query(
        collection(db, 'meetings'),
        where('participants', 'array-contains', userEmailLower)
      );

      const querySnapshot = await new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            unsubscribe();
            resolve(snapshot);
          },
          (error) => {
            unsubscribe();
            reject(error);
          }
        );
      });

      const now = new Date();
      const storedReminders = await AsyncStorage.getItem(`reminders_${userEmailLower}`);
      const sentReminders = storedReminders ? JSON.parse(storedReminders) : [];
      const newReminders = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const meetingDateTime = data.Datetime.toDate();
        const timeDiff = meetingDateTime.getTime() - now.getTime();
        const hoursUntilMeeting = timeDiff / (1000 * 60 * 60);
        
        if (hoursUntilMeeting > 23 && hoursUntilMeeting <= 25) {
          const reminderId = `${doc.id}_reminder_${meetingDateTime.toDateString()}`;
          
          if (!sentReminders.includes(reminderId)) {
            const meetingData = {
              id: doc.id,
              title: data.title,
              datetime: meetingDateTime,
              participants: data.participants,
              createdBy: data.createdBy || data.participants[0],
              duration: data.duration || 30
            };

            const newReminder = {
              id: reminderId,
              type: 'reminder',
              meeting: meetingData,
              timestamp: new Date(),
              read: false
            };

            newReminders.push(newReminder);
            sentReminders.push(reminderId);

            setNotificationModal({
              visible: true,
              data: meetingData,
              type: 'reminder'
            });
          }
        }
      });

      if (newReminders.length > 0) {
        setNotifications(prev => [...newReminders, ...prev]);
        setUnreadCount(prev => prev + newReminders.length);
        await AsyncStorage.setItem(`reminders_${userEmailLower}`, JSON.stringify(sentReminders));
      }

    } catch (error) {
      console.error('Error checking for upcoming meetings:', error);
    }
  };

  const startReminderCheck = () => {
    checkForUpcomingMeetings();
    reminderIntervalRef.current = setInterval(() => {
      checkForUpcomingMeetings();
    }, 60 * 60 * 1000);
  };

  // ✅ Listen for rejected sessions - הוספה חדשה
  useEffect(() => {
    if (!userEmailLower) return;

    const q = query(
      collection(db, 'notifications'),
      where('jobSeekerEmail', '==', userEmailLower),
      where('status', '==', 'rejected')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const currentRejections = new Map();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        currentRejections.set(doc.id, {
          id: doc.id,
          sessionID: data.sessionID,
          mentorName: data.mentorName || data.mentorFirstName || 'Unknown Mentor',
          mentorEmail: data.mentorEmail,
          jobSeekerEmail: data.jobSeekerEmail,
          status: data.status,
          rejectedAt: data.rejectedAt || data.updatedAt,
          sessionTitle: data.sessionTitle || data.title || 'Session Request'
        });
      });

      // טוען דחיות שכבר נצפו מ-AsyncStorage
      const viewedRejections = await AsyncStorage.getItem(`viewedRejections_${userEmailLower}`);
      const viewedRejectionsSet = new Set(viewedRejections ? JSON.parse(viewedRejections) : []);

      if (isInitialLoadRef.current) {
        // במטען הראשון, שומר את כל הדחיות הקיימות כנצפות
        const existingRejectionIds = Array.from(currentRejections.keys());
        await AsyncStorage.setItem(`viewedRejections_${userEmailLower}`, JSON.stringify(existingRejectionIds));
        prevRejectionsRef.current = currentRejections;
        return;
      }

      const newNotifications = [];
      const newViewedRejections = Array.from(viewedRejectionsSet);

      for (const [docId, rejectionData] of currentRejections) {
        if (!prevRejectionsRef.current.has(docId) && !viewedRejectionsSet.has(docId)) {
          const newRejectionNotification = {
            id: docId + '_rejection_' + Date.now(),
            type: 'rejection',
            rejection: rejectionData,
            timestamp: new Date(),
            read: false
          };

          newNotifications.push(newRejectionNotification);
          newViewedRejections.push(docId);

          setNotificationModal({
            visible: true,
            data: rejectionData,
            type: 'rejection'
          });
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
        await AsyncStorage.setItem(`viewedRejections_${userEmailLower}`, JSON.stringify(newViewedRejections));
      }

      prevRejectionsRef.current = currentRejections;
    });

    return () => unsubscribe();
  }, [userEmailLower]);

  // Listen for new meetings
  useEffect(() => {
    if (!userEmailLower) return;

    const q = query(
      collection(db, 'meetings'),
      where('participants', 'array-contains', userEmailLower)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const currentMeetings = new Map();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        currentMeetings.set(doc.id, {
          id: doc.id,
          title: data.title,
          datetime: data.Datetime.toDate(),
          participants: data.participants,
          createdBy: data.createdBy || data.participants[0],
          duration: data.duration || 30
        });
      });

      if (isInitialLoadRef.current) {
        prevMeetingsRef.current = currentMeetings;
        isInitialLoadRef.current = false;
        return;
      }

      const newNotifications = [];
      currentMeetings.forEach((meetingData, meetingId) => {
        if (!prevMeetingsRef.current.has(meetingId) && meetingData.createdBy !== userEmailLower) {
          const newMeetingNotification = {
            id: meetingId + '_new_meeting_' + Date.now(),
            type: 'meeting',
            meeting: meetingData,
            timestamp: new Date(),
            read: false
          };

          newNotifications.push(newMeetingNotification);

          setNotificationModal({
            visible: true,
            data: meetingData,
            type: 'meeting'
          });
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
      }

      prevMeetingsRef.current = currentMeetings;
    });

    return () => unsubscribe();
  }, [userEmailLower]);

  // Listen for new tasks
  useEffect(() => {
    if (!userEmailLower) return;

    const q = query(
      collection(db, 'tasks'),
      where('jobSeekerEmail', '==', userEmailLower)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const currentTasks = new Map();
      const tasksArray = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasksArray.push({
          id: doc.id,
          taskID: data.taskID,
          sessionID: data.sessionID,
          createdAt: data.createdAt,
          jobSeekerEmail: data.jobSeekerEmail,
          title: data.title,
          description: data.description,
          mentorID: data.mentorID,
          mentorName: data.mentorName, 
          mentorFirstName: data.mentorFirstName, 
          mentorLastName: data.mentorLastName, 
        });
      });

      tasksArray.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      tasksArray.forEach(task => {
        currentTasks.set(task.id, task);
      });

      const viewedTasks = await AsyncStorage.getItem(`viewedTasks_${userEmailLower}`);
      const viewedTasksSet = new Set(viewedTasks ? JSON.parse(viewedTasks) : []);

      if (isInitialLoadRef.current) {
        const existingTaskIds = Array.from(currentTasks.keys());
        await AsyncStorage.setItem(`viewedTasks_${userEmailLower}`, JSON.stringify(existingTaskIds));
        prevTasksRef.current = currentTasks;
        return;
      }

      const newNotifications = [];
      const newViewedTasks = Array.from(viewedTasksSet);

      for (const [docId, taskData] of currentTasks) {
        if (!prevTasksRef.current.has(docId) && !viewedTasksSet.has(docId)) {
          const newTaskNotification = {
            id: docId + '_new_task_' + Date.now(),
            type: 'task',
            task: {
              ...taskData,
              mentorName: taskData.mentorName || 'Unknown Mentor'
            },
            timestamp: new Date(),
            read: false
          };

          newNotifications.push(newTaskNotification);
          newViewedTasks.push(docId);

          setNotificationModal({
            visible: true,
            data: {
              ...taskData,
              mentorName: taskData.mentorName || 'Unknown Mentor'
            },
            type: 'task'
          });
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
        await AsyncStorage.setItem(`viewedTasks_${userEmailLower}`, JSON.stringify(newViewedTasks));
      }

      prevTasksRef.current = currentTasks;
    });

    return () => unsubscribe();
  }, [userEmailLower]);

  const openNotifications = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeNotifications = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
    
    setNotifications(prev => {
      const updatedNotifications = prev.map(notif => ({ ...notif, read: true }));
      return updatedNotifications;
    });
    setUnreadCount(0);
  };

  const closeNotificationModal = () => {
    setNotificationModal({
      visible: false,
      data: null,
      type: null
    });
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    setUnreadCount(0);
    setModalVisible(false);
    try {
      await AsyncStorage.removeItem(`notifications_${userEmailLower}`);
      await AsyncStorage.removeItem(`reminders_${userEmailLower}`);
    } catch (error) {
      console.error('Error clearing notifications from storage:', error);
    }
  };

  const formatDateTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-US');
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${formattedDate} ${formattedTime}`;
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'meeting':
        return 'New Meeting';
      case 'reminder':
        return 'Meeting Reminder';
      case 'task':
        return 'New Task';
      case 'rejection': // ✅ הוספה חדשה
        return 'Request Rejected';
      default:
        return 'Notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meeting':
        return 'event';
      case 'reminder':
        return 'schedule';
      case 'task':
        return 'assignment';
      case 'rejection': // ✅ הוספה חדשה
        return 'cancel';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'meeting':
        return '#BFB4FF';
      case 'reminder':
        return '#9FF9D5';
      case 'task':
        return '#2196F3';
      case 'rejection': // ✅ הוספה חדשה
        return '#FF6B6B';
    }
  };

  const getModalTitle = (type) => {
    switch (type) {
      case 'meeting':
        return '📅 New Meeting';
      case 'reminder':
        return '⏰ Meeting Reminder';
      case 'task':
        return '📋 New Task';
      case 'rejection': // ✅ הוספה חדשה
        return '❌ Request Rejected';
    }
  };

  const getModalSubtitle = (type) => {
    switch (type) {
      case 'meeting':
        return 'A new meeting has been scheduled:';
      case 'reminder':
        return 'Your meeting is tomorrow:';
      case 'task':
        return 'A new task has been created:';
      case 'rejection': // ✅ הוספה חדשה
        return 'Your session request has been rejected:';
    }
  };

  const renderNotificationItem = ({ item }) => (
    <View style={[styles.notificationItem, !item.read && styles.unreadNotification]}>
      <View style={styles.notificationHeader}>
        <Icon 
          name={getNotificationIcon(item.type)} 
          size={20} 
          color={getNotificationColor(item.type)} 
        />
        <Text style={styles.notificationTitle}>{getNotificationTitle(item.type)}</Text>
        <Text style={styles.notificationTime}>
          {item.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {item.type === 'task' ? (
        <View>
          <Text style={styles.taskTitle}>📋 {item.task.title}</Text>
          <Text style={styles.taskDetails}>
            👤 Added by: {item.task.mentorName}
          </Text>
          {item.task.description && (
            <Text style={styles.taskDetails}>📝 {item.task.description}</Text>
          )}
        </View>
      ) : item.type === 'rejection' ? ( // ✅ הוספה חדשה
        <View>
          <Text style={styles.rejectionTitle}>❌ {item.rejection.sessionTitle}</Text>
          <Text style={styles.rejectionDetails}>
            👤 Rejected by: {item.rejection.mentorName}
          </Text>
          <Text style={styles.rejectionMessage}>
            Your session request has been declined
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.meetingTitle}>📌 {item.meeting.title}</Text>
          <Text style={styles.meetingDetails}>
            📅 {formatDateTime(item.meeting.datetime)}
          </Text>
          <Text style={styles.meetingDetails}>
            ⏱️ Duration: {item.meeting.duration} minutes
          </Text>
          {item.type === 'reminder' && (
            <Text style={styles.reminderText}>
              ⏰ Meeting is tomorrow!
            </Text>
          )}
        </View>
      )}
      
      {!item.read && <View style={styles.unreadDot} />}
    </View>
  );

  const NotificationModal = () => {
    if (!notificationModal.data) return null;

    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={notificationModal.visible}
        onRequestClose={closeNotificationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon 
              name={getNotificationIcon(notificationModal.type)} 
              size={50} 
              color={getNotificationColor(notificationModal.type)} 
              style={{ marginBottom: 15 }} 
            />
            <Text style={styles.modalTitle}>{getModalTitle(notificationModal.type)}</Text>
            <Text style={styles.modalSubtitle}>{getModalSubtitle(notificationModal.type)}</Text>
            
            <View style={styles.detailsModal}>
              {notificationModal.type === 'task' ? (
                <View>
                  <Text style={styles.taskTitleModal}>📋 {notificationModal.data.title}</Text>
                  <Text style={styles.taskSessionModal}>👤 Added by: {notificationModal.data.mentorName}</Text>
                </View>
              ) : notificationModal.type === 'rejection' ? ( // ✅ הוספה חדשה
                <View>
                  <Text style={styles.rejectionTitleModal}>❌ {notificationModal.data.sessionTitle}</Text>
                  <Text style={styles.rejectionMentorModal}>👤 Rejected by: {notificationModal.data.mentorName}</Text>
                  <Text style={styles.rejectionMessageModal}>
                    Unfortunately, your session request has been declined. You can try requesting another session with a different mentor.
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.meetingTitleModal}>📌 {notificationModal.data.title}</Text>
                  <Text style={styles.meetingDateModal}>📅 {notificationModal.data.datetime.toLocaleDateString('en-US')}</Text>
                  <Text style={styles.meetingTimeModal}>🕒 {notificationModal.data.datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                  {notificationModal.data.duration && (
                    <Text style={styles.meetingTimeModal}>⏱️ Duration: {notificationModal.data.duration} minutes</Text>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity 
              onPress={closeNotificationModal} 
              style={[styles.modalButton, { backgroundColor: getNotificationColor(notificationModal.type) }]}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={openNotifications}
      >
        <Icon 
          name="notifications" 
          size={24} 
          color={unreadCount > 0 ? "#999" : "#999"} 
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="none"
        visible={modalVisible}
        onRequestClose={closeNotifications}
      >
        <View style={styles.sideMenuOverlay}>
          <TouchableOpacity 
            style={styles.backgroundTouchable} 
            onPress={closeNotifications} 
            activeOpacity={1}
          />
          <Animated.View style={[styles.sideMenuContainer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleSide}>Notifications</Text>
              <View style={styles.headerButtons}>
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={clearAllNotifications}>
                    <Text style={styles.clearButton}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeNotifications}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="notifications-none" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No new notifications</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id}
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Animated.View>        
        </View>
      </Modal>

      <NotificationModal />
    </>
  );
}
const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#9FF9D5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  backgroundTouchable: {
    flex: 1,
    width: '55%',
  },
  sideMenuOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sideMenuContainer: {
    backgroundColor: '#fff',
    width: '45%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 10,
  },
  modalTitleSide: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  clearButton: {
    color: '#d6cbff',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  notificationsList: {
    paddingHorizontal: 20,
  },
  notificationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#d6cbff',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#999',
  },
  meetingTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  meetingDetails: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  taskDetails: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 2,
  },
  reminderText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#9FF9D5',
    marginTop: 4,
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d6cbff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#999',
    marginTop: 10,
  },
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
  detailsModal: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  meetingTitleModal: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  meetingDateModal: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  meetingTimeModal: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  taskTitleModal: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  taskSessionModal: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 4,
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