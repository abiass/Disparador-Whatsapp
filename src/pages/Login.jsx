
import React, { useState } from 'react';
import { apiFetch } from '../utils/api';

const Login = () => {
	const [nome, setNome] = useState('');
	const [senha, setSenha] = useState('');
	const [showSenha, setShowSenha] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!nome.trim() || !senha) {
			setError('Preencha todos os campos.');
			return;
		}
		setLoading(true);
		try {
			const response = await apiFetch('api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nome, senha })
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.error || 'Erro ao fazer login.');
			} else if (data.token) {
				localStorage.setItem('token', data.token);
				// Redirecionar para página principal ou dashboard
				window.location.href = '/';
			} else {
				setError('Resposta inesperada do servidor.');
			}
		} catch (err) {
			setError('Erro de conexão com o servidor.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-200 to-blue-600">
			<div className="w-full max-w-md p-8 bg-white/90 rounded-2xl shadow-2xl flex flex-col items-center border border-blue-100 backdrop-blur-md">
				<div className="flex flex-col items-center mb-6">
					<div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-full shadow-lg mb-2">
						<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
					<h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-1">Painel Velox</h2>
				</div>
				<form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
					{error && <div className="mb-2 text-red-600 text-center font-medium animate-pulse">{error}</div>}
					<div>
						<label className="block mb-1 font-semibold text-gray-700">Usuário</label>
						<input
							type="text"
							className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 transition"
							value={nome}
							onChange={e => setNome(e.target.value)}
							disabled={loading}
							autoFocus
							placeholder="Digite seu usuário"
						/>
					</div>
					<div>
						<label className="block mb-1 font-semibold text-gray-700">Senha</label>
						<div className="relative">
							<input
								type={showSenha ? "text" : "password"}
								className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50 text-gray-800 placeholder-gray-400 transition pr-10"
								value={senha}
								onChange={e => setSenha(e.target.value)}
								disabled={loading}
								placeholder="Digite sua senha"
							/>
							<button
								type="button"
								className="absolute right-2 top-2 text-blue-500 hover:text-blue-700 focus:outline-none"
								onClick={() => setShowSenha(s => !s)}
								tabIndex={-1}
								aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
							>
								{showSenha ? (
									// Ícone olho aberto
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12C3.5 7.5 8 4.5 12 4.5c4 0 8.5 3 10.5 7.5-2 4.5-6.5 7.5-10.5 7.5-4 0-8.5-3-10.5-7.5z" />
										<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
									</svg>
								) : (
									// Ícone olho fechado
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12C3.5 7.5 8 4.5 12 4.5c4 0 8.5 3 10.5 7.5-2 4.5-6.5 7.5-10.5 7.5-4 0-8.5-3-10.5-7.5z" />
										<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
										<line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
									</svg>
								)}
							</button>
						</div>
					</div>
					<button
						type="submit"
						className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 rounded-lg font-bold text-lg shadow-md hover:from-green-600 hover:to-blue-700 transition disabled:opacity-60 mt-2"
						disabled={loading}
					>
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
								</svg>
								Entrando...
							</span>
						) : 'Entrar'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
