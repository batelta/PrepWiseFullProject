import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Menu = ({ isVisible, onClose, navigation ,userType }) => {
      console.log("Menu userType:", userType);

  const slideAnim = React.useRef(new Animated.Value(300)).current; // התחלה מחוץ למסך

  React.useEffect(() => {
    if (isVisible) {
      // אנימציה של כניסה מימין לשמאל
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // אנימציה של יציאה
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

const menuItems = [
  { name: "Calendar", icon: "calendar-outline", screen: "CalendarScreen" },
  ...(userType === "jobSeeker"
    ? [{ name: "Request New Mentor Match", icon: "person-add-outline", screen: "MatchRequestJobSeeker" }]
    : []),
  { name: "Settings", icon: "settings-outline", screen: "Settings" },
  { name: "Help", icon: "help-circle-outline", screen: "Help" },
  { name: "Log Out", icon: "log-out-outline", action: "logout" },
];


  const handleMenuItemPress = (item) => {
    if (item.action === "logout") {
      // כאן תוכלי להוסיף לוגיקה של התנתקות
      console.log("התנתקות");
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
    onClose(); // סגירת התפריט
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* רקע שקוף שאפשר ללחוץ עליו כדי לסגור */}
        <TouchableOpacity 
          style={styles.overlayBackground} 
          onPress={onClose}
          activeOpacity={1}
        />
        
        {/* התפריט עצמו */}
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* כפתור סגירה */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#003D5B" />
          </TouchableOpacity>

          {/* פריטי התפריט */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
              >
                <Ionicons name={item.icon} size={20} color="#003D5B" />
                <Text style={styles.menuItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    width: 250, // רוחב התפריט - לא רחב מידי
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 20,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#003D5B',
    fontFamily: 'Inter_400Regular',
  },
});

export default Menu;