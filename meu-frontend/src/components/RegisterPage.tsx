// src/components/RegisterPage.tsx

import React, { useState, FC, FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

const RegisterPage: FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => { // Tipagem do evento
        e.preventDefault();
        setMessage('');

        try {
            // Tipagem da resposta (Response) do Axios não é estritamente necessária aqui, mas é uma boa prática
            const response = await axios.post<{ message: string }>(`${API_URL}/cadastro`, { email, password });
            
            setMessage(`Sucesso: ${response.data.message}`);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            // Tratamento de erro com verificação de tipo (Type Guard)
            if (axios.isAxiosError(error) && error.response) {
                setMessage(`Erro: ${error.response.data.message || 'Erro ao cadastrar.'}`);
            } else {
                setMessage('Erro desconhecido ao conectar com o servidor.');
            }
        }
    };

    return (
        <div>
            <h2>Cadastro de Usuário (TS)</h2>
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
                <button type="submit">Cadastrar</button>
            </form>
            <p>{message}</p>
            <p>Já tem conta? <Link to="/login">Faça Login</Link></p>
        </div>
    );
};

export default RegisterPage;