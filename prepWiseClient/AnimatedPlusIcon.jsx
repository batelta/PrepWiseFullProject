import { Animated, Easing, View } from "react-native";
import { Plus } from "lucide-react-native";
import { useEffect, useRef } from "react";

export default function PlusButton() {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 2,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 25,
          backgroundColor: "#BFB4FF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={20} color="white" />
      </View>
    </Animated.View>
  );
}
