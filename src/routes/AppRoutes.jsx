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
import {
  ExamListPage,
  ExamFormPage,
  RubricManagementPage,
  ExaminerAssignmentPage,
} from '@pages/ExamManagement';
import {
  SubjectListPage,
  SubjectFormPage,
} from '@pages/SubjectManagement';
import {
  SemesterListPage,
  SemesterFormPage,
} from '@pages/SemesterManagement';
import {
  SessionListPage,
  SessionFormPage,
  SessionExaminerPage,
} from '@pages/SessionManagement';

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
          <Route path="/exams" element={<ExamListPage />} />
          <Route path="/exams/create" element={<ExamFormPage />} />
          <Route path="/exams/:examId/edit" element={<ExamFormPage />} />
          <Route path="/exams/:examId/rubrics" element={<RubricManagementPage />} />
          <Route path="/exams/:examId/examiners" element={<ExaminerAssignmentPage />} />
          <Route path="/subjects" element={<SubjectListPage />} />
          <Route path="/subjects/create" element={<SubjectFormPage />} />
          <Route path="/subjects/:subjectId/edit" element={<SubjectFormPage />} />
          <Route path="/semesters" element={<SemesterListPage />} />
          <Route path="/semesters/create" element={<SemesterFormPage />} />
          <Route path="/semesters/:semesterId/edit" element={<SemesterFormPage />} />
          <Route path="/sessions" element={<SessionListPage />} />
          <Route path="/sessions/create" element={<SessionFormPage />} />
          <Route path="/sessions/:sessionId/edit" element={<SessionFormPage />} />
          <Route path="/sessions/:sessionId/examiners" element={<SessionExaminerPage />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

