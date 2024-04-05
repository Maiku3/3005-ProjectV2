import React from 'react';
import Dashboard from './components/Dashboard';
import MemberProfile from './components/MemberProfile';
import TrainerSchedule from './components/TrainerSchedule';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <div>
      <h1>Health and Fitness Club Management System</h1>
      <Dashboard />
      <MemberProfile />
      <TrainerSchedule />
      <AdminPanel />
    </div>
  );
}

export default App;
