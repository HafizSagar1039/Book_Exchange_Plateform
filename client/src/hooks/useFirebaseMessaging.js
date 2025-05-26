import { useEffect } from "react";
import { requestForToken } from "../firebase-messaging";

const useFirebaseMessaging = (userId) => {
  useEffect(() => {
    const sendTokenToBackend = async () => {
      if (!userId) return; // wait until userId is ready

      const token = await requestForToken();

      if (token) {
        await fetch("http://localhost:3000/api/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId }),
        });
      }
    };

    sendTokenToBackend();
  }, [userId]);
};

export default useFirebaseMessaging;
