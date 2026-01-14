import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import StatementPage from './pages/StatementPage';
import AboutPage from './pages/AboutPage';
import { ScrollToTop } from './components';

/**
 * Main App component with routing
 * Four main routes: Home, Explore, Statement, About
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
