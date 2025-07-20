// EditModeApplication.js
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Platform,
  } from "react-native";
  import { TextInput, Button, Switch } from "react-native-paper";
  import Icon from "react-native-vector-icons/MaterialIcons";
  import StatusPickerModal from "./StatusPickerModal";
  import React, { useState } from "react";
  
  export default function EditModeApplication({
    styles,
    application,
    handleChange,
    jobTypeList,
    jobTypeModalVisible,
    setJobTypeModalVisible,
    handleUpdate,
    originalApplication,
    setApplication,
    setIsEditing,
  }) {
    const [statusModalVisible, setStatusModalVisible] = useState(false);
  
    console.log("EditModeApplication loaded ✅");
    return (
      <ScrollView contentContainerStyle={styles.container}>
        ד<Text style={styles.header}>Edit Application</Text>
        <TextInput
          label={<Text style={{ color: "#003D5B" }}>Job Title</Text>}
          value={application.title}
          onChangeText={(text) => handleChange("title", text)}
          style={styles.input}
          textColor="#003D5B"
        />
        <TextInput
          label={<Text style={{ color: "#003D5B" }}>Company Name</Text>}
          value={application.companyName}
          onChangeText={(text) => handleChange("companyName", text)}
          style={styles.input}
          textColor="#003D5B"
        />
        <TextInput
          label={<Text style={{ color: "#003D5B" }}>Location</Text>}
          value={application.location}
          onChangeText={(text) => handleChange("location", text)}
          style={styles.input}
          textColor="#003D5B"
        />
        <TextInput
          label={<Text style={{ color: "#003D5B" }}>URL</Text>}
          value={application.url}
          onChangeText={(text) => handleChange("url", text)}
          style={styles.input}
          textColor="#003D5B"
        />
        <TextInput
          label={<Text style={{ color: "#003D5B" }}>Company Summary</Text>}
          value={application.companySummary}
          onChangeText={(text) => handleChange("companySummary", text)}
          style={styles.input}
          textColor="#003D5B"
          multiline
          numberOfLines={3}
        />
        <TextInput
          label={<Text style={{ color: "#003D5B" }}>Job Description</Text>}
          value={application.jobDescription}
          onChangeText={(text) => handleChange("jobDescription", text)}
          style={styles.input}
          textColor="#003D5B"
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          onPress={() => setStatusModalVisible(true)}
          style={styles.dropdown}
        >
          <Text
            style={[
              styles.dropdownText,
              { color: application.applicationStatus ? "#003D5B" : "#999" },
            ]}
          >
            {application.applicationStatus || "Select Application Status"}
          </Text>
        </TouchableOpacity>
        <StatusPickerModal
          visible={statusModalVisible}
          onClose={() => setStatusModalVisible(false)}
          onSelect={(value) => handleChange("applicationStatus", value)}
          selectedValue={application.applicationStatus}
        />
        <View style={styles.notesBox}>
          <View style={styles.addIconButton}>
            <Icon name="note-add" size={28} color="#b9a7f2" />
            <Text style={styles.addText}>Notes</Text>
          </View>
          <TextInput
            label={<Text style={{ color: "#003D5B" }}>Notes</Text>}
            value={application.notes}
            onChangeText={(text) => handleChange("notes", text)}
            multiline
            style={styles.notesInput}
            textColor="#003D5B"
            numberOfLines={3}
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
          transparent
          onRequestClose={() => setJobTypeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Job Type</Text>
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
            setApplication({ ...originalApplication });
            setIsEditing(false);
          }}
          style={[styles.button, styles.cancelButton]}
          labelStyle={styles.cancelButtonLabel}
        >
          Cancel
        </Button>
      </ScrollView>
    );
  }