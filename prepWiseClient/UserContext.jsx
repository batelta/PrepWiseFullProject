import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import meetingNotifications from './MeetingNotifications'; 
import GlobalNotifications from './GlobalNotifications'; 
import { NavigationContainerRefContext } from '@react-navigation/native';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigationRef = useContext(NavigationContainerRefContext);
  const [Loggeduser, setLoggedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentRoute, setCurrentRoute] = useState(null);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setLoggedUser(JSON.parse(storedUser));
        console.log('Loaded from storage:', storedUser);
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // ✅ מאזין לשינויים בניווט (כשה־navigation מוכן)
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigationRef?.getCurrentRoute) {
        const route = navigationRef.getCurrentRoute();
        setCurrentRoute(route?.name);
      }
    }, 500); // בודק כל חצי שניה (אפשר לשפר את זה עם טריגר טוב יותר)

    return () => clearInterval(interval);
  }, [navigationRef]);

 // const { NotificationModal } = meetingNotifications(Loggeduser?.email);

  const routeNamesToHideIcon = ['SignIn', 'SignUp', 'SignUpJobSeeker', 'SignUpMentor'];
  const shouldShowBell = Loggeduser?.email && !routeNamesToHideIcon.includes(currentRoute);

  return (
    <>
      <UserContext.Provider value={{ Loggeduser, setLoggedUser, loadUser, loadingUser }}>
        {children}
        {/*<NotificationModal />*/}
        {shouldShowBell && <GlobalNotifications userEmail={Loggeduser.email} />}
      </UserContext.Provider>
    </>
  );
};