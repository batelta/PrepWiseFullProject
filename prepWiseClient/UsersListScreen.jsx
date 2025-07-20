import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserContext } from './UserContext';
import Icon from 'react-native-vector-icons/Feather';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native';
import {apiUrlStart} from './api';

export default function UsersListScreen() {
  const navigation = useNavigation();
  const { Loggeduser, loadingUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [messageListeners, setMessageListeners] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
  });

  // ✅ פונקציה שמביאה פרטי משתמש לפי ID
  const fetchUserDetailsById = async (userId) => {
    try {
      const response = await fetch(`${apiUrlStart}/api/Users?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const userData = await response.json();
        // בודקת אם המחרוזת כבר כוללת את ה-data:image
    const imageBase64 = userData.picture?.startsWith('data:image')
      ? userData.picture
      : `data:image/jpeg;base64,${userData.picture}`;

    return {
      name: `${userData.firstName} ${userData.lastName}`,
      image: imageBase64 || null,
      
    };
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      return { name: 'Unknown', image: null };
    }
  };

  useEffect(() => {
    if (!loadingUser && Loggeduser) {
      const unsubscribe = setupChatsListener();
      return () => unsubscribe();
    }
  }, [loadingUser, Loggeduser]);

  const setupChatsListener = () => {
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', Loggeduser.id));
    const unsubscribeChats = onSnapshot(q, (chatsSnapshot) => {
      const listeners = [];
      const foundUsers = new Map();

      chatsSnapshot.docs.forEach((docSnap) => {
        const chatId = docSnap.id;
        const chatData = docSnap.data();
        const otherUserId = chatData.participants.find((id) => id !== Loggeduser.id);

        if (!foundUsers.has(otherUserId)) {
          const messagesRef = collection(db, `chats/${chatId}/messages`);
          const qMessages = query(messagesRef, orderBy('createdAt', 'desc'));

const unsubscribeMessages = onSnapshot(qMessages, async (messagesSnapshot) => {
  try {
    const messages = messagesSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          text: data.text || '',
          createdAt: data.createdAt?.toDate?.() || null,
          sender: data.user?._id || '',
          read: data.read,
        };
      })
      .filter((msg) => msg.createdAt !== null);

    const lastMessage = messages.length > 0 ? messages[0].text : '';
    const lastMessageTime = messages.length > 0 ? messages[0].createdAt : new Date(0);
    
    // 🔥 התיקון כאן - השווה נכון את ה-ID
    const unreadCount = messages.filter(
      (msg) => String(msg.sender) !== String(Loggeduser.id) && !msg.read
    ).length;

    // ✅ שליפת שם ותמונה מהשרת
    const { name, image } = await fetchUserDetailsById(otherUserId);

    foundUsers.set(otherUserId, {
      _id: otherUserId,
      name,
      image,
      lastMessage,
      lastMessageTime,
      unreadCount,
    });

    const updatedUsers = Array.from(foundUsers.values()).sort(
      (a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)
    );

    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setLoadingChats(false);
  } catch (error) {
    console.log('❌ Error loading messages:', error);
  }
});

          listeners.push(unsubscribeMessages);
        }
      });

      setMessageListeners(listeners);
    });

    return () => {
      unsubscribeChats();
      messageListeners.forEach((unsub) => unsub());
    };
  };

  const openChat = (otherUser) => {
    navigation.navigate('ChatScreen', {
      user: Loggeduser,
      otherUser: {
        _id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        image: otherUser.image || null,
      },
    });
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  if (loadingUser || loadingChats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.textMessages}>Loading...</Text>
      </View>
    );
  }

  if (!Loggeduser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.textMessages}>No LoggedIn user found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>



      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
            console.log('🖼️ item.image:', item.image?.substring(0, 100)),// נראה מה יש שם

          <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.date}>
                  {item.lastMessageTime
                    ? `${item.lastMessageTime.toLocaleDateString('he-IL')} ${item.lastMessageTime.toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : ''}
                </Text>
              </View>
              <View style={styles.chatFooter}>
                <Text style={styles.message} numberOfLines={1}>
                  {item.lastMessage || 'No Messages Found'}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.textMessages}>No previous conversations found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    fontFamily:"Inter_400Regular"

  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily:"Inter_400Regular",
    outlineStyle: 'none',
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12,
  backgroundColor: '#eee',
},

  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    fontFamily:"Inter_400Regular"

  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontFamily:"Inter_400Regular"

  },
  date: {
    fontSize: 12,
    color: '#999',
    fontFamily:"Inter_400Regular"

  },
  message: {
    fontSize: 14,
    color: '#666',
    flex: 1,

    
  },
  unreadBadge: {
    backgroundColor: '#9FF9D5',
    borderRadius: 999,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textMessages:{
    fontFamily:"Inter_400Regular"

  }
});