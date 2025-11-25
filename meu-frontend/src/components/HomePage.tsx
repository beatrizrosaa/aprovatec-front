// src/components/HomePage.tsx

import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

// Tipagem da resposta da rota protegida
interface ProfileData {
    message: string;
    data: string;
}

const HomePage: FC = () => {
    const [data, setData] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login');
    };

    useEffect(() => {
        const fetchProtectedData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                handleLogout();
                return;
            }

            try {
                // Tipando a resposta com a interface ProfileData
                const response = await axios.get<ProfileData>(`${API_URL}/meu-perfil`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setData(response.data.data);
            } catch (error) {
                console.error("Erro ao buscar dados protegidos:", error);
                handleLogout(); // Força o logout se o token for inválido/expirado
            } finally {
                setLoading(false);
            }
        };

        fetchProtectedData();
    }, [navigate]);

    if (loading) {
        return <h2>Carregando informações do perfil...</h2>;
    }

    return (
        <div>
            <h2>Página Inicial (Rota Protegida - TS)</h2>
            <p>Olá! Você está logado e conseguiu acessar esta página.</p>
            <p>**Mensagem do Servidor:** {data}</p>
            <button onClick={handleLogout}>Sair (Logout)</button>
        </div>
    );
};

export default HomePage;