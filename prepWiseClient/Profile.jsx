import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  Button,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import NavBar from "./NavBar";
import NavBarMentor from "./Mentor/NavBarMentor";
import EditFilesModal from "./FilesComps/EditFilesModal";

import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from "@expo-google-fonts/inter";
import CustomPopup from "./CustomPopup";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useContext } from "react";
import { UserContext } from "./UserContext"; // adjust the path
import {apiUrlStart} from './api';

const Profile = () => {
  const { Loggeduser, setLoggedUser } = useContext(UserContext);
  const [IsMentor, setIsMentor] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
  });

  const [popupVisible, setPopupVisible] = useState(false);

  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // משתנה לשמירת פרטי המשתמש
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    picture: "",
  });

  const [showEditModal, setShowEditModal] = useState(false); //for files

  const [userID, setUserID] = useState(null); // To store userID
  useEffect(() => {
    if (Loggeduser) {
      setUser(Loggeduser);
      setUserID(Loggeduser.id); // if needed elsewhere
      console.log("Logged user:", Loggeduser);
      loginAsUser(Loggeduser.email, Loggeduser.password); // use it directly from Loggeduser here
      setEmail(Loggeduser.email);
    }
  }, [Loggeduser]);

  const loginAsUser = async (email, password) => {
    console.log(email, password, Loggeduser.password);

    try {
      console.log("Sending request to API...");
      const API_URL =`${apiUrlStart}/api/Users/SearchUser`;
      const response = await fetch(API_URL, {
        method: "POST", // Specify that this is a POST request
        headers: {
          "Content-Type": "application/json", // Indicate that you're sending JSON data
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

      if (response.ok) {
        console.log("user found ");

        // Convert response JSON to an object
        const userData = await response.json();
        console.log(userData);
        console.log(userData.picture);

        if (userData.picture === "string")
          setProfileImage(require("./assets/defaultProfileImage.jpg"));
        else setProfileImage({ uri: userData.picture });
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setIsMentor(userData.isMentor);
        //setProfileImage(userData.profileImage)
        console.log("mentor?", IsMentor);
        console.log("firstName?", firstName);

        console.log("Profile Image URL:", profileImage);
      }
if (!response.ok) {
        throw new Error("failed to find user");
      }
    } catch (error) {
      console.log(error);
    }
  };
  //delete user function
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Users/Deletebyid?userid=${userID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Your profile has been deleted.");

        await AsyncStorage.removeItem("user"); //מחיקת המשתמש מהלוקל סטורג
      } else {
        Alert.alert("Error", "Failed to delete your profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Delete error:", error);
    }
  };
  const deleteUserProfile = () => {
    setPopupVisible(true); // רק פותח את הפופאפ, לא מוחק
  };

  //log out function
  const handleLogOut = async () => {
    await AsyncStorage.removeItem("user"); //מחיקת המשתמש מהלוקל סטורג
    setLoggedUser(null);
     setTimeout(() => {
    navigation.navigate("SignIn");
  }, 50); // short delay to prevent race condition
   // navigation.navigate("SignIn");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require("../prepWise/assets/backgroundProfileImage.jpg")}
          style={styles.headerBackground}
        />

        <View style={styles.cardContainer}>
          <View style={styles.detailsContainer}>
            {/* פרטי משתמש ,תמונת הפרופיל */}
            <Image source={profileImage} style={styles.profileImage} />
            <Text style={styles.name}>
              {firstName} {lastName}
            </Text>
            <Text style={styles.email}>{email}</Text>
          </View>
          <View style={styles.boxContainer}>
            {/* תיבה ראשונה - עליונה */}
            <View style={styles.box}>
              {/**NAVIGATION TO EDIT PROFILE PAGE */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  if (IsMentor) navigation.navigate("EditProfileMentor");
                  else navigation.navigate("EditProfile");
                }}
              >
                <Text style={styles.optionText}>
                  <AntDesign name="edit" size={20} color="black" /> Edit profile
                  information
                </Text>
              </TouchableOpacity>

              {/**NAVIGATION TO EDIT files list PAGE */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  setShowEditModal(true);
                }}
              >
                <Text style={styles.optionText}>
                  <AntDesign name="edit" size={20} color="black" /> Manage Files
                  List
                </Text>
              </TouchableOpacity>

              {/**NOTIFICATION */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <Text style={styles.optionText}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={notificationsEnabled ? "black" : "gray"}
                  />{" "}
                  Notifications
                </Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={() =>
                    setNotificationsEnabled(!notificationsEnabled)
                  }
                  trackColor={{ false: "#D3D3D3", true: "#9FF9D5" }}
                />
                {/**DELETE ACCOUNT */}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => deleteUserProfile()}
              >
                <Text style={styles.optionText}>
                  <AntDesign name="delete" size={20} color="black" /> Delete My
                  Account
                </Text>
              </TouchableOpacity>
            </View>
{/* תיבה שנייה - תחתונה */}
            <View style={styles.box}>
              {/**LOG OUT */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleLogOut()}
              >
                <Text style={styles.optionText}>
                  <MaterialCommunityIcons
                    name="logout-variant"
                    size={20}
                    color="black"
                  />{" "}
                  Log Out
                </Text>
              </TouchableOpacity>
              {/**CONTACT US */}
              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>
                  <MaterialCommunityIcons
                    name="message-processing-outline"
                    size={20}
                    color="black"
                  />{" "}
                  Contact us
                </Text>
              </TouchableOpacity>
              {/**PRIVACY POLICY */}
              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>
                  <AntDesign name="lock" size={20} color="black" /> Privacy
                  policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {popupVisible && ( //צריך להוסיף בשביל ההחשכה
          <View style={styles.overlay}>
            {" "}
            {/*צריך גם להוסיף בשביל ההחשכה*/}
            <CustomPopup
              visible={popupVisible}
              isConfirmation={true}
              icon="alert-circle-outline"
              message="Are you sure?"
              onConfirm={() => {
                handleConfirmDelete();
                navigation.navigate("SignIn");
              }}
              onCancel={() => setPopupVisible(false)}
            />
          </View>
        )}

        {/* סרגל הניווט */}
        <View style={styles.tabContainer}>
          {IsMentor ? <NavBarMentor /> : <NavBar />}
        </View>

        <EditFilesModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          userId={userID}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    //צריך להוסיף בשביל ההחשכה, את כל העיצוב של overlay
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    alignItems: "center",
    paddingTop: 205,
    paddingBottom: 60,
    flexGrow: 1, // זה יגרום ל-ScrollView למלא את כל הגובה של המסך, כך ש-NavBar יהיה בתחתית
  },

  headerBackground: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: Platform.OS === "web" ? "100%" : 220,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignSelf: "center",
    resizeMode: "cover",
    opacity: Platform.OS === "web" ? 0.5 : 1,
  },

  profileImage: {
    width: Platform.OS === "web" ? 200 : 150,
    height: Platform.OS === "web" ? 200 : 150,
    borderRadius: Platform.OS === "web" ? 130 : 80,
    borderWidth: 3,
    borderColor: "white",
    alignSelf: "flex-start",
    marginLeft: 20,
  },
