import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import Icon from '../../components/ui/Icon.jsx';
import { api } from '../../services/api.js';

function RoleSelectionPage() {
  const navigate = useNavigate();
  const { loginUserContext } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('pharmacist');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await api.register({ ...formData, role });
      } else {
        response = await api.login({ email: formData.email, password: formData.password });
      }

      // Restore user session through context
      loginUserContext(response, response.token);

      // Redirect based on backend role
      const userRole = response.role;
      if (userRole === 'pharmacist') navigate(ROUTES.PHARMACIST.DASHBOARD);
      if (userRole === 'doctor') navigate(ROUTES.DOCTOR.DASHBOARD);
      if (userRole === 'patient') navigate(ROUTES.PATIENT.DASHBOARD);

    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background-light dark:bg-background-dark font-display">
      {/* Left: Branding */}
      <div className="lg:w-1/2 bg-deep-purple flex flex-col justify-center p-8 lg:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-pink/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-md shadow-primary/20">
              <Icon name="shield_moon" size={24} className="text-white" />
            </div>
            <h2 className="text-white text-3xl font-black tracking-tight">RxGuard AI</h2>
          </div>
          <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight mb-6">
            AI-Powered Prescription Risk Intelligence
          </h1>
          <div className="flex flex-wrap gap-3 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-border/40">
              <Icon name="document_scanner" size={16} className="text-accent-pink" />
              <span className="text-white text-sm font-medium">OCR Scanning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-border/40">
              <Icon name="pill" size={16} className="text-accent-pink" />
              <span className="text-white text-sm font-medium">Interaction Check</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-border/40">
              <Icon name="database" size={16} className="text-accent-pink" />
              <span className="text-white text-sm font-medium">FHIR Integration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Role selection + login form */}
      <div className="lg:w-1/2 flex flex-col justify-center px-8 py-16 lg:px-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-foreground text-3xl font-bold mb-2">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-muted">
              {isRegister ? 'Select your role and enter your details.' : 'Please select your role and sign in.'}
            </p>
          </div>

          <div className="mb-8">
            <label className="block text-foreground text-sm font-bold mb-4">
              {isRegister ? 'Register as' : 'Sign in as'}
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setRole('pharmacist')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${role === 'pharmacist' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted hover:border-primary/50 hover:text-primary'} group`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${role === 'pharmacist' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-muted text-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                  <Icon name="local_pharmacy" size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide">Pharmacist</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${role === 'doctor' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted hover:border-primary/50 hover:text-primary'} group`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${role === 'doctor' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-muted text-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                  <Icon name="medical_services" size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide">Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${role === 'patient' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted hover:border-primary/50 hover:text-primary'} group`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${role === 'patient' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-muted text-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                  <Icon name="person" size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide">Patient</span>
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-danger/10 text-danger p-3 rounded-xl border border-danger/20 text-sm font-medium">
                {error}
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground text-sm font-bold mb-2">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-foreground text-sm font-bold mb-2">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-foreground text-sm font-bold mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted pointer-events-none">
                  <Icon name="mail" size={20} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@hospital.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-foreground text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted pointer-events-none">
                  <Icon name="lock" size={20} />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'}`}
            >
              {loading ? (isRegister ? 'Registering...' : 'Signing in...') : (isRegister ? `Register as ${role}` : `Sign In as ${role}`)}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="text-muted text-xs font-bold uppercase tracking-wider">OR</span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setError('');
                  setLoading(true);
                  try {
                    const response = await api.googleLogin({
                      credential: credentialResponse.credential,
                      role
                    });

                    loginUserContext(response, response.token);

                    const userRole = response.role;
                    if (userRole === 'pharmacist') navigate(ROUTES.PHARMACIST.DASHBOARD);
                    if (userRole === 'doctor') navigate(ROUTES.DOCTOR.DASHBOARD);
                    if (userRole === 'patient') navigate(ROUTES.PATIENT.DASHBOARD);

                  } catch (err) {
                    setError(err.message || 'Google Auth failed.');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError('Google Login Failed');
                }}
                theme="filled_blue"
                shape="rectangular"
                text="continue_with"
                size="large"
              />
            </div>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-primary text-sm font-bold hover:underline"
              >
                {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;
