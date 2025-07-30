import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import {  Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './SignIn';
import SignUp from './SignUp';
import HomePage from './HomePage';
import GeminiChat from './GeminiChat';
import LandingPage from './LandingPage';
import AddApplication from './Application/AddApplication';
import SignUpJobSeeker from './SignUpJobSeeker';
import Profile from './Profile';
import EditProfile from './EditProfile';
import SignUpMentor from './Mentor/SignUpMentor';
import HomePageMentor from './Mentor/HomePageMentor';
import Application from './Application/Application';
import EditProfileMentor from './Mentor/EditProfileMentor';
import AllUserApplications from './Application/AllUserApplications'
import ApplicationSplitView from './Application/ApplicationSplitView';
import MatchRequestJobSeeker from './Matches/MatchRequestJobSeeker';
import { UserProvider } from './UserContext'; // 🔥 import the provider
import MentorMatches from './Matches/MentorMatches';
import MentorOffer from './Mentor/MentorOffer'
import CalendarScreen from './CalendarScreen'
import MessagesScreen from './MessagesScreen'
import ChatScreen from './ChatScreen'
import Query from './Query'
import AllUserMatches from './Matches/AllUserMatches'
import AllUserSessions from './Sessions/AllUserSessions'
import Session from './Sessions/Session'
import SessionSplitView from './Sessions/SessionSplitView'
import AdminScreen from "./Admin/AdminScreen";
import AdminAllUsers from "./Admin/AdminAllUsers";
import AdminAllApplications from "./Admin/AdminAllApplications";
import WeightAnalytics from './Admin/WeightAnalytics'
import CreateOffer from "./Mentor/CreateOffer";
import MentorOffers from "./Mentor/MentorOffers";
// Define your custom theme
const theme = {
  colors: {
    primary: '#BFB4FF', // Button color
    accent: '#9FF9D5',  // Highlight color
    background: '#FDFCF5', // Light cream background
    text: '#003D5B',    // Text color
  }
};
const ComingSoonScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 16, color: "#888" }}>This feature is coming soon!</Text>
  </View>
);

const Stack=createNativeStackNavigator();

export default function App() {

  return (
    <UserProvider> {/* Wrap everything inside this */}

    <NavigationContainer>
    <PaperProvider theme={theme}>
     <Stack.Navigator initialRouteName='SignIn'>
      <Stack.Screen name="SignIn" component={SignIn}/>
      <Stack.Screen name="SignUp" component={SignUp}/>
      <Stack.Screen name="GeminiChat" component={GeminiChat}/>
      <Stack.Screen name="LandingPage" component={LandingPage}/>
      <Stack.Screen name="AddApplication" component={AddApplication}/>
      <Stack.Screen name="SignUpJobSeeker" component={SignUpJobSeeker}/>
      <Stack.Screen name="SignUpMentor" component={SignUpMentor}/>

      <Stack.Screen name="HomePage" component={HomePage}/>
      <Stack.Screen name="HomePageMentor" component={HomePageMentor}/>
      <Stack.Screen name="Profile" component={Profile}/>
      <Stack.Screen name="EditProfile" component={EditProfile}/>
      <Stack.Screen name="EditProfileMentor" component={EditProfileMentor}/>
      <Stack.Screen name="Application" component={Application}/>
      <Stack.Screen name="AllUserApplications" component={AllUserApplications}/>
      <Stack.Screen name="ApplicationSplitView" component={ApplicationSplitView}/>
      <Stack.Screen name="MatchRequestJobSeeker" component={MatchRequestJobSeeker}/>
      <Stack.Screen name="MentorMatches" component={MentorMatches}/>
      <Stack.Screen name="MentorOffer" component={MentorOffer}/>
      <Stack.Screen name="AllUserMatches" component={AllUserMatches}/>
      <Stack.Screen name="CalendarScreen" component={CalendarScreen}/>
      <Stack.Screen name="MessagesScreen" component={MessagesScreen}/>
      <Stack.Screen name="ChatScreen" component={ChatScreen}/>
      <Stack.Screen name="Query" component={Query}/>
      <Stack.Screen name="AllUserSessions" component={AllUserSessions}/>
      <Stack.Screen name="Session" component={Session}/>
      <Stack.Screen name="SessionSplitView" component={SessionSplitView}/>

      <Stack.Screen name="CreateOffer" component={CreateOffer} />
      <Stack.Screen name="MentorOffers" component={MentorOffers} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
      <Stack.Screen name="AdminAllUsers" component={AdminAllUsers} />
     <Stack.Screen name="AdminAllApplications" component={AdminAllApplications} />
     <Stack.Screen name="WeightAnalytics" component={WeightAnalytics} />

      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <Stack.Screen name="ComingSoonCalendar" component={ComingSoonScreen} />
      <Stack.Screen name="ComingSoonMenu" component={ComingSoonScreen} />

     </Stack.Navigator>
    </PaperProvider>
    </NavigationContainer>
    </UserProvider>
  );
}

