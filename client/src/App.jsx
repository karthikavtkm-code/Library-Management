import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Sections from './pages/Sections';
import LibraryOperations from './pages/LibraryOperations';
import UserServices from './pages/UserServices';
import NodeDashboard from './pages/NodeDashboard';
import api from './api/api';
import AddNodeModal from './components/AddNodeModal';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [tree, setTree] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  const fetchTree = async () => {
    try {
      const response = await api.get('/nodes');
      setTree(response.data);
    } catch (error) {
      console.error('Error fetching tree:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTree();
    }
  }, [user]);

  const handleAddChild = (parent) => {
    setSelectedParent(parent);
    setIsModalOpen(true);
  };

  const handleSaveNode = async (nodeData) => {
    try {
      await api.post('/nodes', nodeData);
      fetchTree();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving node');
    }
  };

  const handleEditNode = async (node) => {
    const newName = prompt('Enter new name:', node.name);
    if (newName && newName !== node.name) {
      try {
        await api.put(`/nodes/${node.id}`, { name: newName });
        fetchTree();
      } catch (error) {
        alert('Error updating node');
      }
    }
  };

  const handleDeleteNode = async (id) => {
    if (window.confirm('Are you sure you want to delete this node and all its children?')) {
      try {
        await api.delete(`/nodes/${id}`);
        fetchTree();
      } catch (error) {
        alert('Error deleting node');
      }
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-medium">Initializing BiblioFlow...</p>
    </div>
  );

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={user ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="sections" element={<Sections />} />
            <Route path="operations" element={<LibraryOperations />} />
            <Route path="services" element={<UserServices />} />
            <Route path="node/:id" element={<NodeDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <AddNodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNode}
        parentNode={selectedParent}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
