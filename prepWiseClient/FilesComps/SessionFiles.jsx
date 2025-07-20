// SessionFiles.js - Separate component
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Platform,Linking } from 'react-native';
import { FileUp, X, File } from 'lucide-react-native';
import FileSelectorModal from './FileSelectorModal'; // Your existing modal
import { Card ,RadioButton,TextInput,Appbar,Icon } from 'react-native-paper';

const SessionFiles = ({ 
  sessionId, 
  Loggeduser, 
  apiUrlStart, 
  appliedStyles,
  onFilesChange // Optional callback to notify parent of file changes
}) => {
  const [fileSelectorVisible, setFileSelectorVisible] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  // Fetch session files on component mount
  useEffect(() => {
    if (sessionId) {
      fetchSessionFiles();
    }
  }, [sessionId]);

  // Notify parent when files change (optional)
  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(attachedFiles);
    }
  }, [attachedFiles, onFilesChange]);

const handleViewFile = (file) => {
  if (!file.filePath) {
    Alert.alert("Error", "No file path available.");
    return;
  }

  const fullUrl = file.filePath.startsWith("http")
    ? file.filePath
    : `${apiUrlStart}/${file.filePath.replace(/^\/+/, "")}`; // avoid double slashes

  Linking.openURL(fullUrl)
    .catch(err => {
      console.error("Failed to open file:", err);
      Alert.alert("Error", "Failed to open the file.");
    });
};


  // Your existing handleFileSelect function with minor modifications
  const handleFileSelect = async (selectedFile) => {
  try {
    let fileId;

    if (selectedFile.file) {
      fileId = await uploadSessionFile(selectedFile, true);
    } else if (selectedFile.fileIdFromDB) {
      const res = await fetch(
        `${apiUrlStart}/api/Users/UploadSessionFile?sessionId=${sessionId}&saveToFileList=false`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileID: selectedFile.fileIdFromDB,
            fileName: selectedFile.fileName,
            filePath: selectedFile.filePath || "", // optional
            fileType: "Resume",
            userID: Loggeduser.id,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Link failed");
      fileId = result.FileID;
    }

    // ✅ This was missing for linked files
    setAttachedFiles((prev) => [
      ...prev,
      {
        fileID: fileId,
        fileName: selectedFile.fileName || selectedFile.name,
      },
    ]);
  } catch (err) {
    Alert.alert("Error", "Failed to attach file.");
  } finally {
    setFileSelectorVisible(false);
  }
};


  // Your existing uploadSessionFile function
  const uploadSessionFile = async (file, saveToProfile = true) => {
    try {
      const formData = new FormData();

      // Handle Web vs Mobile
      if (Platform.OS === "web") {
        formData.append("file", file.file, file.name);
      } else {
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/pdf",
        });
      }

      // Add details to query
      const uploadUrl = `${apiUrlStart}/api/Users/upload-file?userId=${Loggeduser.id}&sessionId=${sessionId}&saveToFileList=${saveToProfile}`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const resultText = await response.text();
      if (!response.ok) throw new Error(resultText);

      const result = JSON.parse(resultText);
      return result.fileId;
    } catch (err) {
      console.error("uploadSessionFile error:", err);
      throw err;
    }
  };
  // Function to fetch session files
  const fetchSessionFiles = async () => {
    try {
      const response = await fetch(
        `${apiUrlStart}/api/Users/GetSessionFiles?sessionId=${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to fetch files");

      setAttachedFiles(result.files || []);
    } catch (err) {
      console.error("Error fetching session files:", err);
      // Silently fail on fetch - don't show error to user unless they try to interact
    }
  };

  // Function to delete a file from session
  const deleteSessionFile = async (fileId) => {
            try {
              const response = await fetch(
                `${apiUrlStart}/api/Users/DeleteSessionFile?sessionId=${sessionId}&fileId=${fileId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              const result = await response.json();
              if (!response.ok) throw new Error(result.error || "Failed to delete file");

              // Remove from local state
              setAttachedFiles((prev) => prev.filter(file => file.fileID !== fileId));
              
              Alert.alert("Success", "File removed from session.");
            } catch (err) {
              console.error("Error deleting file:", err);
              Alert.alert("Error", "Failed to remove file from session.");
            }
          }
        
     
    
  

  return (
    <View>
      {/* Files Section Header */}
      <Text style={appliedStyles.subtitle}>Attach Files 📂</Text>
      <Text style={appliedStyles.subtitlesmall}>
        Want to share a resume, portfolio, or notes before the session? Upload here — you can always add more later.
      </Text>

      {/* Upload Card - Your existing design */}
      <Card style={{ 
        padding: 20, 
        alignItems: 'center', 
        borderStyle: 'dashed', 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 12,
        marginBottom: 15
      }}>
        <View style={{ alignSelf: 'center' }}>
          <FileUp size={32} color="#BFB4FF" />
        </View>
        <Text style={{ 
          marginTop: 10, 
          color: '#555', 
          fontWeight: '600', 
          textAlign: 'center' 
        }}>
          Upload a file
        </Text>
        <Text style={{ 
          fontSize: 12, 
          color: '#999', 
          textAlign: 'center' 
        }}>
          (PDF, Image, or Docs — optional)
        </Text>
        <TouchableOpacity
          style={appliedStyles.loginButton}
          onPress={() => setFileSelectorVisible(true)}
        >
          <Text style={appliedStyles.loginText}>Choose File</Text>
        </TouchableOpacity>

        {Loggeduser?.id && (
          <FileSelectorModal
            visible={fileSelectorVisible}
            onClose={() => setFileSelectorVisible(false)}
            userId={Loggeduser.id}
            onFileSelect={handleFileSelect}
          />
        )}
      </Card>

      {/* Attached Files List */}
      {attachedFiles.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={[appliedStyles.subtitle, { fontSize: 16, marginBottom: 10 }]}>
            Attached Files ({attachedFiles.length})
          </Text>
          <ScrollView style={{ maxHeight: 200 }}>
            {attachedFiles.map((file, index) => (
              <View 
                key={file.fileID || index} 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: '#e9ecef'
                }}
              >
                <File size={20} color="#6c757d" style={{ marginRight: 10 }} />
                <TouchableOpacity
                    onPress={() => handleViewFile(file)}
                    style={{ flex: 1 }}
                    >
                    <Text style={{
                        fontSize: 14,
                        color: '#5C5EE0', 
                        textDecorationLine: 'underline',
                        fontWeight: '500'
                    }}>
                        {file.fileName}
                    </Text>
                    </TouchableOpacity>

                {file.userID === Loggeduser.id && (
  <TouchableOpacity
    onPress={() => deleteSessionFile(file.fileID)}
    style={{
      padding: 6,
      borderRadius: 15,
      backgroundColor: '#ff6b6b',
      marginLeft: 10
    }}
  >
    <X size={14} color="white" />
  </TouchableOpacity>
)}

              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Empty State Message */}
      {attachedFiles.length === 0 && (
        <Text style={{
          textAlign: 'center',
          color: '#888',
          fontSize: 13,
          fontStyle: 'italic',
          marginTop: 5
        }}>
          No files attached yet
        </Text>
      )}
    </View>
  );
};

export default SessionFiles;