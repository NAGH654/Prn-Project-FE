import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@layout/MainLayout';
import HomePage from '@pages/HomePage';
import ReportsPage from '@pages/Reports';
import ProtectedRoute from '@routes/ProtectedRoute';
import { LoginPage, RegisterPage } from '@pages/Auth';
import {
  AssignedExamsPage,
  ExamSubmissionsPage,
  SubmissionGradingPage,
} from '@pages/Grading';

/**
 * Application Routes Configuration
 * Defines all routes and their corresponding components
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/grading" element={<AssignedExamsPage />} />
          <Route path="/grading/exams/:examId" element={<ExamSubmissionsPage />} />
          <Route path="/grading/submissions/:submissionId" element={<SubmissionGradingPage />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

