import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Snackbar,
  Text,
  SegmentedButtons,
  Switch,
  ActivityIndicator,
} from "react-native-paper";
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from "@expo-google-fonts/inter";
import GeminiChat from "../GeminiChat";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import NavBar from "../NavBar";

import { useContext } from "react";
import { UserContext } from "../UserContext";
import FileSelectorModal from "../FilesComps/FileSelectorModal";
import CustomPopup from "../CustomPopup";
import StatusPickerModal from "./StatusPickerModal";


  export default function AddApplication({ onSuccess }) {
    const { Loggeduser } = useContext(UserContext);
    const [userID, setUserID] = useState(null);
    const apiUrlStart ="http://localhost:5062"

    useEffect(() => {
      if (Loggeduser) {
        setUserID(Loggeduser.id);
        console.log(Loggeduser);
      }
    }, [Loggeduser]);
  
    const [fontsLoaded] = useFonts({
      Inter_400Regular,
      Inter_700Bold,
      Inter_100Thin,
      Inter_200ExtraLight,
      Inter_300Light,
    });
    const navigation = useNavigation();
  
    const [application, setApplication] = useState({
      Title: "",
      CompanyName: "",
      Location: "",
      Url: "",
      CompanySummary: "",
      JobDescription: "",
      Notes: "",
      JobType: "",
      IsHybrid: false,
      IsRemote: false,
      Contacts: [],
      ApplicationStatus: "",
    });
  
    const [hasContact, setHasContact] = useState(false);
    const [contact, setContact] = useState({
      ContactName: "",
      ContactEmail: "",
      ContactPhone: "",
      ContactNotes: "",
    });
  
    //  סטייט לשגיאות
    const [contactErrors, setContactErrors] = useState({
      ContactName: "",
      ContactEmail: "",
      ContactPhone: "",
    });
  
    const [jobTypeModalVisible, setJobTypeModalVisible] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [titleError, setTitleError] = useState(false);
    const [mode, setMode] = useState("url");
    const [imported, setImported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  
    const [showChat, setShowChat] = useState(false);
  
    const [statusModalVisible, setStatusModalVisible] = useState(false);
  
    const jobTypeList = [
      { label: "Full Time", value: "FullTime" },
      { label: "Part Time", value: "PartTime" },
      { label: "Internship", value: "Internship" },
      { label: "Freelance", value: "Freelance" },
      { label: "Temporary", value: "Temporary" },
      { label: "Student", value: "Student" },
    ];
  
    const [resumeFile, setResumeFile] = useState(null);
    const [showFileSelector, setShowFileSelector] = useState(false);
  
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
  
    const [applicationStatus, setApplicationStatus] = useState("");
  
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
  
        console.log("🌐 Uploading to:", API_URL);
  
        const response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });
  
        const resultText = await response.text();
        console.log("Upload response status:", response.status);
        console.log("Upload response body:", resultText);
  
        if (!response.ok) throw new Error("Upload failed");
  
        const result = JSON.parse(resultText);
        return result.fileId;
      } catch (err) {
        console.error(" Upload error:", err);
        throw err;
      }
    };
  
    const validateName = (name) => /^[A-Za-z\s]{1,30}$/.test(name);
    const validateEmail = (email) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const validatePhone = (phone) => /^[0-9+\-\s]{6,15}$/.test(phone);
  
    const validateContact = () => {
      const { ContactName, ContactEmail, ContactPhone } = contact;
      let updatedErrors = {};
  
      updatedErrors.ContactName = ContactName.trim()
        ? validateName(ContactName)
          ? ""
          : "Only letters and spaces, up to 30 characters."
        : "";
  
      updatedErrors.ContactEmail =
        ContactEmail.trim() && !validateEmail(ContactEmail)
          ? "Enter a valid email address."
          : "";
  
      updatedErrors.ContactPhone =
        ContactPhone.trim() && !validatePhone(ContactPhone)
          ? "Enter a valid phone number (6-15 digits)."
          : "";
  
      setContactErrors(updatedErrors);
  
      const hasErrors = Object.values(updatedErrors).some(
        //check if there is at least 1 error -> if is, false, else truo
        (error) => error !== ""
      );
      return !hasErrors;
    };
  
    const handleAppChange = (field, value) => {
      setApplication((prevApp) => ({ ...prevApp, [field]: value }));
    };
  
    const handleContactChange = (field, value) => {
      setContact((prevContact) => ({ ...prevContact, [field]: value }));
  
      setContactErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
  
        switch (field) {
          case "ContactName":
            updatedErrors.ContactName = value.trim()
              ? validateName(value)
                ? ""
                : "Only letters and spaces, up to 30 characters."
              : "";
            break;
          case "ContactEmail":
            updatedErrors.ContactEmail = value.trim()
              ? validateEmail(value)
                ? ""
                : "Enter a valid email address."
              : "";
            break;
          case "ContactPhone":
            updatedErrors.ContactPhone = value.trim()
              ? validatePhone(value)
                ? ""
                : "Enter a valid phone number (6-15 digits)."
              : "";
            break;
        }
  
        return updatedErrors;
      });
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
  
        const result = await response.json();
        console.log(" קובץ קיים שויך בהצלחה:", result);
      } catch (err) {
        console.error("שגיאה בשיוך קובץ קיים:", err);
      }
    };
  
    const addNewApplication = async () => {
      if (!application.Title.trim()) {
        setTitleError(true);
        return;
      }
  
      if (hasContact && !validateContact()) {
        alert("Please fix contact info");
        return;
      }
  
      setIsLoading(true);
  
      try {
        const API_URL =
          Platform.OS === "web"
            ? `${apiUrlStart}/api/JobSeekers/${userID}/applications`
            : `${apiUrlStart}/api/JobSeekers/${userID}/applications`;
  
        const appToSend = {
          ...application,
          Contacts: hasContact ? [contact] : [],
        };
  
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appToSend),
        });
  
        const resultText = await response.text();
        const result = JSON.parse(resultText);
  
        //const result = await response.json();
        console.log(" Application response:", result);
  
        const applicationId = result.applicationID;
  
        if (!response.ok || !applicationId)
          throw new Error("Failed to create application");
  
        if (resumeFile) {
          if (resumeFile.fileIdFromDB) {
            //  המשתמש בחר קובץ קיים שכבר נמצא בשרת (בחר מתוך הרשימה)
            await attachExistingFileToApplication(
              applicationId,
              resumeFile.fileIdFromDB
            );
          } else {
            //  המשתמש העלה קובץ חדש מהמכשיר שלו
            await uploadResumeFile(userID, resumeFile, applicationId);
          }
        }
  
        setShowSnackbar(true);
        setTimeout(() => {
          if (Platform.OS === "web") {
            onSuccess?.();
          } else {
            navigation.navigate("AllUserApplications");
          }
        }, 1700);
      } catch (err) {
        console.error(" Error submitting:", err);
        alert("Failed to create application");
      } finally {
        setIsLoading(false);
      }
    };
  
    const importFromUrl = async () => {
      if (!application.Url.trim()) {
        alert("Please enter a valid job URL.");
        return;
      }
      setIsLoading(true); // ה מפעיל את מצב הטעינה
  
      try {
        const API_URL =
          `${apiUrlStart}/api/Application/fetch-job`;
  
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ URL: application.Url }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch job data");
        }
  
        const data = await response.json();
        console.log(" Gemini Result:", data);
  
        setApplication((prev) => ({
          ...prev,
          Title: data.title || prev.Title,
          CompanyName: data.companyName || prev.CompanyName,
          CompanySummary: data.companySummary || prev.CompanySummary,
          JobDescription: data.jobDescription || prev.JobDescription,
        }));
  
        setImported(true);
        setShowSnackbar(true);
  
        setIsLoading(false);
      } catch (error) {
        //console.error(" Error importing job data:", error);
        alert("Failed to import job details. Please try again.");
        setIsLoading(false);
      }
    };
  
    const renderUrlForm = () => (
      //auto fill application
      <>
        <TextInput
          label={
            <Text style={{ color: "#003D5B", fontFamily: "Inter_700Bold" }}>
              Enter Job URL
            </Text>
          }
          value={application.Url}
          onChangeText={(text) => handleAppChange("Url", text)}
          style={styles.input}
          disabled={isLoading}
          placeholder="https://example.com/job/..."
          fontFamily="Inter_400Regular"
        />
  
        <Button
          mode="outlined"
          onPress={importFromUrl}
          icon={isLoading ? null : "download"} // ה מסתיר את האייקון בזמן טעינה
          style={{ marginBottom: 20 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} color="#BFB4FF" size="small" />
              <Text style={styles.loadingText}>Importing job details...</Text>
            </View>
          ) : (
            "Import Job Details"
          )}
        </Button>
      </>
    );
  
    const renderManualForm = () => (
      <>
        <TextInput
          label="Application Title"
          value={application.Title}
          onChangeText={(text) => {
            handleAppChange("Title", text);
            if (text.trim()) setTitleError(false);
          }}
          style={styles.input}
          disabled={isLoading}
          fontFamily="Inter_400Regular"
        />
        {titleError && <Text style={styles.errorText}>Title is required</Text>}
  
        <TextInput
          label="Company Name"
          value={application.CompanyName}
          onChangeText={(text) => handleAppChange("CompanyName", text)}
          style={styles.input}
          disabled={isLoading}
          fontFamily="Inter_400Regular"
        />
        <TextInput
          label="Location"
          value={application.Location}
          onChangeText={(text) => handleAppChange("Location", text)}
          style={styles.input}
          disabled={isLoading}
          fontFamily="Inter_400Regular"
        />
        <TextInput
          label="Company Summary"
          value={application.CompanySummary}
          onChangeText={(text) => handleAppChange("CompanySummary", text)}
          style={styles.input}
          disabled={isLoading}
          fontFamily="Inter_400Regular"
          multiline={true}
          numberOfLines={3}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#BFB4FF"
        />
        <TextInput
          label="Job Description"
          value={application.JobDescription}
          onChangeText={(text) => handleAppChange("JobDescription", text)}
          style={styles.input}
          disabled={isLoading}
          fontFamily="Inter_400Regular"
          multiline={true}
          numberOfLines={3}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#BFB4FF"
        />
        <TextInput
          label="Notes"
          value={application.Notes}
          onChangeText={(text) => handleAppChange("Notes", text)}
          style={styles.input}
          disabled={isLoading}
          fontFamily="Inter_400Regular"
          multiline={true}
          numberOfLines={3}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#BFB4FF"
        />
      </>
    );
  
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            Platform.OS === "web" && { paddingTop: 90 },
          ]}
        >
          {/* btn go back*/}
          {(Platform.OS === "ios" || Platform.OS === "android") && (
            <TouchableOpacity
              onPress={() => navigation.navigate("AllUserApplications")}
              style={{
                marginTop: 10,
                marginBottom: 25,
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 5,
              }}
            >
              <FontAwesome name="arrow-left" size={24} color="#9FF9D5" />
              <Text
                style={{
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
          <Text style={styles.header}>Add New Application</Text>
          <SegmentedButtons //מאפשר את הבחירה בין המצבים של מילוי אוטומטי וידני
            value={mode}
            onValueChange={setMode}
            buttons={[
              { value: "url", label: "Paste Job URL", icon: "link" },
              {
                value: "manual",
                label: "Manualy Job Application",
                icon: "file-document-edit",
              },
            ]}
            style={{ marginBottom: 20 }}
            disabled={isLoading}
          />
          {mode === "url" && renderUrlForm()}{" "}
          {/*If the user choose url -> renderUrlForm*/}
          {mode === "url" && imported && renderManualForm()}
          {/*If the user choose url and paste -> renderManualForm*/}
          {mode === "manual" && renderManualForm()}
          {/*If the user choose manual  -> renderManualForm*/}
          <TouchableOpacity
            onPress={() => setJobTypeModalVisible(true)}
            style={styles.dropdown}
          >
            <Text style={{ color: application.JobType ? "#003D5B" : "#999" }}>
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
                {/* job type modal title*/}
                <Text style={styles.modalHeader}>Select Job Type</Text>
  
                {/*options*/}
                <ScrollView>
                  {jobTypeList.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.modalItem}
                      onPress={() => {
                        handleAppChange("JobType", item.value);
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
          <TouchableOpacity
            onPress={() => setStatusModalVisible(true)}
            style={styles.dropdown}
          >
            <Text
              style={[
                styles.dropdownText,
                { color: application.ApplicationStatus ? "#003D5B" : "#999" },
              ]}
            >
              {application.ApplicationStatus || "Select Application Status"}
            </Text>
  
            <StatusPickerModal
              visible={statusModalVisible}
              onClose={() => setStatusModalVisible(false)}
              onSelect={(value) => handleAppChange("ApplicationStatus", value)}
              selectedValue={application.ApplicationStatus}
            />
          </TouchableOpacity>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Is Hybrid?</Text>
            <Switch
              value={application.IsHybrid}
              onValueChange={(val) => handleAppChange("IsHybrid", val)}
              color="#9FF9D5"
              disabled={isLoading}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Is Remote?</Text>
            <Switch
              value={application.IsRemote}
              onValueChange={(val) => handleAppChange("IsRemote", val)}
              color="#9FF9D5"
              disabled={isLoading}
            />
          </View>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => setShowFileSelector(true)}
          >
            <Text style={styles.resumeButtonText}>Add File</Text>
          </TouchableOpacity>
          <FileSelectorModal
            visible={showFileSelector}
            userId={userID}
            onFileSelect={(fileOrObj) => {
              const selectedFileName = fileOrObj?.fileName || fileOrObj?.name;
              const selectedFileId = fileOrObj?.fileIdFromDB;
  
              const isDuplicate =
                resumeFile &&
                (resumeFile.fileName === selectedFileName ||
                  resumeFile.fileIdFromDB === selectedFileId);
  
              if (isDuplicate) {
                setPopupMessage(`הקובץ "${selectedFileName}" כבר נבחר`);
                setPopupVisible(true);
                return; // מונע את המשך הקוד במקרה של כפילות
              }
  
              // ✅ ממשיכים רק אם לא כפול
              if (fileOrObj?.uri) {
                setResumeFile(fileOrObj);
                setPopupMessage(`קובץ "${fileOrObj.fileName}" נוסף מהמכשיר`);
              } else {
                setResumeFile({
                  fileIdFromDB: fileOrObj.fileIdFromDB,
                  fileName: fileOrObj.fileName,
                });
                setPopupMessage(`הקובץ "${fileOrObj.fileName}" נבחר מהרשימה`);
              }
  
              setPopupVisible(true);
            }}
            onClose={() => setShowFileSelector(false)}
          />
          {resumeFile && (
            <View style={styles.selectedFileContainer}>
              <FontAwesome name="file-text-o" size={20} color="#003D5B" />
              <Text style={styles.selectedFileName}>
                {resumeFile.name || resumeFile.fileName || "Selected File"}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text>Do you have a contact person?</Text>
            <Switch
              value={hasContact}
              onValueChange={setHasContact}
              color="#9FF9D5"
              disabled={isLoading}
            />
          </View>
          {hasContact && (
            <View style={styles.contactBox}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
  
              <TextInput
                label="Contact Name"
                value={contact.ContactName}
                onChangeText={(text) => handleContactChange("ContactName", text)}
                style={[
                  styles.input,
                  contactErrors.ContactName ? styles.inputError : null,
                ]}
                disabled={isLoading}
                fontFamily="Inter_400Regular"
              />
  
              {contactErrors.ContactName ? (
                <Text style={styles.errorText}>
                  <FontAwesome
                    name="exclamation-circle"
                    size={12}
                    color="#BFB4FF"
                  />{" "}
                  {contactErrors.ContactName}
                </Text>
              ) : null}
  
              <TextInput
                label="Contact Email"
                value={contact.ContactEmail}
                onChangeText={(text) => handleContactChange("ContactEmail", text)}
                keyboardType="email-address"
                style={[
                  styles.input,
                  contactErrors.ContactEmail ? styles.inputError : null,
                ]}
                disabled={isLoading}
                fontFamily="Inter_400Regular"
              />
              {contactErrors.ContactEmail ? (
                <Text style={styles.errorText}>
                  <FontAwesome
                    name="exclamation-circle"
                    size={12}
                    color="#BFB4FF"
                  />{" "}
                  {contactErrors.ContactEmail}
                </Text>
              ) : null}
  
              <TextInput
                label="Contact Phone"
                value={contact.ContactPhone}
                onChangeText={(text) => handleContactChange("ContactPhone", text)}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  contactErrors.ContactPhone ? styles.inputError : null,
                ]}
                disabled={isLoading}
                fontFamily="Inter_400Regular"
              />
              {contactErrors.ContactPhone ? (
                <Text style={styles.errorText}>
                  <FontAwesome
                    name="exclamation-circle"
                    size={12}
                    color="#BFB4FF"
                  />{" "}
                  {contactErrors.ContactPhone}
                </Text>
              ) : null}
  
              <TextInput
                label="Contact Notes"
                value={contact.ContactNotes}
                onChangeText={(text) => handleContactChange("ContactNotes", text)}
                multiline
                style={styles.input}
                disabled={isLoading}
                fontFamily="Inter_400Regular"
              />
            </View>
          )}
          <Button
            mode="contained"
            onPress={addNewApplication}
            style={{ marginTop: 30, marginBottom: 50 }}
            icon={isLoading ? null : "check"}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} color="#fff" size="small" />
                <Text style={[styles.loadingText, { color: "#fff" }]}>
                  Submitting...
                </Text>
              </View>
            ) : (
              "Submit Application"
            )}
          </Button>
          <Snackbar
            visible={showSnackbar}
            onDismiss={() => setShowSnackbar(false)}
            duration={3000}
          >
            Application details imported successfully!
          </Snackbar>
        </ScrollView>
        <CustomPopup
          visible={popupVisible}
          onDismiss={() => setPopupVisible(false)}
          icon="check-circle-outline"
          message={popupMessage}
        />
        {/*chat item */}
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
        <NavBar />
      </KeyboardAvoidingView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: "white",
      paddingBottom: 100,
    },
    header: {
      marginBottom: 35,
      fontSize: 25,
      fontWeight: 900,
      color: "#003D5B",
      fontFamily: "Inter_400Regular",
    },
    sectionTitle: {
      fontSize: 18,
      marginTop: 25,
      marginBottom: 10,
      color: "#003D5B",
      fontWeight: 700,
      fontFamily: "Inter_400Regular",
    },
    input: {
      marginBottom: 12,
      backgroundColor: "#fff",
    },
    errorText: {
      color: "red",
      marginBottom: 10,
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
    modalItemText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: "#003D5B",
      textAlign: "center",
      paddingVertical: 8,
    },
  
    modalCancelButton: {
      marginTop: 15,
      paddingVertical: 12,
      backgroundColor: "#f5f5f5",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    modalHeader: {
      fontSize: 24,
      marginBottom: 15,
      color: "#003D5B",
      textAlign: "center",
      fontFamily: "Inter_400Regular",
    },
  
    modalCancelButtonText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: "#BFB4FF",
      textAlign: "center",
    },
  
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 15,
    },
    switchText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
    },
  
    divider: {
      borderBottomColor: "#ccc",
      borderBottomWidth: 1,
      marginVertical: 25,
    },
    contactBox: {
      backgroundColor: "rgba(252, 248, 248, 0.91)",
      padding: 15,
      borderRadius: 8,
    },
  
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "white",
      width: "80%",
      borderRadius: 8,
      paddingVertical: 10,
    },
  
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 14,
      color: "rgba(0,0,0,0.4)",
    },
    chatIcon: {
      position: "absolute",
      bottom: 20,
      right: 20,
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
      marginBottom: 60,
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
  
    errorText: {
      color: "#BFB4FF",
      fontSize: 12,
      marginTop: -8,
      marginBottom: 10,
      marginLeft: 5,
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

