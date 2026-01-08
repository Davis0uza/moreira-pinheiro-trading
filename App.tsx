import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import FloatingControls from './components/FloatingControls';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Initialize news backup system (auto-backup at midnight)
import { initAutoBackup } from './services/newsBackup';
initAutoBackup();

// Public Pages
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import ContactPage from './pages/ContactPage';

// Admin Pages
import AdminAuth from './pages/admin/AdminAuth';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import NewsList from './pages/admin/NewsList';
import NewsEditorForm from './pages/admin/NewsEditorForm';
import NewsMetrics from './pages/admin/NewsMetrics';
import InteractionMetrics from './pages/admin/InteractionMetrics';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout switcher based on route
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin') && pathname !== '/adminauth';
  const isAuth = pathname === '/adminauth';

  if (isAuth) return <>{children}</>;
  if (isAdmin) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <FloatingControls />

      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Auth */}
          <Route path="/adminauth" element={<AdminAuth />} />

          {/* Admin Protected Area */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/new" element={<NewsEditorForm />} />
            <Route path="news/:id" element={<NewsEditorForm />} />
            <Route path="news-metrics" element={<NewsMetrics />} />
            <Route path="news-metrics/list" element={<NewsMetrics />} />
            <Route path="interaction-metrics" element={<InteractionMetrics />} />
          </Route>
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;