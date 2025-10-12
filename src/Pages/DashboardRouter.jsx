import React from 'react';
import JobseekerDashboard from './JobseekerDashboard';
import EmployerDashboard from './EmployerDashboard';

function DashboardRouter() {
  const role = localStorage.getItem('userRole');

  if (role === 'jobseeker') return <JobseekerDashboard />;
  if (role === 'employer') return <EmployerDashboard />;

  return <p className="text-center mt-10 text-red-600">User role not found. Please log in again.</p>;
}


export default DashboardRouter;
