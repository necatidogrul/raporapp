import { createContext, useContext, useEffect, useState } from "react";
import { getUserManagers, UserData } from "@/lib/firebase-utils";
import { useAuth } from "./AuthContext";

const ManagersContext = createContext<UserData[]>([]);

export function ManagersProvider({ children }: { children: React.ReactNode }) {
  const [managers, setManagers] = useState<UserData[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchManagers() {
      if (currentUser) {
        const managersData = await getUserManagers();
        setManagers(managersData);
      }
    }

    fetchManagers();
  }, [currentUser]);

  return (
    <ManagersContext.Provider value={managers}>
      {children}
    </ManagersContext.Provider>
  );
}

export function useManagers() {
  return useContext(ManagersContext);
}
