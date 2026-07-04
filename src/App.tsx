import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import AnnotatePage from './pages/AnnotatePage';
import { useAuth } from '@/context/AuthContext';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isInitialized } = useAuth();
  if (!isInitialized) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isInitialized } = useAuth();
  if (!isInitialized) return children;
  return isAuthenticated ? <Navigate to="/tasks" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <RedirectIfAuth>
                  <LoginPage />
                </RedirectIfAuth>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuth>
                  <RegisterPage />
                </RedirectIfAuth>
              }
            />
            <Route
              path="/tasks"
              element={
                <RequireAuth>
                  <TasksPage />
                </RequireAuth>
              }
            />
            <Route
              path="/annotate"
              element={
                <RequireAuth>
                  <AnnotatePage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </TaskProvider>
    </AuthProvider>
  );
}
