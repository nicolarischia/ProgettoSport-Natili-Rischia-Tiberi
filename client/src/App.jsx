import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DriversPage from './pages/DriversPage';
import RacesPage from './pages/RacesPage';
import StatsPage from './pages/StatsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Predictions from './pages/Predictions';
import Teams from './pages/Teams';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPredictions from './pages/admin/AdminPredictions';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E10600', // F1 Red
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#15151E',
      paper: '#1F1F2B',
    },
  },
  typography: {
    fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Componente per proteggere le rotte
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Componente per proteggere le rotte admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content" style={{ paddingTop: '64px' }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/drivers" element={<DriversPage />} />
                <Route path="/races" element={<RacesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/teams" element={<Teams />} />
                <Route
                  path="/predictions"
                  element={
                    <ProtectedRoute>
                      <Predictions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/drivers"
                  element={
                    <AdminRoute>
                      <AdminDrivers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/teams"
                  element={
                    <AdminRoute>
                      <AdminTeams />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/predictions"
                  element={
                    <AdminRoute>
                      <AdminPredictions />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 