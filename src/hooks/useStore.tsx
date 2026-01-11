import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/mockBackend';
import { UserProfile, Case } from '../utils/types';

interface AppContextType {
  user: UserProfile | null;
  login: () => void;
  screen: string;
  navigate: (screen: string, params?: any) => void;
  currentParams: any;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState('auth');
  const [currentParams, setCurrentParams] = useState<any>({});

  const login = async () => {
    const u = await api.auth.getUser();
    setUser(u);
    setScreen('onboarding');
  };

  const navigate = (s: string, params: any = {}) => {
    setScreen(s);
    setCurrentParams(params);
  };

  return (
    <AppContext.Provider value={{ user, login, screen, navigate, currentParams }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// React Query Hooks

export const useCases = () => {
  return useQuery({
    queryKey: ['cases'],
    queryFn: api.cases.list,
    enabled: true
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.cases.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  });
};

export const useGeneratePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId }: { caseId: string }) => api.edge.generatePlan(caseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] }); // Refresh to get the plan in the case object
    }
  });
};