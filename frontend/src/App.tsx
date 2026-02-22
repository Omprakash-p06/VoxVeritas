import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/store/AppContext';
import { ThemeProvider } from '@/store/ThemeContext';
import { NavBar } from '@/components/ui-custom/NavBar';
import { UploadView } from '@/views/UploadView';
import { ChatView } from '@/views/ChatView';
import { SafetyView } from '@/views/SafetyView';
import { VoiceToolsView } from '@/views/VoiceToolsView';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
            <NavBar />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/upload" replace />} />
                <Route path="/upload" element={<UploadView />} />
                <Route path="/chat" element={<ChatView />} />
                <Route path="/safety" element={<SafetyView />} />
                <Route path="/voice" element={<VoiceToolsView />} />
              </Routes>
            </main>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '2px solid var(--color-border)',
                  fontFamily: 'VT323, monospace',
                  fontSize: '16px',
                },
              }}
            />
          </div>
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
