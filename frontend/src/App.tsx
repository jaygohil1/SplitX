/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="splitx-theme">
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Landing onSignIn={() => setIsAuthModalOpen(true)} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </Router>
    </ThemeProvider>
  );
}