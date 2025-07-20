import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { TextInput, Button, Snackbar, Text, Switch } from "react-native-paper";
import { TouchableOpacity, Modal } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from "@expo-google-fonts/inter";
import Icon from "react-native-vector-icons/MaterialIcons";
import NavBar from "../NavBar";
import CustomPopup from "../CustomPopup";
import GeminiChat from "../GeminiChat";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { useContext } from "react";
import { UserContext } from "../UserContext";
import RenderDisplayModeApplication from "./RenderDisplayModeApplication";
import EditModeAppliction from "./EditModeApplication";


  export default function Application({ applicationID: propID }) {
    const { Loggeduser } = useContext(UserContext);
    const apiUrlStart ="http://localhost:5062"

    const [User, setUser] = useState("");
    const [loading, setLoading] = useState(true);
  
    const [fontsLoaded] = useFonts({
      Inter_400Regular,
      Inter_700Bold,
      Inter_100Thin,
      Inter_200ExtraLight,
      Inter_300Light,
    });
  
    const [showFileSelector, setShowFileSelector] = useState(false);
    const [linkedFiles, setLinkedFiles] = useState([]); //using to show all application files
  
    const route = useRoute();
    const applicationID = route.params?.applicationID || propID; //if there is no applicationID from the navigate use propID
  
    const [originalApplication, setOriginalApplication] = useState({}); //for setting the right infoamntion in ui when user edit and did not save
  
    const [showChat, setShowChat] = useState(false);
  
    const navigation = useNavigation();
  
    const [contactErrors, setContactErrors] = useState({
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
  
    const [application, setApplication] = useState({
      applicationID: null,
      title: "",
      companyName: "",
      location: "",
      url: "",
      companySummary: "",
      jobDescription: "",
      notes: "",
      jobType: "",
      isHybrid: false,
      isRemote: false,
      contacts: [],
      applicationStatus: "",
    });
  
    const [isEditing, setIsEditing] = useState(false); //application in edit mode?
  
    const [isEditingContact, setIsEditingContact] = useState(false); // conatct in edit mode?
    const [contactEditMode, setContactEditMode] = useState("edit");
  
    const [contactToEdit, setContactToEdit] = useState(null); // current conatct in edit mode
    const [snackbarVisible, setSnackbarVisible] = useState(false);
  
    const [jobTypeModalVisible, setJobTypeModalVisible] = useState(false); //job type modal
  
    const [contactModalVisible, setContactModalVisible] = useState(false); //modal conatcts
  
    const [popup, setPopup] = useState({
      visible: false,
      message: "",
      icon: "information",
      isConfirmation: false,
      onConfirm: () => {},
      onOk: () => {},
    });
  
    // only to show messages
    const showMessage = (message, icon = "information", onOk = () => {}) => {
      setPopup({
        visible: true,
        message,
        icon,
        isConfirmation: false,
        onConfirm: () => {},
        onOk,
      });
    };
  
    // ask for a confirmation
    const showConfirmation = (message, onConfirm, icon = "alert-circle") => {
      setPopup({
        visible: true,
        message,
        icon,
        isConfirmation: true,
        onConfirm,
        onOk: () => {},
      });
    };
  
    const closePopup = () => {
      setPopup((prev) => ({ ...prev, visible: false }));
    };
  
    const jobTypeList = [
      { label: "Full Time", value: "FullTime" },
      { label: "Part Time", value: "PartTime" },
      { label: "Internship", value: "Internship" },
      { label: "Freelance", value: "Freelance" },
      { label: "Temporary", value: "Temporary" },
      { label: "Student", value: "Student" },
    ];
  
    const validateName = (name) => /^[A-Za-z\u0590-\u05FF\s]{1,30}$/.test(name);
    const validateEmail = (email) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const validatePhone = (phone) => /^[0-9+\-\s]{6,15}$/.test(phone);
  
    // get conected user inforamtion
    useEffect(() => {
      if (Loggeduser) {
        console.log("Logged user:", Loggeduser);
        console.log("User ID:", Loggeduser.id);
        setUser(Loggeduser);
      }
    }, [Loggeduser]);
  
    useEffect(() => {
      if (!applicationID || !Loggeduser) {
        console.log("Missing applicationID or logged user, skipping fetch");
        setLoading(false);
        return;
      }
  
      console.log("Fetching application:", applicationID); //for checking
  
      const fetchApplication = async () => {
        try {
          const API_URL =
            Platform.OS === "web"
              ? `${apiUrlStart}/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}`
              : `${apiUrlStart}/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}`;
          //const API_URL = `https://proj.ruppin.ac.il/igroup11/prod/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}`;
          const response = await fetch(API_URL);
          const data = await response.json();
          console.log("Fetched application data:", data);
  
          setOriginalApplication({ ...data, contacts: data.contacts || [] });
          setApplication({ ...data, contacts: data.contacts || [] });
        } catch (error) {
          console.error("Error loading application", error);
          Alert.alert("Error", "Failed to load application");
        } finally {
          setLoading(false);
        }
      };
  
      fetchApplication();
    }, [applicationID, Loggeduser]);
  
    const handleChange = (field, value) => {
      setApplication((prev) => ({ ...prev, [field]: value }));
    };
  
    const handleUpdate = async () => {
      try {
        console.log("updating applicationID:", applicationID);
        //const API_URL = `https://proj.ruppin.ac.il/igroup11/prod/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}`;
        const API_URL =
          Platform.OS === "web"
            ? `${apiUrlStart}/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}`
            : `${apiUrlStart}/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}`;
  
        const response = await fetch(API_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...application, contacts: [] }),
        });
  
        if (!response.ok) throw new Error("Failed to update application");
  
        setSnackbarVisible(true);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating:", error);
        Alert.alert("Error", `Something went wrong: ${error.message}`);
      }
    };
  
    const handleDeleteApplication = async () => {
      try {
        const API_URL = `${apiUrlStart}/api/JobSeekers/deleteById/${User.id}/${applicationID}`;
  
        const response = await fetch(API_URL, {
          method: "DELETE",
        });
  
        if (!response.ok) throw new Error("Failed to delete application");
  
        showMessage("Application deleted successfully!", "check-circle", () => {
          if (Platform.OS === "web") {
            navigation.replace("ApplicationSplitView");
          } else {
            navigation.goBack();
          }
        });
      } catch (error) {
        console.error("Error deleting application:", error);
  
        showMessage("Failed to delete application", "alert-circle");
      }
    };
  
    const handleContactChange = (field, value) => {
      //check every filed while the user type
      setContactToEdit((prev) => ({
        ...prev,
        [field]: value,
      }));
  
      setContactErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
  
        switch (field) {
          case "contactName":
            updatedErrors.contactName = value.trim()
              ? validateName(value)
                ? "" //if there is a name -> no error
                : "Only letters and spaces, up to 30 characters." //error
              : ""; // no text at all -> no error
            break;
          case "contactEmail":
            updatedErrors.contactEmail = value.trim()
              ? validateEmail(value)
                ? ""
                : "Enter a valid email address."
              : "";
            break;
          case "contactPhone":
            updatedErrors.contactPhone = value.trim()
              ? validatePhone(value)
                ? ""
                : "Enter a valid phone number (6-15 digits)."
              : "";
            break;
        }
  
        return updatedErrors;
      });
    };
  
    const validateContact = () => {
      //validate the full contact who will send to the server
      const { contactName, contactEmail, contactPhone } = contactToEdit;
      let updatedErrors = {};
  
      updatedErrors.contactName = contactName.trim()
        ? validateName(contactName)
          ? ""
          : "Only letters and spaces, up to 30 characters."
        : "Contact name is required";
  
      updatedErrors.contactEmail =
        contactEmail.trim() && !validateEmail(contactEmail)
          ? "Enter a valid email address."
          : "";
  
      updatedErrors.contactPhone =
        contactPhone.trim() && !validatePhone(contactPhone)
          ? "Enter a valid phone number (6-15 digits)."
          : "";
  
      setContactErrors(updatedErrors);
  
      const hasErrors = Object.values(updatedErrors).some(
        (error) => error !== ""
      );
      return !hasErrors;
    };
  
    const handleUpdateContact = async () => {
      if (!validateContact()) {
        //check if there is error with the inputs
        return;
      }
  
      try {
        const updatedContacts = application.contacts.map((contact) => {
          if (contact.contactID === contactToEdit.contactID) {
            return { ...contact, ...contactToEdit }; //return updated cotact
          }
          return contact;
        });
  
        setApplication((prev) => ({
          ...prev,
          contacts: updatedContacts,
        }));
  
        const API_URL = `${apiUrlStart}/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}/contacts/${contactToEdit.contactID}`;
  
        const response = await fetch(API_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactToEdit),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update contact");
        }
  
        setIsEditingContact(false);
        setContactToEdit(null);
        setContactModalVisible(false); // סגירת המודל אחרי עדכון מוצלח
      } catch (error) {
        console.error("Error updating contact:", error);
      }
    };
  
    const fetchLinkedFiles = useCallback(async () => {
      if (!User?.id || !applicationID) return;
  
      try {
        const API_URL =
          Platform.OS === "web"
            ? `${apiUrlStart}/api/Users/get-user-files?userId=${User.id}&applicationId=${applicationID}`
            : `${apiUrlStart}/api/Users/get-user-files?userId=${User.id}&applicationId=${applicationID}`;
  
        const response = await fetch(API_URL);
        const data = await response.json();
        setLinkedFiles(data);
      } catch (error) {
        console.error("⚠️ Error fetching linked files:", error);
      }
    }, [User?.id, applicationID]);
  
    useEffect(() => {
      fetchLinkedFiles();
    }, [fetchLinkedFiles]);
  
    const deleteContact = async (contactID) => {
      try {
        console.log("Attempting to delete contact with ID:", contactID);
        // עדכון ה-API URL עם ה-contactID שנשלח
        const API_URL = `${apiUrlStart}/api/JobSeekers/deleteContact/${Loggeduser.id}/applications/${applicationID}/contacts/${contactID}`;
  
        const response = await fetch(API_URL, {
          method: "DELETE",
        });
  
        console.log("Response status:", response.status);
  
        if (!response.ok) {
          throw new Error("Failed to delete contact");
        }
  
        // עדכון הסטייט של אנשי הקשר אחרי מחיקה
        setApplication((prevApp) => ({
          ...prevApp,
          contacts: prevApp.contacts.filter(
            (contact) => contact.contactID !== contactID
          ),
        }));
  
        // סגירת המודל אחרי מחיקה מוצלחת
        setContactModalVisible(false);
        setContactToEdit(null);
  
        showMessage("Contact deleted successfully!", "check-circle");
      } catch (error) {
        console.error("Error deleting contact:", error);
  
        showMessage("Failed to delete contact", "alert-circle");
      }
    };
  
    const addContact = async () => {
      if (!validateContact()) {
        return;
      }
  
      try {
        const newContact = {
          contactName: contactToEdit.contactName,
          contactEmail: contactToEdit.contactEmail,
          contactPhone: contactToEdit.contactPhone,
          contactNotes: contactToEdit.contactNotes,
        };
  
        const API_URL = `${apiUrlStart}/api/JobSeekers/${Loggeduser.id}/applications/${applicationID}/contacts`;
  
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newContact),
        });
  
        if (!response.ok) {
          throw new Error("Failed to add contact");
        }
  
        // get full answer from teh server
        const addedContact = await response.json();
        console.log("Added contact from server:", addedContact);
  
        // state update
        setApplication((prevApp) => {
          const updatedContacts = [...prevApp.contacts, addedContact];
          console.log("Updated contacts array:", updatedContacts);
          return {
            ...prevApp,
            contacts: updatedContacts,
          };
        });
  
        //close contact edit mode after all updated בהצלחה
        setIsEditingContact(false);
        setContactToEdit(null);
        setContactEditMode("edit");
        setContactModalVisible(false);
      } catch (error) {
        console.error("Error adding contact:", error);
      }
    };
  
    const uploadResumeFile = async (userId, file, applicationId = null) => {
      if (!file) {
        console.log("No file provided to uploadResumeFile.");
        return;
      }
  
      try {
        const formData = new FormData();
  
        if (Platform.OS === "web") {
          formData.append("file", file.file, file.name);
        } else {
          formData.append("file", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/pdf",
          });
        }
  
        formData.append("FileType", "Resume");
  
        let API_URL =
          Platform.OS === "web"
            ? `${apiUrlStart}/api/Users/upload-file?userId=${userId}`
            : `${apiUrlStart}/api/Users/upload-file?userId=${userId}`;
  
        if (applicationId) API_URL += `&applicationId=${applicationId}`;
  
        console.log(" Uploading to:", API_URL);
  
        const response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });
  
        const resultText = await response.text();
        console.log("📬 Upload response status:", response.status);
        console.log("📬 Upload response body:", resultText);
  
        if (!response.ok) throw new Error("Upload failed");
  
        const result = JSON.parse(resultText);
        return result.fileId;
      } catch (err) {
        console.error(" Upload error:", err);
        throw err;
      }
    };
  
    const attachExistingFileToApplication = async (applicationId, fileId) => {
      try {
        const API_URL =
          Platform.OS === "web"
            ? `${apiUrlStart}/api/Application/link-file-to-application`
            : `${apiUrlStart}/api/Application/link-file-to-application`;
  
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId, fileId }),
        });
  
        if (response.status === 208) {
          console.log("ℹ️ File already linked");
          return false;
        }
  
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Failed to link file to application");
        }
  
        console.log("📎 קובץ שויך בהצלחה");
        return true;
      } catch (err) {
        console.error("❌ שגיאה בשיוך קובץ קיים:", err);
        throw err;
      }
    };
  
    const unlinkFileFromApplication = async (fileId, fileName) => {
      setPopup({
        visible: true,
        message: `Are you sure you want to remove "${fileName}" from this application?`,
        icon: "alert-circle-outline",
        isConfirmation: true,
        onConfirm: async () => {
          try {
      
  
            const url = `${apiUrlStart}/api/Users/unlink-file-from-application?applicationId=${applicationID}&fileId=${fileId}`;
            const response = await fetch(url, { method: "DELETE" });
  
            const resultText = await response.text();
            console.log("Unlink response:", resultText);
  
            if (!response.ok) throw new Error(resultText);
  
            showMessage(
              `File "${fileName}" removed successfully.`,
              "check-circle"
            );
            await fetchLinkedFiles(); // רענון הרשימה
          } catch (error) {
            console.error("Error unlinking file:", error);
            showMessage(
              "Failed to remove file from application.",
              "alert-circle"
            );
          }
        },
        onOk: () => {}, // לא רלוונטי כאן
      });
    };
  
    /*const renderDisplayMode = () => (
      <ScrollView contentContainerStyle={styles.container}>
  
        {(Platform.OS === "ios" || Platform.OS === "android") && (
          <TouchableOpacity
            onPress={() => navigation.navigate("AllUserApplications")}
            style={{
              marginTop: 10,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 5,
            }}
          >
            <FontAwesome name="arrow-left" size={24} color="#9FF9D5" />
            <Text
              style={{
                marginLeft: 10,
                marginLeft: 10,
                fontSize: 16,
                color: "#003D5B",
                fontFamily: "Inter_400Regular",
              }}
            >
              All Applications
            </Text>
          </TouchableOpacity>
        )}
  
      
        <Text style={styles.header}>{application.title || "No Title"}</Text>
  
        <Text style={styles.company}>{application.companyName}</Text>
  
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.text}>{application.location}</Text>
  
        <Text style={styles.label}>Job Type:</Text>
        <Text style={styles.text}>{application.jobType}</Text>
  
        <Text style={styles.label}>Remote:</Text>
        <Text style={styles.text}>{application.isRemote ? "Yes" : "No"}</Text>
  
        <Text style={styles.label}>Hybrid:</Text>
        <Text style={styles.text}>{application.isHybrid ? "Yes" : "No"}</Text>
  
        <Text style={styles.label}>URL:</Text>
        <Text style={styles.text}>{application.url}</Text>
  
        <Text style={styles.label}>Company Summary:</Text>
        <Text style={styles.text}>{application.companySummary}</Text>
  
        <Text style={styles.label}>Job Description:</Text>
        <Text style={styles.text}>{application.jobDescription}</Text>
  
        <FileSelectorModal
          visible={showFileSelector}
          userId={User?.id}
          onFileSelect={async (fileOrObj) => {
            try {
              let fileId = null;
              let fileName = fileOrObj.name || fileOrObj.fileName;
  
              //  אם מדובר בקובץ חדש מהמכשיר
              if (fileOrObj?.uri) {
                // האם קיים כבר לפי שם קובץ בלבד
                const alreadyExists = linkedFiles.some(
                  (f) => f.fileName === fileName
                );
                if (alreadyExists) {
                  showMessage(
                    `הקובץ "${fileName}" כבר קיים ברשימה`,
                    "alert-circle"
                  );
                  return;
                }
  
                fileId = await uploadResumeFile(User.id, fileOrObj, null); // לא שולחים applicationID כאן
              } else {
                fileId = fileOrObj.fileIdFromDB;
  
                const alreadyLinked = linkedFiles.some(
                  (f) => f.fileID === fileId
                );
                if (alreadyLinked) {
                  showMessage("הקובץ כבר משויך למשרה", "alert-circle");
                  return;
                }
              }
  
              // שיוך בפועל
              await attachExistingFileToApplication(applicationID, fileId);
              await fetchLinkedFiles();
  
              setPopup({
                visible: true,
                message: `הקובץ "${fileName}" שויך למשרה בהצלחה`,
                icon: "check-circle",
              });
  
              //setResumeFile({ fileIdFromDB: fileId, fileName }); // אחיד
            } catch (error) {
              console.error(" שגיאה בשיוך הקובץ:", error);
              showMessage("אירעה שגיאה במהלך שיוך הקובץ", "alert-circle");
            } finally {
              setShowFileSelector(false);
            }
          }}
          onClose={() => setShowFileSelector(false)}
        />
  
        <View style={styles.notesBox}>
          <View style={styles.addIconButton}>
            <Icon name="note-add" size={30} color="#b9a7f2" />
            <Text style={styles.addText}>Notes</Text>
          </View>
          <Text style={styles.text}>{application.notes}</Text>
        </View>
  
        <View>
          {application.contacts.map((contact, index) => (
            <View key={contact.contactID || index} style={styles.contactRow}>
          
              <TouchableOpacity
                style={styles.contactIconButton}
                onPress={() => {
                  setContactToEdit(contact);
                  setContactModalVisible(true);
                }}
              >
                <Icon name="person" size={28} color="#b9a7f2" />
                <Text style={styles.contactName}>
                  {contact.contactName || "Contact"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
  
         
          <Modal
            visible={contactModalVisible && contactToEdit !== null}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              setContactModalVisible(false);
              setContactToEdit(null);
            }}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => {
                setContactModalVisible(false);
                setContactToEdit(null);
              }}
            >
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                <Text style={styles.modalHeader}>
                  {contactToEdit?.contactName || "Contact Details"}
                </Text>
  
                <View style={styles.contactDetailsModal}>
                  <Text style={styles.contactDetailItem}>
                    Email: {contactToEdit?.contactEmail || ""}
                  </Text>
                  <Text style={styles.contactDetailItem}>
                    Phone: {contactToEdit?.contactPhone || ""}
                  </Text>
                  <Text style={styles.contactDetailItem}>
                    Notes: {contactToEdit?.contactNotes || ""}
                  </Text>
  
                  <View style={styles.modalButtonsRow}>
                 
                    <Button
                      mode="contained"
                      onPress={() => {
                        setContactModalVisible(false);
                        setIsEditingContact(true);
                      }}
                      style={[styles.modalButton, { backgroundColor: "#d6cbff" }]}
                      //labelStyle={{ color: "#003D5B" }}
                      labelStyle={styles.buttonLabel}
                    >
                      Edit Contact
                    </Button>
  
                 
                    <Button
                      mode="contained"
                      onPress={() => {
                        console.log(
                          "Deleting contact with ID:",
                          contactToEdit.contactID
                        );
                        setContactModalVisible(false);
  
                        showConfirmation(
                          "Are you sure you want to delete this contact?",
                          () => deleteContact(contactToEdit.contactID),
                          "alert-circle"
                        );
                      }}
                      style={[styles.modalButton, { backgroundColor: "#d6cbff" }]}
                      labelStyle={styles.buttonLabel}
                    >
                      Delete
                    </Button>
                  </View>
  
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setContactModalVisible(false);
                      setContactToEdit(null);
                    }}
                    style={styles.modalCloseButton}
                    labelStyle={styles.cancelButtonLabel}
                  >
                    Close
                  </Button>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
  
          {linkedFiles.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>Attached Files:</Text>
  
              {linkedFiles.map((file, index) => (
                <TouchableOpacity
                  key={`${file.FileID || index}-${file.FileName}`}
                  style={styles.selectedFileContainer}
                  onPress={() => {
                    const fileUrl =
                      Platform.OS === "web"
                        ? `https://localhost:7137${file.filePath}`
                        : `http://192.168.30.157:7137${file.filePath}`;
                    Linking.openURL(fileUrl);
                  }}
                >
                  <FontAwesome name="file-text-o" size={20} color="#003D5B" />
                  <Text style={styles.selectedFileName}>{file.fileName}</Text>
  
                  <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() =>
                      unlinkFileFromApplication(file.fileID, file.fileName)
                    }
                  >
                    <FontAwesome name="trash" size={18} color="#9FF9D5" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
  
          <Button
            mode="outlined"
            onPress={() => setShowFileSelector(true)}
            style={styles.button}
          >
            Add File
          </Button>
  
          <Button
            mode="outlined"
            onPress={() => {
              setIsEditingContact(true);
              setContactEditMode("add");
              setContactToEdit({
                //crete contact obj
                contactName: "",
                contactEmail: "",
                contactPhone: "",
                contactNotes: "",
              });
            }}
            style={styles.button}
          >
            + Add Contact
          </Button>
        </View>
  
        <Button
          mode="outlined"
          onPress={() => {
            // save the current state before editing
            setOriginalApplication({ ...application });
            setIsEditing(true);
          }}
          style={styles.button}
        >
          Edit Application
        </Button>
  
        <Button
          mode="outlined"
          onPress={() => {
            showConfirmation(
              "Are you sure you want to delete this application?",
              handleDeleteApplication,
              "alert-circle"
            );
          }}
          style={styles.button}
        >
          Delete Application
        </Button>
      </ScrollView>
    );*/
  
    /*const renderEditMode = () => (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Edit Application</Text>
  
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Job Title
            </Text>
          }
          value={application.title}
          onChangeText={(text) => handleChange("title", text)}
          style={styles.input}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Company Name
            </Text>
          }
          value={application.companyName}
          onChangeText={(text) => handleChange("companyName", text)}
          style={styles.input}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Location
            </Text>
          }
          value={application.location}
          onChangeText={(text) => handleChange("location", text)}
          style={styles.input}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              URL
            </Text>
          }
          value={application.url}
          onChangeText={(text) => handleChange("url", text)}
          style={styles.input}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Company Summary
            </Text>
          }
          value={application.companySummary}
          onChangeText={(text) => handleChange("companySummary", text)}
          style={styles.input}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
          multiline={true}
          numberOfLines={3}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#BFB4FF"
        />
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Job Description
            </Text>
          }
          value={application.jobDescription}
          onChangeText={(text) => handleChange("jobDescription", text)}
          style={styles.input}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
          multiline={true}
          numberOfLines={3}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#BFB4FF"
        />
  
        <View style={styles.notesBox}>
          <View style={styles.addIconButton}>
            <Icon name="note-add" size={28} color="#b9a7f2" />
            <Text style={styles.addText}>Notes</Text>
          </View>
  
          <TextInput
            label={
              <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
                Notes
              </Text>
            }
            value={application.notes}
            onChangeText={(text) => handleChange("notes", text)}
            multiline
            style={styles.notesInput}
            textColor="#003D5B"
            fontFamily="Inter_400Regular"
            numberOfLines={3}
            mode="flat"
            outlineColor="#ccc"
            activeOutlineColor="#BFB4FF"
            dense
            theme={{ colors: { background: "#FFFFFF" } }}
          />
        </View>
  
        <TouchableOpacity
          onPress={() => setJobTypeModalVisible(true)}
          style={styles.dropdown}
        >
          <Text
            style={[
              styles.dropdownText,
              { color: application.JobType ? "#003D5B" : "#999" },
            ]}
          >
            {jobTypeList.find((j) => j.value === application.JobType)?.label ||
              "Select Job Type"}
          </Text>
        </TouchableOpacity>
  
        <Modal
          visible={jobTypeModalVisible}
          transparent={true}
          onRequestClose={() => setJobTypeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Job Type</Text>
  
              <ScrollView>
                {jobTypeList.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.modalItem}
                    onPress={() => {
                      handleChange("JobType", item.value);
                      setJobTypeModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
  
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setJobTypeModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Is Remote?</Text>
          <Switch
            value={application.isRemote}
            onValueChange={(val) => handleChange("isRemote", val)}
            color="#9FF9D5"
          />
        </View>
  
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Is Hybrid?</Text>
          <Switch
            value={application.isHybrid}
            onValueChange={(val) => handleChange("isHybrid", val)}
            color="#9FF9D5"
          />
        </View>
  
        <Button
          mode="contained"
          onPress={handleUpdate}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Save Changes
        </Button>
        <Button
          onPress={() => {
            // חזרת המצב המקורי
            setApplication({ ...originalApplication });
            setIsEditing(false);
          }}
          style={[styles.button, styles.cancelButton]}
          labelStyle={styles.cancelButtonLabel}
        >
          Cancel
        </Button>
      </ScrollView>
    );*/
  
    const renderContactEditMode = () => (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          {contactEditMode === "edit" ? "Edit Contact" : "Add New Contact"}
        </Text>
  
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Contact Name
            </Text>
          }
          value={contactToEdit.contactName}
          onChangeText={(text) => handleContactChange("contactName", text)}
          style={[
            styles.input,
            contactErrors.contactName ? styles.inputError : null,
          ]}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
        {contactErrors.contactName ? (
          <Text style={styles.errorText}>
            <FontAwesome name="exclamation-circle" size={12} color="#BFB4FF" />{" "}
            {contactErrors.contactName}
          </Text>
        ) : null}
  
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Contact Email
            </Text>
          }
          value={contactToEdit.contactEmail}
          onChangeText={(text) => handleContactChange("contactEmail", text)}
          style={[
            styles.input,
            contactErrors.contactEmail ? styles.inputError : null,
          ]}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
        {contactErrors.contactEmail ? (
          <Text style={styles.errorText}>
            <FontAwesome name="exclamation-circle" size={12} color="#BFB4FF" />{" "}
            {contactErrors.contactEmail}
          </Text>
        ) : null}
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Contact Phone
            </Text>
          }
          value={contactToEdit.contactPhone}
          onChangeText={(text) => handleContactChange("contactPhone", text)}
          style={[
            styles.input,
            contactErrors.contactPhone ? styles.inputError : null,
          ]}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
        {contactErrors.contactPhone ? (
          <Text style={styles.errorText}>
            <FontAwesome name="exclamation-circle" size={12} color="#BFB4FF" />{" "}
            {contactErrors.contactPhone}
          </Text>
        ) : null}
  
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_400Regular" }}>
              Contact Notes
            </Text>
          }
          value={contactToEdit.contactNotes}
          onChangeText={(text) => handleContactChange("contactNotes", text)}
          style={styles.input}
          textColor="#003D5B"
          fontFamily="Inter_400Regular"
        />
  
        <Button
          mode="contained"
          onPress={contactEditMode === "edit" ? handleUpdateContact : addContact}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          {contactEditMode === "edit" ? "Save Contact" : "Add Contact"}
        </Button>
        <Button
          onPress={() => {
            setIsEditingContact(false);
            setContactToEdit(null);
            setContactErrors({
              contactName: "",
              contactEmail: "",
              contactPhone: "",
            });
          }}
          style={[styles.button, styles.cancelButton]}
          labelStyle={styles.cancelButtonLabel}
        >
          Cancel
        </Button>
      </ScrollView>
    );
  
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {Platform.OS === "web" && <NavBar />} {/* Show NavBar only on web */}
        {isEditingContact ? (
          renderContactEditMode()
        ) : isEditing ? (
          <EditModeAppliction
            styles={styles}
            application={application}
            handleChange={handleChange}
            jobTypeList={jobTypeList}
            jobTypeModalVisible={jobTypeModalVisible}
            setJobTypeModalVisible={setJobTypeModalVisible}
            handleUpdate={handleUpdate}
            originalApplication={originalApplication}
            setApplication={setApplication}
            setIsEditing={setIsEditing}
          />
        ) : (
          <RenderDisplayModeApplication
            styles={styles}
            application={application}
            navigation={navigation}
            setIsEditing={setIsEditing}
            setShowFileSelector={setShowFileSelector}
            showFileSelector={showFileSelector}
            setPopup={setPopup}
            showMessage={showMessage}
            User={User}
            linkedFiles={linkedFiles}
            fetchLinkedFiles={fetchLinkedFiles}
            uploadResumeFile={uploadResumeFile}
            attachExistingFileToApplication={attachExistingFileToApplication}
            unlinkFileFromApplication={unlinkFileFromApplication}
            setContactModalVisible={setContactModalVisible}
            setContactToEdit={setContactToEdit}
            setIsEditingContact={setIsEditingContact}
            setContactEditMode={setContactEditMode}
            handleDeleteApplication={handleDeleteApplication}
            onRestoreSuccess={() => {
              setApplication((prev) => ({ ...prev, isArchived: false }));
            }}
          />
        )}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          Application updated successfully!
        </Snackbar>
        {popup.visible && (
          <View style={styles.popupOverlay}>
            <CustomPopup
              visible={popup.visible}
              onDismiss={() => {
                closePopup();
                if (!popup.isConfirmation) popup.onOk();
              }}
              icon={popup.icon}
              message={popup.message}
              isConfirmation={popup.isConfirmation}
              onConfirm={() => {
                closePopup();
                popup.onConfirm();
              }}
              onCancel={closePopup}
            />
          </View>
        )}
        {contactModalVisible && contactToEdit && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              setContactModalVisible(false);
              setContactToEdit(null);
            }}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => {
                setContactModalVisible(false);
                setContactToEdit(null);
              }}
            >
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                <Text style={styles.modalHeader}>
                  {contactToEdit.contactName || "Contact Details"}
                </Text>
  
                <View style={styles.contactDetailsModal}>
                  <Text style={styles.contactDetailItem}>
                    Email: {contactToEdit.contactEmail}
                  </Text>
                  <Text style={styles.contactDetailItem}>
                    Phone: {contactToEdit.contactPhone}
                  </Text>
                  <Text style={styles.contactDetailItem}>
                    Notes: {contactToEdit.contactNotes}
                  </Text>
  
                  <View style={styles.modalButtonsRow}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setContactModalVisible(false);
                        setIsEditingContact(true);
                      }}
                      style={[styles.modalButton, { backgroundColor: "#d6cbff" }]}
                      labelStyle={styles.buttonLabel}
                    >
                      Edit Contact
                    </Button>
  
                    <Button
                      mode="contained"
                      onPress={() => {
                        setContactModalVisible(false);
                        showConfirmation(
                          "Are you sure you want to delete this contact?",
                          () => deleteContact(contactToEdit.contactID),
                          "alert-circle"
                        );
                      }}
                      style={[styles.modalButton, { backgroundColor: "#d6cbff" }]}
                      labelStyle={styles.buttonLabel}
                    >
                      Delete
                    </Button>
                  </View>
  
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setContactModalVisible(false);
                      setContactToEdit(null);
                    }}
                    style={styles.modalCloseButton}
                    labelStyle={styles.cancelButtonLabel}
                  >
                    Close
                  </Button>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
        {Platform.OS !== "web" && (
          <TouchableOpacity
            style={styles.chatIcon}
            onPress={() => setShowChat(!showChat)}
          >
            <FontAwesome6 name="robot" size={24} color="#9FF9D5" />
          </TouchableOpacity>
        )}
        {showChat && (
          <View style={styles.overlay}>
            <View style={styles.chatModal}>
              <TouchableOpacity
                onPress={() => setShowChat(false)}
                style={{ alignSelf: "flex-end", padding: 5 }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>✖</Text>
              </TouchableOpacity>
              <GeminiChat />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }
  
  const styles = StyleSheet.create({
    chatIcon: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: "#fff",
      borderRadius: 30,
      padding: 12,
      zIndex: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    chatModal: {
      position: "absolute",
      bottom: 80,
      right: 10,
      width: "90%",
      height: 500,
      backgroundColor: "white",
      borderRadius: 10,
      padding: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    container: {
      padding: 20,
      backgroundColor: "white",
      position: Platform.OS === "web" ? "static" : "relative", //osition relative only for OS
    },
    header: {
      fontSize: 24,
      fontWeight: 900,
      marginBottom: 20,
      color: "#003D5B",
      fontFamily: "Inter_400Regular",
      textAlign: Platform.OS === "web" ? "left" : "center",
      marginTop: Platform.OS === "web" ? 0 : 20,
    },
    label: {
      fontWeight: 800,
      fontSize: 18,
      marginTop: 10,
      fontFamily: "Inter_400Regular",
      color: "#003D5B",
    },
    text: {
      marginBottom: 10,
      fontSize: 17,
      fontFamily: "Inter_300Light",
      color: "#003D5B",
    },
  
    button: {
      marginTop: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      borderColor: "#ccc",
      borderWidth: 1,
      marginLeft: 170,
      width: "50%",
      marginLeft:
        Platform.OS === "ios" || Platform.OS === "android" ? "25%" : 170,
    },
  
    cancelButton: {
      backgroundColor: "#rgba(243, 240, 240, 0.89)",
    },
    company: {
      fontSize: 22,
      fontWeight: 900,
      marginBottom: 10,
      color: "#003D5B",
      fontFamily: "Inter_300Light",
    },
  
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    toggleButton: {
      marginLeft: 10,
    },
  
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
  
    switchText: {
      fontFamily: "Inter_400Regular",
      color: "#003D5B",
      fontSize: 16,
    },
  
    notesBox: {
      position:
        Platform.OS === "ios" || Platform.OS === "android"
          ? "relative"
          : "absolute",
      top: Platform.OS === "ios" || Platform.OS === "android" ? 20 : 30,
      right: Platform.OS === "ios" || Platform.OS === "android" ? 5 : 10,
      left: Platform.OS === "ios" || Platform.OS === "android" ? 2 : undefined,
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#b9a7f2",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5, // for Android shadow
      width: "auto",
      minWidth: 200,
      maxWidth: 400,
      minHeight: 150,
      maxHeight: 350,
      marginTop: Platform.OS === "ios" || Platform.OS === "android" ? 20 : 0,
      marginBottom: Platform.OS === "ios" || Platform.OS === "android" ? 40 : 0,
    },
    addIconButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    addText: {
      marginLeft: 8,
      fontSize: 16,
      color: "#b9a7f2",
      fontFamily: "Inter_700Bold,",
    },
    notesText: {
      fontWeight: "bold",
      marginBottom: 10,
    },
  
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      margin: 15,
    },
    contactIconButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    contactName: {
      marginLeft: 10,
      fontSize: 20,
      fontFamily: "Inter_300Light",
      color: "#003D5B",
      fontWeight: 600,
    },
  
    buttonLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: "#003D5B",
    },
  
    cancelButtonLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: "#003D5B",
    },
  
    navBar: {
      position: "relative",
      marginTop: 20,
    },
  
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "white",
      width: "80%",
      maxWidth: 400,
      borderRadius: 10,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalHeader: {
      fontSize: 24,
      //fontWeight: "bold",
      marginBottom: 15,
      color: "#003D5B",
      textAlign: "center",
      fontFamily: "Inter_400Regular",
    },
    modalItemText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: "#003D5B",
      textAlign: "center",
      paddingVertical: 8,
    },
    contactDetailsModal: {
      width: "100%",
    },
    contactDetailItem: {
      fontSize: 18,
      marginBottom: 10,
      fontFamily: "Inter_400Regular",
      color: "#003D5B",
    },
  
    modalButtonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    modalButton: {
      width: "48%",
      fontFamily: "Inter_400Regular",
    },
    modalCloseButton: {
      marginTop: 15,
      width: "100%",
      borderColor: "#ccc",
    },
  
    popupOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor:
        Platform.OS === "web" ? "transparent" : "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
  
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 25,
      marginBottom: 10,
      color: "#2C3E50",
    },
    input: {
      marginBottom: 12,
      backgroundColor: "#fff",
    },
    dropdown: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 12,
      borderRadius: 6,
      marginBottom: 10,
      backgroundColor: "#fff",
    },
  
    dropdownText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      text: "#003D5B",
    },
    modalItem: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      justifyContent: "center",
      alignItems: "center",
      color: "#003D5B",
    },
  
    modalCancelButton: {
      marginTop: 15,
      paddingVertical: 12,
      backgroundColor: "#f5f5f5",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#ddd",
    },
  
    modalCancelButtonText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: "#BFB4FF",
      textAlign: "center",
    },
    overlay: {
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
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      marginTop: Platform.OS === "web" ? 0 : 20,
    },
    backButtonHeader: {
      marginRight: 15,
      paddingRight: 5,
    },
  
    resumeButton: {
      backgroundColor: "#BFB4FF",
      borderRadius: 4,
      paddingVertical: 12,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 30,
      marginBottom: 50,
    },
    resumeButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
  
    selectedFileContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 10,
      gap: 8,
    },
  
    selectedFileName: {
      fontSize: 14,
      color: "#003D5B",
      fontFamily: "Inter_400Regular",
    },
  });