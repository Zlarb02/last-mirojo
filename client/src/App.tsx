import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MyGamesPage from "@/pages/my-games-page";
import SettingsPage from "@/pages/settings-page";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import "./i18n/config";
import NewGamePage from "./pages/new-game-page";
import { useThemePreferences } from "./hooks/use-theme-preferences";
import { MusicPlayerProvider } from "@/contexts/music-player-context";
import { BackgroundProvider } from "@/contexts/background-context";

function Router() {
  const { user } = useAuth();
  useThemePreferences();

  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/my-games" component={MyGamesPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/new-game" component={NewGamePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BackgroundProvider>
            <MusicPlayerProvider>
              <Router />
              <Toaster />
            </MusicPlayerProvider>
          </BackgroundProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
