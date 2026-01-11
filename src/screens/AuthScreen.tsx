
import React, { useState } from 'react';
import { useApp } from '../hooks/useStore';
import { api } from '../api/mockBackend';
import { Button, Input } from '../components/UI';
import { Handshake, ShieldCheck, Mail, Lock } from 'lucide-react';

export const AuthScreen = () => {
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await api.auth.register(email, password);
        await login(); // Logs in as the new user
      } else {
        await api.auth.login(email, password);
        await login();
      }
    } catch (err: any) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center p-6 bg-slate-900 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-600/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-purple-600/20 rounded-full blur-[80px]" />

      <div className="z-10 w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center mb-8">
          {/* Logo Icon */}
          <div className="bg-gradient-to-b from-blue-500 to-blue-700 p-6 rounded-[1.5rem] mb-6 border-t border-white/20 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center aspect-square">
            <Handshake size={48} className="text-white drop-shadow-md" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">NegociaSmart</h1>
          <p className="text-gray-400 text-center text-sm">
            {isRegister ? "Crea tu cuenta gratuita" : "Bienvenido de nuevo"}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <div className="space-y-4">
            <Input 
              label="Correo Electrónico" 
              placeholder="tu@email.com" 
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
            />
            <Input 
              label="Contraseña" 
              placeholder="••••••••" 
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
            />
            
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            
            <Button onClick={handleSubmit} isLoading={loading} className="mt-2">
              {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isRegister ? "¿Ya tienes cuenta? Entrar" : "¿Nuevo aquí? Regístrate gratis"}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-2 text-gray-600 text-[10px] uppercase tracking-wider">
          <ShieldCheck size={12} />
          <span>Datos encriptados • 100% Anónimo</span>
        </div>
      </div>
    </div>
  );
};
