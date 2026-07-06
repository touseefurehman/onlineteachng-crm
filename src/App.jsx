import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './hooks/useToast';
import AppLayout from './layouts/AppLayout';

/* Enrollment panel */
import EnrollmentDashboard from './pages/enrollment/Dashboard';
import { NewLeads, Qualified, TrialDead } from './pages/enrollment/StagePages';
import Trials from './pages/enrollment/Trials';
import TrialScheduling from './pages/enrollment/TrialScheduling';
import UserManagement from './pages/enrollment/UserManagement';
import ConnectedChannels from './pages/enrollment/ConnectedChannels';

/* Admin & Support panel */
import AdminDashboard from './pages/admin/Dashboard';
import Families from './pages/admin/Families';
import FamilyProfile from './pages/admin/FamilyProfile';
import Support from './pages/admin/Support';
import Communications from './pages/admin/Communications';
import Tickets from './pages/admin/Tickets';
import UnifiedInbox from './pages/admin/UnifiedInbox';

/**
 * Routing is split into the two (and only two) panels.
 * Each panel gets its own layout instance so the sidebar
 * renders only that panel's modules.
 */
export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/enrollment/dashboard" replace />} />

            <Route path="/enrollment" element={<AppLayout panel="enrollment" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EnrollmentDashboard />} />
              <Route path="new-leads" element={<NewLeads />} />
              <Route path="intake" element={<Navigate to="new-leads" replace />} />
              <Route path="qualified" element={<Qualified />} />
              <Route path="trials" element={<Trials />} />
              <Route path="trial-dead" element={<TrialDead />} />
              <Route path="schedule-trial" element={<TrialScheduling />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="connected-channels" element={<ConnectedChannels />} />
              <Route path="unified-inbox" element={<UnifiedInbox />} />
            </Route>

            <Route path="/admin" element={<AppLayout panel="admin" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="families" element={<Families />} />
              <Route path="families/:id" element={<FamilyProfile />} />
              <Route path="support" element={<Support />} />
              <Route path="communications" element={<Communications />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="unified-inbox" element={<UnifiedInbox />} />
            </Route>

            <Route path="*" element={<Navigate to="/enrollment/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
