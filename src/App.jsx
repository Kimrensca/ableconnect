import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from "./Components/layout/Layout";
import Home from './Pages/Home';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import Resources from './Pages/static/Resources';
import FAQ from './Pages/static/FAQ';
import Content from './Pages/Content';
import ProtectedRoute from './Components/ProtectedRoute';
import JobseekerDashboard from './Pages/jobseeker/JobseekerDashboard';
import EmployerDashboard from './Pages/employer/EmployerDashboard';
import EditJob from './Pages/employer/EditJob';
import JobSeekerApplications from './Pages/jobseeker/JobSeekerApplications';
import BrowseJobs from "./Pages/jobseeker/BrowseJobs";
import JobDetails from './Pages/jobseeker/JobDetails';
import ApplicationDetails from './Pages/employer/ApplicationDetails';
import './globals.css'
import ResetPassword from './Pages/auth/ResetPassword';
import ForgotPassword from './Pages/auth/ForgotPassword';
import AccessibilityPanel from './Components/accessibility/AccessibilityPanel';
import PostJob from './Pages/employer/PostJob';
import AdminDashboard from './Pages/admin/AdminDashboard';
import AccessibilityReader from './Components/layout/AccessibilityReader';
import CompanyProfile from './Components/CompanyProfile';
import Announcements from './Pages/admin/Announcements';
import Settings from './Pages/Settings';
import Employers from './Pages/employer/Employers';
import EmployerResources from './Pages/employer/EmployerResources';
import AccessibilityOptions from './Pages/static/AccessibityOptions';
import AccessibilityStatement from './Pages/static/AccessibilityStatement';
import TermsOfService from './Pages/static/TermsOfService';
import PrivacyPolicy from './Pages/static/PrivacyPolicy';



function App() {

  return (
    <Router>
      <AccessibilityReader />
      <Toaster />
      
      <Routes>
      
        <Route element={<Layout />}>
          {/* Home page */}
          <Route index element={<Home />} />

          {/* Public pages */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/job/:jobId" element={<JobDetails />} />
          <Route path="/browse-jobs" element={<BrowseJobs />} />
          <Route path="/companies/:companyName" element={<CompanyProfile />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/accessibility" element={<AccessibilityOptions />} />
          <Route path="/accessibility-statement" element={<AccessibilityStatement />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/content" element={<Content />} />
          <Route path="/accessibility" element={<AccessibilityPanel />} />
          <Route path="/employer/register" element={<Register />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Dashboard overview */}
          <Route path="/resources/dashboard/jobseeker" element={<JobseekerDashboard />} />
          <Route path="/resources/dashboard/employer" element={<EmployerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Protected routes for jobseeker and employer */}
          <Route 
            path="dashboard/jobseeker" 
            element={
              <ProtectedRoute>
                <JobseekerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/employer" 
            element={
              <ProtectedRoute>
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route
            path='/edit-job/:id'
            element ={
              <ProtectedRoute>
                <EditJob />
              </ProtectedRoute>
            }
            />
          <Route path="/employers" element={<Employers />} />
          <Route path="/employer/resources" element={<EmployerResources />} />


          {/* Jobseeker applications page */}
          <Route path="my-applications" element={<JobSeekerApplications />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
