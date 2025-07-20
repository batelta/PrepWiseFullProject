import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity,Image } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';

export default function SignUp({ navigation }) {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light
      });
  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <View style={styles.avatarContainer}>
       
      <Image source={require('./assets/prepWise Logo.png')} style={styles.avatarContainer} />
         </View>
<View style={styles.buttonsContainer}>
        <TouchableOpacity 
          mode="contained" 
          style={styles.loginButton}
          onPress={() => navigation.navigate('SignUpJobSeeker')}
        >
          <Text style={styles.signinText}>Sign Up as a Wise Job Seeker</Text>
        </TouchableOpacity>

        <TouchableOpacity mode="contained" style={styles.loginButton}
        onPress={() => navigation.navigate('SignUpMentor')}
>
<Text style={styles.signinText}>Sign Up as a Mentor</Text>
        </TouchableOpacity>

        </View>
  
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    width: 500,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  avatarContainer: {
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode:'contain'
  },

  signinText:{
      color: 'white',
      fontFamily: 'Inter_300Light',
  
  },
  loginButton: {
    backgroundColor: '#BFB4FF',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,  
  },
  buttonsContainer:{
    justifyContent:'space-evenly',
    alignItems:'center'
  }
  
});
