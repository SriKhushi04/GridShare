import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { GridProvider } from './context/GridContext';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import BuildingDetails from './pages/BuildingDetails';
import AIDecisions from './pages/AIDecisions';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GridProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing page with custom header */}
              <Route path="/" element={<LandingPage />} />

              {/* Application views with standard HeaderNav */}
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/buildings" element={<Buildings />} />
                <Route path="/buildings/:id" element={<BuildingDetails />} />
                <Route path="/ai-decisions" element={<AIDecisions />} />
                <Route path="/transactions" element={<Transactions />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </GridProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
