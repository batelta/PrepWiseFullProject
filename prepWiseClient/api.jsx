import { Platform } from "react-native";

export const apiUrlStart = Platform.OS === 'android'
  ? "http://172.20.10.9:5062"
  : "https://proj.ruppin.ac.il/igroup11/prod";


  //http://localhost:5062
    //https://proj.ruppin.ac.il/igroup11/prod/