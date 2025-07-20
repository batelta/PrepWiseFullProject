import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Modal,
  Platform,
} from "react-native";
import { Button } from "react-native-paper";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Icon from "react-native-vector-icons/MaterialIcons";
import FileSelectorModal from "../FilesComps/FileSelectorModal";

const apiUrlStart ="http://localhost:5062"

export default function RenderDisplayModeApplication({
  styles,
  application,
  navigation,
  setIsEditing,
  setShowFileSelector,
  showFileSelector,
  setPopup,
  showMessage,
  User,
  linkedFiles,
  fetchLinkedFiles,
  uploadResumeFile,
  attachExistingFileToApplication,
  unlinkFileFromApplication,
  setContactModalVisible,
  setContactToEdit,
  setIsEditingContact,
  setContactEditMode,
  handleDeleteApplication,
  onRestoreSuccess,
})

{
  const handleUnarchive = async (applicationID) => {
    try {
      const API_URL =
        Platform.OS === "web"
          ? `${apiUrlStart}/api/JobSeekers/unarchiveById/${User.id}/${applicationID}`
          : `${apiUrlStart}/api/JobSeekers/unarchiveById/${User.id}/${applicationID}`;

      const response = await fetch(API_URL, { method: "PUT" });
      console.log("Unarchive response status:", response.status);

      if (response.status === 204 || response.status === 200) {
        showMessage("Application restored successfully!", "check-circle");

        try {
          onRestoreSuccess?.(); // עטוף גם את זה
        } catch (innerError) {
          console.error("Error in onRestoreSuccess:", innerError);
        }
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error restoring application:", error);
      showMessage("Failed to restore application", "alert-circle");
    }
  };

  return (
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
          <Text style={styles.text}>All Applications</Text>
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
      <Text style={styles.label}>Application Status:</Text>
      <Text style={styles.text}>{application.applicationStatus}</Text>

      <FileSelectorModal
        visible={showFileSelector}
        userId={User?.id}
        onFileSelect={async (fileOrObj) => {
          try {
            let fileId = null;
            let fileName = fileOrObj.name || fileOrObj.fileName;

            if (fileOrObj?.uri) {
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

              fileId = await uploadResumeFile(User.id, fileOrObj, null);
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

            await attachExistingFileToApplication(
              application.applicationID,
              fileId
            );
            await fetchLinkedFiles();

            setPopup({
              visible: true,
              message: `הקובץ "${fileName}" שויך למשרה בהצלחה`,
              icon: "check-circle",
            });
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
                    ? `${apiUrlStart}${file.filePath}`
                    : `${apiUrlStart}${file.filePath}`;
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

      <Button
        mode="outlined"
        onPress={() => {
          setIsEditing(true);
        }}
        style={styles.button}
      >
        Edit Application
      </Button>

      {/*<Button
        mode="outlined"
        onPress={() => {
          showMessage(
            "Move this application to the archive? You can restore it later.",
            "alert-circle",
            handleDeleteApplication
          );
        }}
        style={styles.button}
      >
        Move Application to Archive
      </Button>*/}

      {!application?.isArchived ? (
        <Button
          mode="outlined"
          onPress={() => {
            showMessage(
              "Move this application to the archive? You can restore it later",
              "alert-circle",
              handleDeleteApplication
            );
          }}
          style={styles.button}
          icon="archive"
        >
          Move Application to Archive
        </Button>
      ) : (
        <Button
          mode="outlined"
          onPress={() => {
            showMessage("Restore this application?", "refresh", () =>
              handleUnarchive(application.applicationID)
            );
          }}
          style={styles.button}
          icon="restore"
        >
          Restore Application
        </Button>
      )}
    </ScrollView>
  );
}