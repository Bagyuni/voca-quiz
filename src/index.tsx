import { createRoot } from 'react-dom/client';
import { App } from './App';
import { startUpdateChecks } from './updater';

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);

startUpdateChecks();
