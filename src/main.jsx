import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './shell/App.jsx';

// global stylesheets (design tokens → color roles → app styles)
import './styles/tripme-tokens.css';
import './styles/color-system.css';
import './styles/joanx.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
