import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { TimePickerModal } from "react-native-paper-dates";
import ModalRN from "react-native-modal";
import { Button } from "react-native-paper";

export default function DateTimePickerModal({ dateTime, setDateTime }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showOverlay, setShowOverlay] = useState(false);

  const handleConfirmTime = ({ hours, minutes }) => {
    setShowTimePicker(false);
    setShowOverlay(false); // הוספנו
    setSelectedTime({ hours, minutes });
  };

  const handleSave = () => {
    if (selectedDate && selectedTime) {
      const newDateTime = new Date(
        `${selectedDate}T${String(selectedTime.hours).padStart(
          2,
          "0"
        )}:${String(selectedTime.minutes).padStart(2, "0")}:00`
      );
      setDateTime(newDateTime);
      setModalVisible(false);
    } else {
      // If missing either date or time
      alert("Please select both Date and Time");
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.selectButton}
      >
        <Text style={styles.selectButtonText}>
          {dateTime
            ? `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}`
            : "Select Date & Time"}
        </Text>
      </TouchableOpacity>

      <ModalRN
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modalStyle}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date</Text>

          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            minDate={new Date().toISOString().split("T")[0]} // disable past dates
            markedDates={
              selectedDate
                ? {
                    [selectedDate]: {
                      selected: true,
                      selectedColor: "#9FF9D5",
                    },
                  }
                : {}
            }
          />

          <Button
            mode="outlined"
            style={styles.timeButton}
            onPress={() => {
              setShowTimePicker(true);
              setShowOverlay(true);
            }}
          >
            {selectedTime
              ? `Time: ${String(selectedTime.hours).padStart(2, "0")}:${String(
                  selectedTime.minutes
                ).padStart(2, "0")}`
              : "Select Time"}
          </Button>

          <TimePickerModal
            visible={showTimePicker}
            onDismiss={() => {
              setShowTimePicker(false);
              setShowOverlay(false); // הוספנו
            }}
            onConfirm={handleConfirmTime}
            hours={selectedTime?.hours}
            minutes={selectedTime?.minutes}
            label="Select time"
            cancelLabel="Cancel"
            confirmLabel="Confirm"
            locale="en"
          />

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            Save
          </Button>
        </View>

        {showOverlay && <View style={styles.overlay} />}
      </ModalRN>
    </>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  selectButtonText: {
    fontSize: 14,
    fontFamily: "Inter_200ExtraLight",
    color: "#003D5B"
  },
  modalStyle: {
    justifyContent: "center",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
    color: "#003D5B",
  },
  timeButton: {
    marginVertical: 15,
    borderColor: "#ccc",
  },
  saveButton: {
    backgroundColor: "#BFB4FF",
    marginTop: 15,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(122, 120, 120, 0.1)",
    zIndex: 999, // שיהיה מעל הכל
  },
});