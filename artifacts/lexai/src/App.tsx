import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/contexts/language-context";
import { AuthProvider, useAuthContext } from "@/contexts/auth-context";
import { useEffect } from "react";

import LandingPage from "@/pages/landing";
import PricingPage from "@/pages/pricing";
import ChatPage from "@/pages/chat";
import ConversationPage from "@/pages/conversation";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import AdminPage from "@/pages/admin";
import DossiersPage from "@/pages/dossiers";
import ProfilePage from "@/pages/profile";
import PreparationsPage from "@/pages/preparations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuthContext();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate(`${basePath}/sign-in`);
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/chat">
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      </Route>
      <Route path="/conversations/:id">
        {() => (
          <ProtectedRoute>
            <ConversationPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dossiers">
        <ProtectedRoute>
          <DossiersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>
      <Route path="/preparations">
        <ProtectedRoute>
          <PreparationsPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <WouterRouter base={basePath}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
