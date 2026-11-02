import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@hariompendawala.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { shop } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authApi.adminLogin({ email: email.trim(), password });
      if (res.data?.success) {
        login(res.data.token, res.data.user);
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2a2463] flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-amber-300/30 overflow-hidden relative z-10 animate-fadeIn">
        
        {/* Header Branding */}
        <div className="bg-[#393186] text-white p-8 text-center border-b-2 border-amber-400">
          <img
            src={shop.logo_url || '/assets/logo.jpeg'}
            alt="Hari Om Pendawala Logo"
            className="h-20 w-auto object-contain mx-auto mb-3 border border-amber-400 bg-white p-1 rounded-xl shadow-lg"
          />
          <h1 className="font-serif font-bold text-2xl text-white">
            Hari Om Pendawala
          </h1>
          <p className="text-xs text-amber-300 font-semibold uppercase tracking-widest mt-0.5">
            Admin Management Portal
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl text-xs text-purple-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Default Admin Credentials Prefilled:</strong>
              <p className="text-gray-600 mt-0.5 font-mono text-[11px]">
                Email: admin@hariompendawala.com<br />
                Password: admin123
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-gray-800 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-gray-800 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#393186] hover:bg-[#2a2463] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              to="/"
              className="text-xs text-purple-800 hover:text-purple-950 font-semibold underline"
            >
              Return to Customer Website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
