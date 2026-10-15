import { useState, useEffect } from "react";
import { fetchCurrentUser } from "../api/api";

export default function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchCurrentUser();
        setUser(data);
      } catch {
        // token missing, invalid, or refresh failed — user stays null
      }
    };
    loadUser();
  }, []);

  return user;
}
