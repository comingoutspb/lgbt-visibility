// dataContex.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  makeTopicsMap,
} from '../services/googleSheetsService';
import { useYear } from './yearContext';
import { useLanguage } from './langContext'

// Create a DataContext
export const DataContext = createContext();

// Provider component
export const DataProvider = ({ children }) => {
  const { year } = useYear()
  const { language } = useLanguage()

  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [topicsMap, setTopicsMap] = useState({});
  useEffect(() => {
    makeTopicsMap().then(map => {
      setTopicsMap(map);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);
  

  return (
    <DataContext.Provider value={{
      topicsMap,
      loading, error,
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Hook that shorthands the use of Data
export const useData = () => {
  
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;


};

export const useTopicsMap= () => {
  return useContext(DataContext);
};


export const useDataMap = () => {
  const { dataMap, setDataMap } = useContext(DataContext);
  if (dataMap === undefined) {
    throw new Error('useDataMap must be used within a DataProvider');
  }
  return { dataMap, setDataMap };
};

export const useConfiguration = () => {
  const { configuration } = useContext(DataContext);
  if (configuration === undefined) {
    throw new Error('useConfiguration must be used within a DataProvider');
  }
  return configuration;
};

export const useDescriptions = () => {
  const { descriptions } = useContext(DataContext);
  if (descriptions === undefined) {
    throw new Error('useDescriptions must be used within a DataProvider');
  }
  return descriptions;
};
