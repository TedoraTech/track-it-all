import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import LandingPage from './pages/LandingPage';
import CommunityDashboard from './pages/CommunityDashboard';
import PostThread from './pages/PostThread';
import ChatPage from './pages/ChatPage';
import VisaAnalytics from './pages/VisaAnalytics';
import CreatePost from './pages/CreatePost';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/community" element={<CommunityDashboard />} />
            <Route path="/post/:id" element={<PostThread />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/chats" element={<ChatPage />} />
            <Route path="/chats/:groupId" element={<ChatPage />} />
            <Route path="/analytics" element={<VisaAnalytics />} />
            {/* Add more routes here as you create more pages */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
