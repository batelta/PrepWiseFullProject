// components/MentorOfferForm.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Card, SegmentedButtons } from "react-native-paper";
import Slider from "@react-native-community/slider";
import CareerFieldMultiSelector from "../CareerFieldMultiSelector";
import DateTimePickerModal from "../DateTimePickerModal";

export default function MentorOfferForm({
  initialValues,
  onSubmit,
  mode = "create", // or "edit"
}) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [offerType, setOfferType] = useState(
    initialValues?.offerType || "Group"
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues?.durationMinutes || 60
  );
  const [isOnline, setIsOnline] = useState(initialValues?.isOnline ?? true);
  const [location, setLocation] = useState(initialValues?.location || "");
  const [meetingLink, setMeetingLink] = useState(
    initialValues?.meetingLink || ""
  );
  const [careerFieldIDs, setCareerFieldIDs] = useState(
    initialValues?.careerFieldIDs || []
  );
  const [dateTime, setDateTime] = useState(
    initialValues?.dateTime ? new Date(initialValues.dateTime) : null
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initialValues?.maxParticipants || 10
  );

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      offerType,
      durationMinutes,
      isOnline,
      location,
      meetingLink,
      careerFieldIDs,
      dateTime,
      maxParticipants,
    });
  };

  return (
    <Card style={{ margin: 20, padding: 16 }}>
      <Text style={styles.title}>
        {mode === "edit" ? "Edit Your Offer" : "Create A Meetup Offer ✨"}
      </Text>

      <Card.Content>
        {/* Topic */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputTitle}>Topic</Text>
          <TextInput
            style={styles.halfInput}
            value={title}
            onChangeText={setTitle}
            placeholder="What’s the topic of your upcoming meetup?"
            placeholderTextColor="#888"
          />
        </View>

        {/* Description */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputTitle}>Add Meetup Description</Text>
          <TextInput
            style={styles.halfInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a message"
            placeholderTextColor="#888"
          />
        </View>

        {/* Date & Time */}
        <Text style={styles.inputTitle}>Date & Time</Text>
        <DateTimePickerModal dateTime={dateTime} setDateTime={setDateTime} />

        {/* Duration */}
        <Text style={styles.inputTitle}>Duration (Minutes)</Text>
        <SegmentedButtons
          value={durationMinutes.toString()}
          onValueChange={(val) => setDurationMinutes(parseInt(val))}
          buttons={["30", "45", "60", "90"].map((val) => ({
            value: val,
            label: val,
            style: durationMinutes == val ? { backgroundColor: "#ece8e7" } : {},
          }))}
        />

        {/* Max Participants */}
        <Text style={styles.inputTitle}>Max Participants</Text>
        <Text style={styles.inputTitle}>{maxParticipants}</Text>
        <Slider
          style={{ width: 250, height: 40 }}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={maxParticipants}
          minimumTrackTintColor="#9FF9D5"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#9FF9D5"
          onValueChange={setMaxParticipants}
        />

        {/* Is it online */}
        <Text style={styles.inputTitle}>Is it an online Meetup?</Text>
        <SegmentedButtons
          value={isOnline ? "Online" : "In-person"}
          onValueChange={(val) => setIsOnline(val === "Online")}
          buttons={[
            {
              value: "Online",
              label: "Online",
              style: isOnline ? { backgroundColor: "#ece8e7" } : {},
            },
            {
              value: "In-person",
              label: "In-person",
              style: !isOnline ? { backgroundColor: "#ece8e7" } : {},
            },
          ]}
        />

        {/* Location */}
        {!isOnline && (
          <View style={styles.inputBlock}>
            <Text style={styles.inputTitle}>Location (Address)</Text>
            <TextInput
              style={styles.halfInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter Location"
              placeholderTextColor="#888"
            />
          </View>
        )}

        {/* Meeting Link */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputTitle}>Meeting Link (Optional)</Text>
          <TextInput
            style={styles.halfInput}
            value={meetingLink}
            onChangeText={setMeetingLink}
            placeholder="Enter meeting link (Zoom, Teams...)"
            placeholderTextColor="#888"
          />
        </View>

        {/* Career Fields */}
        <CareerFieldMultiSelector
          selectedFields={careerFieldIDs}
          setSelectedFields={setCareerFieldIDs}
        />

        {/* Submit */}
        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.loginText}>
            {mode === "edit" ? "SAVE CHANGES" : "CREATE OFFER"}
          </Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
}

const styles = {
  title: {
    fontSize: 20,
  //  fontWeight: "bold",
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  inputBlock: {
    width: "50%",
    marginBottom: 10,
  },
  inputTitle: {
    fontSize: 15,
    marginTop: 16,
    marginBottom: 6,
    fontFamily: "Inter_300Light",
  },
  halfInput: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 5,
    fontFamily: "Inter_200ExtraLight",
    fontSize: 13,
    height: 35,
  },
  loginButton: {
    backgroundColor: "#BFB4FF",
    padding: 12,
    borderRadius: 5,
    width: "70%",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  loginText: {
    color: "white",
    fontFamily: "Inter_400Regular",
  },
};