import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { SignInPage } from "@/features/auth/sign-in-page";
import { SignUpPage } from "@/features/auth/sign-up-page";
import { ConversationPage } from "@/features/conversation/conversation-page";
import { CulturePage } from "@/features/culture/culture-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { PracticePage } from "@/features/practice/practice-page";
import { ProgressPage } from "@/features/progress/progress-page";
import { SettingsPage } from "@/features/settings/settings-page";
import { ShadowingPage } from "@/features/shadowing/shadowing-page";
import { VocabularyPage } from "@/features/vocabulary/vocabulary-page";

export const router = createBrowserRouter([
  {
    path: "/auth/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUpPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "practice", element: <PracticePage /> },
          { path: "shadowing", element: <ShadowingPage /> },
          { path: "conversation", element: <ConversationPage /> },
          { path: "vocabulary", element: <VocabularyPage /> },
          { path: "culture", element: <CulturePage /> },
          { path: "progress", element: <ProgressPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
