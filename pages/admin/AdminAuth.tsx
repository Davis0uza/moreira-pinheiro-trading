import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, Mail, WifiOff } from 'lucide-react';
import { authApi, ApiError } from '../../services/api';
import { checkBackendStatus } from '../../services/newsBackup';

const AdminAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkBackendStatus().then(setBackendOnline);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.login(email, password);
      navigate('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro de ligação. Verifique se o servidor está a correr.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-corporate-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-corporate-primary/20">
            <ShieldCheck className="w-10 h-10 text-corporate-primary" />
          </div>
          <h1 className="text-white font-serif font-bold text-3xl mb-2">Admin Access</h1>
          <p className="text-slate-500 text-sm">Insira as suas credenciais para aceder ao painel de controlo.</p>
        </div>

        {/* Status Bar */}
        <div className="flex justify-center mb-8">
          <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest border transition-all ${backendOnline === true ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : backendOnline === false ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${backendOnline === true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : backendOnline === false ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-slate-500'} animate-pulse`}></div>
            {backendOnline === true ? 'Sistema Online' : backendOnline === false ? 'Sistema Offline' : 'A verificar...'}
          </div>
        </div>

        {/* Backend Offline Business Card - Redesigned */}
        {backendOnline === false && (
          <div className="bg-gradient-to-br from-[#f29ec4] via-[#f6bcd7] to-[#c9e3f5] rounded-3xl shadow-2xl p-[1px] mb-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 group md:hover:scale-[1.02] transition-transform">
            <div className="bg-white/90 backdrop-blur-xl rounded-[23px] p-8 h-full relative z-10">
              <div className="flex flex-col items-center text-center">

                {/* Message */}
                <h3 className="text-slate-800 font-serif font-bold text-xl mb-3">Serviço Indisponível</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8 font-light max-w-xs mx-auto">
                  Não se preocupe, estamos a resolver o problema. Se notar que persiste por mais de 24h, por favor contacte:
                </p>

                {/* Contact Details */}
                <div className="w-full bg-white/50 border border-white/60 rounded-xl p-4 space-y-3 mb-8 shadow-sm">
                  <div className="flex items-center justify-center gap-3 text-slate-700 text-sm font-medium hover:text-[#f29ec4] transition-colors cursor-default">
                    <Mail size={16} className="text-slate-400" />
                    <span>bundlr.solutions@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-slate-700 text-sm font-medium hover:text-[#f29ec4] transition-colors cursor-default">
                    <span className="w-4 h-4 flex items-center justify-center text-slate-400 font-bold">#</span>
                    <span>+351 968 939 957</span>
                  </div>
                </div>

                {/* Logo at Bottom */}
                <div className="mt-auto opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 duration-500">
                  <img src="/BUNDLR.png" alt="BUNDLR Solutions" className="h-6 w-auto object-contain" />
                </div>
              </div>
            </div>

            {/* Dynamic Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f29ec4]/20 blur-3xl rounded-full -translate-x-10 translate-y-10 group-hover:-translate-x-5 group-hover:translate-y-5 transition-transform duration-1000"></div>
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className={`bg-slate-900 p-8 rounded-2xl border transition-all duration-300 ${error ? 'border-red-500/50 shake' : 'border-slate-800 shadow-2xl shadow-black/50'}`}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
              <div className="relative">
                <input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white outline-none focus:border-corporate-primary focus:ring-1 focus:ring-corporate-primary transition-all"
                  placeholder="admin@mptrading.com"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white outline-none focus:border-corporate-primary focus:ring-1 focus:ring-corporate-primary transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-corporate-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-sky-500 transition-all shadow-lg shadow-corporate-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'A entrar...' : 'Entrar'} <ArrowRight size={18} />
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Moreira & Pinheiro Trading Group
        </p>
      </div>

      <style>{`
        .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default AdminAuth;