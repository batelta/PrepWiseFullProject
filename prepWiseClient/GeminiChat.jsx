import React, { useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { TextInput, Button, Card, Text, ActivityIndicator } from "react-native-paper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { KeyboardAvoidingView, Platform } from "react-native";

const API_KEY = "AIzaSyDtX7_UXPgZWz-nDuZFApKJvPk_AyV9-D4"; 

const GeminiChat = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    const newMessages = [...messages, { text: userInput, sender: "user" }];
    setMessages(newMessages);
    setUserInput("");

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
      const result = await model.generateContent(userInput);
      const generatedText = await result.response.text();

      setMessages([...newMessages, { text: generatedText, sender: "bot" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { text: "Error sending message", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 5, alignSelf: item.sender === "user" ? "flex-end" : "flex-start" }}>
      {item.sender === "bot" && <MaterialCommunityIcons name="robot" size={24} color="#003D5B" style={{ marginRight: 5 }} />}
      <Card>
        <Card.Content style={{
        backgroundColor: item.sender === "user" ? "#E0E0E0" : "#9FF9D5",
        padding: 10,
        borderRadius: 10,
        maxWidth: "90%", // made it wider
        minWidth: 80,     // prevents super narrow messages like just "hi"      
        }}>
        <Text style={{ flexShrink: 1 }}>{item.text}</Text>
        </Card.Content>
      </Card>
      {item.sender === "user" && <Ionicons name="person-circle-outline" size={24} color="#003D5B" style={{ marginLeft: 5 }} />}
    </View>
  );

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={250} // adjust this if needed
>
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      />
      {loading && <ActivityIndicator animating={true} style={{ marginBottom: 10 }} />}
      <View style={styles.inputContainer}>
        <TextInput
         mode="outlined"
          style={styles.textInput}
          placeholder="Message Gemini Chat"
          placeholderTextColor="gray"
          value={userInput}
          onChangeText={setUserInput}
          activeOutlineColor="#BFB4FF"
          outlineColor="white"
          />
        <Button mode="contained" onPress={sendMessage} disabled={loading}>
        <AntDesign name="upcircleo" size={20} color="black" />
        </Button>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default GeminiChat;
