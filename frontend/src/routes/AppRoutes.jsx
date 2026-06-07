import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import IncidentDetails from '../pages/IncidentDetails';

/**
 * Main application routes binder.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/incidents/:id" element={<IncidentDetails />} />
      {/* Catch-all route redirecting back to Home dashboard */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
