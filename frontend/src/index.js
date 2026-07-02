import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import './styles/custom.css';
import App from './App';
import { AppSettingsProvider } from './context/AppSettings';
import { AuthProvider } from './context/Auth';
import { TripProvider } from './context/Trip';
import { VisitedProvider } from './context/Visited';
import { CompareProvider } from './context/Compare';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppSettingsProvider>
      <AuthProvider>
        <TripProvider>
          <VisitedProvider>
            <CompareProvider>
              <App />
            </CompareProvider>
          </VisitedProvider>
        </TripProvider>
      </AuthProvider>
    </AppSettingsProvider>
  </React.StrictMode>
);

reportWebVitals();

// PWA: register the service worker for offline app shell + installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
