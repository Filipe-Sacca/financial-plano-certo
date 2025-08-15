import React, { createContext, useContext, useCallback } from 'react';

interface IfoodSyncContextType {
  refreshStatus: () => void;
}

const IfoodSyncContext = createContext<IfoodSyncContextType | undefined>(undefined);

interface IfoodSyncProviderProps {
  children: React.ReactNode;
  onRefresh: () => void;
}

export const IfoodSyncProvider: React.FC<IfoodSyncProviderProps> = ({ 
  children, 
  onRefresh 
}) => {
  const refreshStatus = useCallback(() => {
    console.log('🔄 [SYNC CONTEXT] Refreshing status globally...');
    onRefresh();
  }, [onRefresh]);

  return (
    <IfoodSyncContext.Provider value={{ refreshStatus }}>
      {children}
    </IfoodSyncContext.Provider>
  );
};

export const useIfoodSync = () => {
  const context = useContext(IfoodSyncContext);
  if (context === undefined) {
    throw new Error('useIfoodSync must be used within an IfoodSyncProvider');
  }
  return context;
};