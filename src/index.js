import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { RawlColorStyles } from './components/rawl/colors';
import App from './components/App';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render((
  <Router basename={process.env.PUBLIC_URL}>
    <RawlColorStyles/>
    <App/>
  </Router>
), document.getElementById('root'));
