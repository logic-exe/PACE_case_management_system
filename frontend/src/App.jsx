import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AllCases from './pages/AllCases';
import CaseDetails from './pages/CaseDetails';
import Beneficiaries from './pages/Beneficiaries';
import NewCase from './pages/NewCase';
import AddEvent from './pages/AddEvent';
import EditEvent from './pages/EditEvent';
import EditBeneficiary from './pages/EditBeneficiary';
import GoogleCallback from './pages/GoogleCallback';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<AllCases />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/beneficiaries" element={<Beneficiaries />} />
            <Route path="/new-case" element={<NewCase />} />
            <Route path="/add-event" element={<AddEvent />} />
            <Route path="/edit-event/:eventId" element={<EditEvent />} />
            <Route path="/edit-beneficiary/:beneficiaryId" element={<EditBeneficiary />} />
            <Route path="/google/callback" element={<GoogleCallback />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
