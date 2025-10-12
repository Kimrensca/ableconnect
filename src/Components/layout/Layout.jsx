import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AccessibilityPanel from '../accessibility/AccessibilityPanel';
import { AccessibilityProvider } from '../../hooks/use-accessibility';



// AccessibilityButton component to be used inside the Layout


const Layout = ({userType}) => {
  return (
    <AccessibilityProvider>
      <div className="flex flex-col min-h-screen">

        <Header userType={userType} />
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:px-6 md:py-12">
          <Outlet />
        </main>
        
        <AccessibilityPanel /> 
        
        <Footer />
      </div>
    </AccessibilityProvider>
  );
};

export default Layout;