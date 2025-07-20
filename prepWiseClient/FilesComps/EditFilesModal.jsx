import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CustomPopup from "../CustomPopup";
import * as DocumentPicker from "expo-document-picker";
import {apiUrlStart} from '../api';

const EditFilesModal = ({ visible, onClose, userId }) => {
  const [files, setFiles] = useState([]);

  const [popup, setPopup] = useState({
    visible: false,
    message: "",
    fileId: null,
    fileName: "",
  });

  const fetchFiles = async () => {
    if (!userId) return;
    try {
      const url =
        Platform.OS === "web"
          ? `${apiUrlStart}/api/Users/get-user-files?userId=${userId}`
          : `${apiUrlStart}/api/Users/get-user-files?userId=${userId}`;

      const response = await fetch(url);
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    if (visible) fetchFiles();
  }, [visible]);

  const openFile = (filePath) => {
    const baseUrl =`${apiUrlStart}`;

    const fullUrl = `${baseUrl}${filePath}`;
    Linking.openURL(encodeURI(fullUrl)).catch(() =>
      Alert.alert("Error", "Failed to open file.")
    );
  };

  const askDelete = (fileId, fileName) => {
    setPopup({
      visible: true,
      message: `Are you sure you want to delete "${fileName}"?\nThis will remove it from all linked applications.`,
      fileId,
      fileName,
    });
  };

  const confirmDelete = async () => {
    try {
      const url = `${apiUrlStart}/api/Users/delete-user-file?userId=${userId}&fileId=${popup.fileId}`;
      const response = await fetch(url, { method: "DELETE" });

      const text = await response.text();
      console.log("Response:", text);

      if (!response.ok) throw new Error(text);

      await fetchFiles();
      setPopup({ ...popup, visible: false });
    } catch (err) {
      console.error("Delete failed:", err.message);
      Alert.alert("Error", "Failed to delete file.");
      setPopup({ ...popup, visible: false });
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

      console.log("🌐 Uploading to:", API_URL);

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

  const pickResumeFile = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx";
      input.onchange = async (event) => {
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

          await uploadResumeFile(userId, fileData);
          await fetchFiles();
        }
      };
      input.click();
    } else {
      const result = await DocumentPicker.getDocumentAsync({
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
          alert(`הקובץ "${result.name}" כבר קיים ברשימה`);
          return;
        }

        await uploadResumeFile(userId, {
          ...result,
          fileName: result.name || "Unnamed File",
        });
        await fetchFiles(); // לרענון
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Manage Files</Text>

          <ScrollView>
            {files.length > 0 ? (
              files.map((file) => (
                <View key={file.fileID} style={styles.fileRow}>
                  <Text style={styles.fileName}>{file.fileName}</Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openFile(file.filePath)}
                    >
                      <FontAwesome
                        name="folder-open"
                        size={16}
                        color="#003D5B"
                      />
                      <Text style={styles.buttonText}>Open</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { marginLeft: 10 }]}
                      onPress={() => askDelete(file.fileID, file.fileName)}
                    >
                      <FontAwesome name="trash" size={16} color="#9FF9D5" />
                      <Text style={[styles.buttonText, { color: "#9FF9D5" }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: "center", color: "#999" }}>
                No files found.
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={pickResumeFile}>
            <Text style={styles.closeButtonText}>Upload New File</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {popup.visible && (
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <CustomPopup
            visible={popup.visible}
            message={popup.message}
            isConfirmation={true}
            icon="alert-circle-outline"
            onConfirm={confirmDelete}
            onCancel={() => setPopup({ ...popup, visible: false })}
          />
        </View>
      )}
    </Modal>
  );
};

export default EditFilesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#003D5B",
    marginBottom: 15,
    textAlign: "center",
  },
  fileRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  fileName: {
    fontSize: 16,
    color: "#003D5B",
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  buttonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#003D5B",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#003D5B",
    fontWeight: "600",
  },
});