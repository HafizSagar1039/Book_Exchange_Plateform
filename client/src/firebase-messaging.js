// src/firebase-messaging.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAxeTyX2RsrRqXbGGaJirK60mJKyeUzZzo",
  authDomain: "online-book-exchange-plateform.firebaseapp.com",
  projectId: "online-book-exchange-plateform",
  storageBucket: "online-book-exchange-plateform.firebasestorage.app",
  messagingSenderId: "10717327145",
  appId: "1:10717327145:web:581dea167d5621890dd138"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY_HERE" // replace with your Firebase console VAPID key
      });

      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      } else {
        console.log("No registration token available.");
        return null;
      }
    } else {
      console.log("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};
