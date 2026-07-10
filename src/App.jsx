import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './hooks/useToast';
import AppLayout from './layouts/AppLayout';

/* Enrollment panel */
import EnrollmentDashboard from './pages/enrollment/Dashboard';
import { FollowUps, NewLeads, Qualified, Reports, TrialDead } from './pages/enrollment/StagePages';
import Trials from './pages/enrollment/Trials';
import TrialScheduling from './pages/enrollment/TrialScheduling';
import ConnectedChannels from './pages/enrollment/ConnectedChannels';
import LeadProfile from './pages/enrollment/LeadProfile';

/* Admin & Support panel */
import AdminDashboard from './pages/admin/Dashboard';
import Families from './pages/admin/Families';
import FamilyProfile from './pages/admin/FamilyProfile';
import Support from './pages/admin/Support';
import Communications from './pages/admin/Communications';
import Tickets from './pages/admin/Tickets';
import UnifiedInbox from './pages/admin/UnifiedInbox';
import {
  ActiveStudents,
  AdminReports,
  ApprovalCenter,
  Attendance,
  BillingInvoices,
  ClassSchedule,
  FamilyDiary,
  ParentCommunication,
  StudentNotes,
  StudentProfiles,
  TeacherSchedule,
} from './pages/admin/Operations';

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
              <Route path="reports" element={<Reports />} />
              <Route path="leads/:id" element={<LeadProfile />} />
              <Route path="user-management" element={<Navigate to="dashboard" replace />} />
              <Route path="connected-channels" element={<ConnectedChannels />} />
              <Route path="unified-inbox" element={<UnifiedInbox />} />
            </Route>

            <Route path="/admin" element={<AppLayout panel="admin" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="families" element={<Families />} />
              <Route path="families/:id" element={<FamilyProfile />} />
              <Route path="families-on-leave" element={<Navigate to="/admin/families" replace />} />
              <Route path="dead-families" element={<Navigate to="/admin/families" replace />} />
              <Route path="active-students" element={<ActiveStudents />} />
              <Route path="student-profiles" element={<StudentProfiles />} />
              <Route path="teacher-schedule" element={<TeacherSchedule />} />
              <Route path="class-schedule" element={<ClassSchedule />} />
              <Route path="support" element={<Support />} />
              <Route path="communications" element={<Communications />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="unified-inbox" element={<UnifiedInbox />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="student-notes" element={<StudentNotes />} />
              <Route path="family-diary" element={<FamilyDiary />} />
              <Route path="parent-communication" element={<ParentCommunication />} />
              <Route path="billing-invoices" element={<BillingInvoices />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="approvals" element={<ApprovalCenter />} />
            </Route>

            <Route path="*" element={<Navigate to="/enrollment/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