name: {
    fontSize: 22,
    marginTop: Platform.OS === "web" ? 10 : 15,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-start",
    marginLeft: Platform.OS === "web" ? 70 : 45,
    color: "#003D5B",
  },
  email: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-start",
    marginLeft: Platform.OS === "web" ? 67 : 45,
    marginTop: 5,
  },
  box: {
    width: Platform.OS === "web" ? "50%" : "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 1.5, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginRight: Platform.OS === "web" ? 200 : 0,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Inter_300Light",
  },
  tabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },

  boxContainer: {
    width: Platform.OS === "web" ? "90%" : "100%",
    marginLeft: Platform.OS === "web" ? "500px" : 40,
    marginRight: Platform.OS === "web" ? 0 : 0,
    transform: Platform.OS === "web" ? [{ translateY: -400 }] : [],
  },

  cardContainer: {
    height: "50%",
    width: Platform.OS === "web" ? "85%" : "100%",
    marginRight: Platform.OS === "web" ? 0 : 30,
    backgroundColor: Platform.OS === "web" ? "white" : "null",
    borderRadius: Platform.OS === "web" ? "12px" : "0px",
    boxShadow: Platform.OS === "web" ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "0",
    padding: Platform.OS === "web" ? "150px" : "0px",
  },

  detailsContainer: {
    width: Platform.OS === "web" ? "40%" : "100%",
    backgroundColor: Platform.OS === "web" ? "white" : "null",
    borderRadius: Platform.OS === "web" ? "12px" : "0px",
    boxShadow: Platform.OS === "web" ? "0 6px 12px rgba(0, 0, 0, 0.2)" : "0",
    padding: Platform.OS === "web" ? "20px" : "0px",
    //check for the mobile
    alignItems: "center",
    transform: Platform.OS === "web" ? [{ translateY: -90 }] : [],
  },
});

export default Profile;