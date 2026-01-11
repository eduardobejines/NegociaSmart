
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useApp } from './src/hooks/useStore';
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { CaseListScreen } from './src/screens/CaseListScreen';
import { CreateCaseScreen } from './src/screens/CreateCaseScreen';
import { CaseDetailScreen } from './src/screens/CaseDetailScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';

const queryClient = new QueryClient();

const MainNavigator = () => {
  const { screen } = useApp();

  switch (screen) {
    case 'auth': return <AuthScreen />;
    case 'onboarding': return <OnboardingScreen />;
    case 'case_list': return <CaseListScreen />;
    case 'create_case': return <CreateCaseScreen />;
    case 'case_detail': return <CaseDetailScreen />;
    case 'paywall': return <PaywallScreen />;
    default: return <AuthScreen />;
  }
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
