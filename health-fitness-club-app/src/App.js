import React, { useState } from 'react';
import LoginRegister from './components/LoginRegister/LoginRegister';
import MemberProfile from './components/MemberProfile/MemberProfile';
import TrainerSchedule from './components/TrainerSchedule/TrainerSchedule';
import AdminPanel from './components/AdminPanel/AdminPanel';

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
        return <TrainerSchedule setUserRole={setUserRole}/>;
      case 'Admin':
        return <AdminPanel setUserRole={setUserRole}/>;
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