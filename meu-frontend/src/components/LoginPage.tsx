// src/components/LoginPage.tsx

import React, { useState, FC, FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

// Tipagem da resposta esperada do servidor
interface LoginResponse {
    token: string;
    message: string;
    userId: number;
}

const LoginPage: FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            // Tipando a resposta com a interface LoginResponse
            const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
            
            localStorage.setItem('token', response.data.token); 

            setMessage('Login bem-sucedido! Redirecionando...');
            setTimeout(() => navigate('/home'), 1000);

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Aqui o TS sabe que 'error.response.data' existe
                setMessage(`Erro: ${error.response.data.message || 'Credenciais inválidas.'}`);
            } else {
                setMessage('Erro desconhecido ao conectar com o servidor.');
            }
        }
    };

    return (
        <div>
            <h2>Login (TS)</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="E-mail" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Senha" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Entrar</button>
            </form>
            <p>{message}</p>
            <p>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </div>
    );
};

export default LoginPage;