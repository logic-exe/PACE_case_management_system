import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AllCases from './pages/AllCases';
import CaseDetails from './pages/CaseDetails';
import Beneficiaries from './pages/Beneficiaries';
import NewCase from './pages/NewCase';
import AddEvent from './pages/AddEvent';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cases" element={<AllCases />} />
          <Route path="/cases/:id" element={<CaseDetails />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/new-case" element={<NewCase />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
