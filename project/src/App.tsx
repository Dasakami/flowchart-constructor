import { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import FlowchartEditor from './components/FlowchartEditor';
import { User, Flowchart } from './types';
import { api } from './api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentFlowchart, setCurrentFlowchart] = useState<Flowchart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      api.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    api.setToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setUser(null);
    setCurrentFlowchart(null);
  };

  const handleEditFlowchart = (flowchart: Flowchart | null) => {
    setCurrentFlowchart(flowchart);
  };

  const handleBackToDashboard = () => {
    setCurrentFlowchart(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (currentFlowchart !== null) {
    return (
      <FlowchartEditor
        flowchart={currentFlowchart}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
        user={user}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onEditFlowchart={handleEditFlowchart}
    />
  );
}

export default App;
