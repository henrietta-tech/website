import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import StatementPage from './pages/StatementPage';
import AboutPage from './pages/AboutPage';
import VerifyPage from './pages/VerifyPage';
import { ScrollToTop } from './components';
import UnsubscribePage from './pages/UnsubscribePage';

/**
 * Main App component with routing
 */
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/statement" element={<StatementPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
