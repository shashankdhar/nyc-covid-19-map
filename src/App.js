import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import ChoroplethMap from "./ChoroplethMap";

function App() {
  return (
    <Router>
      <div>
        <Route path="/" exact component={ChoroplethMap} />
      </div>
    </Router>
  );
}

export default App;
