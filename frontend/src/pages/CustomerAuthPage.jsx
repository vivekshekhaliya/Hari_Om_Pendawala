import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Phone, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export default function CustomerAuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { shop } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name.trim() || !formData.phone.trim()) {
          setErrorMsg('Please enter your full name and mobile number.');
          setLoading(false);
          return;
        }
        const res = await authApi.customerRegister(formData);
        if (res.data?.success) {
          login(res.data.token, res.data.user);
          navigate(from, { replace: true });
        }
      } else {
        if (!formData.phone.trim()) {
          setErrorMsg('Please enter your mobile number or email.');
          setLoading(false);
          return;
        }
        const res = await authApi.customerLogin({
          phoneOrEmail: formData.phone.trim(),
          password: formData.password
        });
        if (res.data?.success) {
          login(res.data.token, res.data.user);
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      console.error('Customer auth error:', err);
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-[#393186] p-6 text-center text-white relative">
          <img
            src={shop.logo_url || '/assets/logo.jpeg'}
            alt="Hari Om Pendawala Logo"
            className="h-16 w-auto object-contain mx-auto mb-2 border border-purple-200/50 bg-white p-1 rounded-xl shadow-md"
          />
          <h2 className="font-serif font-bold text-xl text-white">
            Hari Om Pendawala
          </h2>
          <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
            Customer Account Portal
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
            className={`flex-1 py-3.5 text-center transition ${
              !isRegister
                ? 'text-purple-900 border-b-2 border-purple-900 bg-purple-50/50'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
            className={`flex-1 py-3.5 text-center transition ${
              isRegister
                ? 'text-purple-900 border-b-2 border-purple-900 bg-purple-50/50'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Anand Patel"
                  className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-gray-800 focus:outline-none"
                />
                <User className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Mobile Number (or Email) *
            </label>
            <div className="relative">
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9898012345"
                className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm font-mono text-gray-800 focus:outline-none"
              />
              <Phone className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. anand@gmail.com"
                  className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-gray-800 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Password {isRegister ? '*' : '(Optional if instant guest login)'}
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-purple-200 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-gray-800 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#393186] hover:bg-[#2a2463] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition transform active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In to Account'}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/admin/login"
              className="text-[11px] text-amber-700 font-semibold hover:underline flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Are you the store administrator? Log in here</span>
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
