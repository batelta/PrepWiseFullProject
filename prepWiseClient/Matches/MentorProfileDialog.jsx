import React from 'react';
import { View, Image, Text, Dimensions, StyleSheet } from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';
import { Provider as PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from 'react';
import { UserContext } from '../UserContext'; 
import {apiUrlStart} from '../api';

const { width } = Dimensions.get("window");

const MentorProfileDialog = ({ visible, onClose, mentor }) => {
  if (!mentor) return null;
  const navigation = useNavigation();
    const { Loggeduser } = useContext(UserContext);



  const imageSource =
    mentor?.picture === "string"
      ? require('../assets/defaultProfileImage.jpg')
      : { uri: mentor?.picture };


      const addNewMatch= async( userID, mentorID) =>{
      try {
        const API_URL = `${apiUrlStart}/api/Users/confirm` 

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobSeekerID: userID,
            mentorID: mentorID,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log('Match confirmed:', data);
          navigation.navigate("ChatScreen", {
            user: Loggeduser,
            otherUser: mentor,
            matchId: data.matchId // optional if you need it later
          });
        } else {
          console.error('Failed to confirm match:', data.message);
          // optionally show a Snackbar or alert
        }
      } catch (error) {
        console.error('Error confirming match:', error);
        // optionally show a Snackbar or alert
      }
    }
  
  return (
    <PaperProvider>
      <Portal>
      {visible && (
  <Dialog
    visible={visible}
    onDismiss={onClose}
    style={styles.dialog}
  >
              <Dialog.Content style={styles.content}>
                <Image source={imageSource} style={styles.profileImage} />

                <Text style={styles.name}>{mentor.firstName} {mentor.lastName}</Text>

                {/* Social icons placeholder */}
                <View style={styles.socialIcons}>
                  <MaterialCommunityIcons name="facebook" size={20} color="#003D5B" style={{ marginRight: 8 }} />
                  <MaterialCommunityIcons name="linkedin" size={20} color="#003D5B" />
                </View>

                {/* Career Fields as Profession */}
                {mentor.isHr ? (
  <>
    <Text style={styles.label}>Profession</Text>
    <Text style={styles.value}>HR</Text>
  </>
) : (
  <>
    {mentor.roles && mentor.roles.length > 0 && mentor.roles[0] !== '' && (
      <>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>
          {Array.isArray(mentor.roles) ? mentor.roles.join(', ') : mentor.roles}
        </Text>
      </>
    )}

    {mentor.careerField && (
      <>
        <Text style={styles.label}>Career Field</Text>
        <Text style={styles.value}>
          {Array.isArray(mentor.careerField)
            ? mentor.careerField.join(', ')
            : mentor.careerField}
        </Text>
      </>
    )}
  </>
)}

               {/* Company (only if exists and not empty) */}
               {typeof mentor.company === 'string' && mentor.company.trim() !== '' && (
                <>
                  <Text style={styles.label}>Company</Text>
                  <Text style={styles.value}>{mentor.company}</Text>
                </>
              )}

                {/* Average Rank (Dummy) */}
                <Text style={styles.label}>Average Rank</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.value}>4.8</Text>
                  <MaterialCommunityIcons name="star" color="#FFD700" size={18} />
                  <MaterialCommunityIcons name="star" color="#FFD700" size={18} />
                  <MaterialCommunityIcons name="star" color="#FFD700" size={18} />
                  <MaterialCommunityIcons name="star" color="#FFD700" size={18} />
                  <MaterialCommunityIcons name="star-half" color="#FFD700" size={18} />
                </View>

                {/* Languages */}
                <Text style={styles.label}>Languages</Text>
                <Text style={styles.value}>
                  {Array.isArray(mentor.language)
                    ? mentor.language.join(', ')
                    : mentor.language}
                </Text>
              </Dialog.Content>

              <Dialog.Actions style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={onClose}
                  style={[styles.button, { backgroundColor: 'white', marginRight: 10 }]}
                  labelStyle={{ color: '#d6cbff' }}
                >
                  Close
                </Button>
                <Button
  mode="contained"
  onPress={() => {
    console.log('Start conversation');
    console.log('ids :', Loggeduser?.id,mentor.userID);
addNewMatch(Loggeduser?.id,mentor.userID);
    navigation.navigate("ChatScreen", {
      user: Loggeduser,
      otherUser: mentor
    });
  }}
  style={styles.button}
>
  Choose This Mentor
                </Button>
              </Dialog.Actions>
            </Dialog>
        )}
      </Portal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },
  dialog: {
    width: width - 60,
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    alignSelf: 'center',
    marginTop: 80,

  },
  content: {
    alignItems: "center",
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003D5B",
    marginTop: 5,
  },
  socialIcons: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  value: {
    fontSize: 15,
    color: '#003D5B',
    fontWeight: '400',
  },
  actions: {
    justifyContent: "center",
    marginBottom: 10,
  },
  button: {
    borderRadius: 12,
    backgroundColor: "#BFB4FF",
    paddingHorizontal: 20,
  },
});

export default MentorProfileDialog;
