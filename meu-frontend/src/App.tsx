// src/App.tsx

import React, { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';

interface PrivateRouteProps {
    children: React.ReactNode;
}

// --- Componente Protetor de Rotas ---
const PrivateRoute = ({ children }: PrivateRouteProps) => { // Remova o tipo FC<...> aqui
    const isAuthenticated = localStorage.getItem('token'); 
    
    // Se não estiver autenticado, retorna um elemento Navigate.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Se estiver autenticado, retorna o children.
    // O TypeScript agora aceita o children aqui, pois a condição de erro já foi tratada.
    return <>{children}</>; 
};
const App: FC = () => {
    return (
        <Router>
            <h1>Sistema de Autenticação React/Node (TS)</h1>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />

                <Route 
                    path="/home" 
                    element={
                        <PrivateRoute>
                            <HomePage />
                        </PrivateRoute>
                    } 
                />
                
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<h1>404 - Página Não Encontrada</h1>} />
            </Routes>
        </Router>
    );
};

export default App;