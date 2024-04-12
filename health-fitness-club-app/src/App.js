import React, { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import MemberProfile from './components/MemberProfile';
import TrainerSchedule from './components/TrainerSchedule';
import AdminPanel from './components/AdminPanel';

function App() {
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const renderComponentBasedOnRole = (role) => {
    switch (role) {
      case 'Member':
        return <MemberProfile setUserRole={setUserRole}/>;
      case 'Trainer':
        return <TrainerSchedule />;
      case 'Admin':
        return <AdminPanel />;
      default:
        return null;
    }
  };

  return (
    <div>
      {!userRole ? (
        <LoginRegister onLogin={handleLogin} />
      ) : (
        renderComponentBasedOnRole(userRole)
      )}
    </div>
  );
}

export default App;