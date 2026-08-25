import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AccessibilityProvider } from '@/contexts/accessibility-context';
import { AppLayout } from '@/components/app-layout';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { UploadPage } from '@/pages/upload';
import { KnowledgeMapPage } from '@/pages/knowledge-map';
import { DiagnosticPage } from '@/pages/diagnostic';
import { LearningPlanPage } from '@/pages/learning-plan';
import { TutorPage } from '@/pages/tutor';
import { PracticePage } from '@/pages/practice';
import { ProgressPage } from '@/pages/progress';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/app/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/app/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/app/knowledge-map" element={<ProtectedRoute><KnowledgeMapPage /></ProtectedRoute>} />
            <Route path="/app/diagnostic" element={<ProtectedRoute><DiagnosticPage /></ProtectedRoute>} />
            <Route path="/app/learning-plan" element={<ProtectedRoute><LearningPlanPage /></ProtectedRoute>} />
            <Route path="/app/tutor" element={<ProtectedRoute><TutorPage /></ProtectedRoute>} />
            <Route path="/app/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
            <Route path="/app/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
