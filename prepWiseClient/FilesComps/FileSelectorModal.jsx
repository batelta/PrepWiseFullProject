import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from "@expo-google-fonts/inter";
import {apiUrlStart} from '../api';

const FileSelectorModal = ({ visible, onClose, userId, onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
  });

///batel added for check in session page
  useEffect(() => {
  if (!visible) {
    setFiles([]); // reset when modal is closed
  }
}, [visible]);
//////
  useEffect(() => {
    //fatch files evry time that the modal visible
    if (visible) fetchFiles();
  }, [visible]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const baseUrl =`${apiUrlStart}`

      const response = await fetch(
        `${baseUrl}/api/Users/get-user-files?userId=${userId}`
      );
      const data = await response.json();
      setFiles(data); //set all the file that returned
    } catch (error) {
      console.error(" Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const pickResumeFile = async () => {
    //pick new file
    //before4 try to uploade many files
    if (Platform.OS === "web") {
      //if mobile will open file selector window
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx";

      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const isDuplicate = files.some((f) => f.fileName === file.name);
          if (isDuplicate) {
            alert(`הקובץ "${file.name}" כבר קיים ברשימה`);
            return;
          }

          const fileData = {
            uri: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
            file,
            fileName: file.name,
          };

          onFileSelect(fileData);
          onClose();
        }
      };
      input.click();
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        //if mobile we use DocumentPicker from expo
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],

        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        const isDuplicate = files.some((f) => f.fileName === result.name);
        if (isDuplicate) {
          //check if the file alredy
          alert(`הקובץ "${result.name}" כבר קיים ברשימה`); //will add pop up later
          return;
        }

        onFileSelect({
          ...result,
          fileName: result.name || "Unnamed File",
        });
        onClose();
      }
    }
  };

  /* const pickResumeFile = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx";
      input.multiple = true; // ✅ מאפשר ריבוי קבצים

      input.onchange = (event) => {
        const selectedFiles = Array.from(event.target.files).map((file) => ({
          uri: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          file,
        }));
        onFileSelect(selectedFiles); // ⬅️ שולח מערך
      };
      input.click();
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: true,
        copyToCacheDirectory: true,
      });

      console.log("Result from DocumentPicker:", result);

      if (result.type === "success") {
        onFileSelect([result]); // ⬅️ עטוף במערך
      }
    }
  };*/

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Choose File</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#BFB4FF" />
          ) : (
            <ScrollView>
              {files.map((file) => (
                <TouchableOpacity
                  key={file.fileID}
                  style={styles.modalItem}
                  onPress={() => {
                    onFileSelect({
                      fileIdFromDB: file.fileID,
                      fileName: file.fileName,
                      name: file.fileName, // לא חובה, אבל אם אתה משתמש בשם הזה – תשמור
                    });
                    onClose();
                  }}
                >
                  <Text style={styles.modalItemText}>{file.fileName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.modalItemAlt}
            onPress={pickResumeFile}
          >
            <Text style={styles.modalItemText}>Upload New File</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
            <Text style={styles.modalCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: "80%",
  },
  modalHeader: {
    fontSize: 24,
    marginBottom: 15,
    color: "#003D5B",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  modalItemAlt: {
    paddingVertical: 14,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 20,
  },
  modalItemText: {
    fontSize: 16,
    color: "#003D5B",
    fontFamily: "Inter_400Regular",
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 20,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: "#BFB4FF",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});

export default FileSelectorModal;