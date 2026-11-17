import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'librawl/voice-shapes.css';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { RawlColorStyles } from './components/rawl/colors';
import App from './components/App';
import { BrowserRouter as Router } from 'react-router-dom';

createRoot(document.getElementById('root')).render((
  <StyleSheetManager shouldForwardProp={(prop, target) => typeof target !== 'string' || isPropValid(prop)}>
  <Router basename={process.env.PUBLIC_URL}>
    <RawlColorStyles/>
    <App/>
  </Router>
  </StyleSheetManager>
));
