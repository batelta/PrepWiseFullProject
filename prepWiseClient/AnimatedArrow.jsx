import { Animated, Easing } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useEffect, useRef } from "react";

export default function AnimatedArrow() {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10,
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
      <ChevronDown size={30} color="#BFB4FF" />
    </Animated.View>
  );
}