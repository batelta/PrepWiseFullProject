import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
  } from "react-native";
  
  export default function StatusPickerModal({
    visible,
    onClose,
    onSelect,
    selectedValue,
  }) {
    const applicationStatusList = [
      { label: "To Apply", value: "To Apply" },
      { label: "Applied", value: "Applied" },
      { label: "Interviewed", value: "Interviewed" },
      { label: "Rejected", value: "Rejected" },
      { label: "Offer Received", value: "Offer Received" },
      { label: "Position Closed", value: "Position Closed" },
    ];
  
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Application Status</Text>
            <ScrollView>
              {applicationStatusList.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.modalItem,
                    selectedValue === item.value && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedValue === item.value && styles.selectedText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
  
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
      padding: 15,
    },
    modalHeader: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 15,
      color: "#003D5B",
      textAlign: "center",
    },
    modalItem: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    modalItemText: {
      fontSize: 16,
      color: "#003D5B",
    },
    selectedItem: {
      backgroundColor: "#E6E6FA",
    },
    selectedText: {
      fontWeight: "bold",
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
      textAlign: "center",
      color: "#999",
      fontSize: 16,
    },
  });