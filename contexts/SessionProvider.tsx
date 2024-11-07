import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type SessionContextType = {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  hasLogin: boolean;
  
  // onLogout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: PropsWithChildren) => {
  
  const [sessionId, setSessionIdState] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = await getSessionId();
      if (storedSession) setSessionIdState(storedSession);
    };
    loadSession();
  }, []);

  const setSessionId = async (id: string | null) => {
    setSessionIdState(id);
    if (id) {
      await saveSessionId(id);
    } else {
      await removeSessionId();
    }
  };

  const isLoggedIn = !!sessionId;

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, hasLogin: isLoggedIn }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};

// Helper functions to store session in SecureStore or localStorage
const saveSessionId = async (id: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('sessionId', id);
  } else {
    await SecureStore.setItemAsync('sessionId', id);
  }
};

export const getSessionId = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('sessionId');
  } else {
    return await SecureStore.getItemAsync('sessionId');
  }
};

const removeSessionId = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('sessionId');
  } else {
    await SecureStore.deleteItemAsync('sessionId');
  }
};
