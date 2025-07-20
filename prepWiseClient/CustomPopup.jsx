import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Button, Dialog, Portal, Text, Provider as PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import icons
import { useFonts } from 'expo-font';
import {Inter_400Regular,Inter_300Light, Inter_700Bold,Inter_100Thin,Inter_200ExtraLight } from '@expo-google-fonts/inter';


const { width } = Dimensions.get("window"); // Get screen width
const CustomPopup = ({ visible, onDismiss, icon, message,isConfirmation = false, onConfirm,onCancel}) => {
 const [fontsLoaded] = useFonts({
     Inter_400Regular,
     Inter_700Bold,
     Inter_100Thin,
     Inter_200ExtraLight,
     Inter_300Light
   });

  return (
    <PaperProvider>
    <Portal>
      {visible && (
        <View style={styles.overlay}>
          <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
            <Dialog.Title style={styles.title}>
              <MaterialCommunityIcons name={icon} size={40} color="#d6cbff" />
            </Dialog.Title>
            <Dialog.Content style={styles.content}>
              <Text style={styles.message}>{message}</Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.actions}>
              {isConfirmation ? (
                <>
                  <Button mode="outlined" onPress={onCancel} style={[styles.button, { backgroundColor: 'white',  marginRight: 20, }]} labelStyle={{color:"#d6cbff"}} >
                    No
                  </Button>
                  <Button mode="contained" onPress={onConfirm} style={styles.button}>
                    Yes
                  </Button>
                </>
              ) : (
                <Button mode="contained" onPress={onDismiss} style={styles.button}>
                  OK
                </Button>
              )}
            </Dialog.Actions>
          </Dialog>
        </View>
      )}
    </Portal>
  </PaperProvider>
  );
};

const styles = StyleSheet.create({
  overlay: {
  position: "absolute", 
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  },
  dialog: {
    width: width - 60, // Makes the dialog width slightly less than screen width
    maxWidth: 400, // Restrict max width
    backgroundColor: "white",
    borderRadius: 15,
    elevation: 5, // Shadow effect for Android
    shadowColor: "#000", // Shadow effect for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    alignSelf:'center',
    zIndex:1000
  },
  title: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf:'center',
    padding:10
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  
    
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginVertical: 15,
    fontFamily: "Inter_400Regular"
    
  },
  actions: {
    justifyContent: "center",
  },
  button: {
    borderRadius: 10,
    backgroundColor: "#d6cbff",
    paddingHorizontal: 10,
    fontFamily:"Inter_400Regular",
   
  },

 
});

export default CustomPopup;