import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from '../utils/axiosInstance';

const ExpiredItemsContext = createContext();

export function ExpiredItemsProvider({ children }) {
  const [expiredCount, setExpiredCount] = useState(0);

  const refreshExpired = useCallback(async () => {
    try {
      const res = await axios.get('/inventory');
      const now = new Date();
      const count = res.data.filter(
        item => item.expiration && new Date(item.expiration) < now
      ).length;
      setExpiredCount(count);
    } catch (err) {
      // Prefer silent fail for robustness—log only for dev
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to refresh expired items:', err);
      }
    }
  }, []);

  return (
    <ExpiredItemsContext.Provider value={{ expiredCount, refreshExpired }}>
      {children}
    </ExpiredItemsContext.Provider>
  );
}

export function useExpiredItems() {
  return useContext(ExpiredItemsContext);
}