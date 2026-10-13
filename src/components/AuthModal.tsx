import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, SoilType } from '../types';
import { X, UserCheck, ShieldCheck, Sparkles, MapPin, Layers, Sprout, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    demoAccounts,
    loginAsDemo,
    loginWithCredentials,
    registerUser,
    user,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register'>('demo');
  const [emailOrPhone, setEmailOrPhone] = useState<string>('ramesh.farmer@kisan.in');
  const [password, setPassword] = useState<string>('kisan123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Registration Form State
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('Farmer / Landowner');
  const [regLocation, setRegLocation] = useState<string>('Coimbatore, Tamil Nadu, India');
  const [regSoil, setRegSoil] = useState<SoilType>('Loamy');
  const [regArea, setRegArea] = useState<number>(5);
  const [regCrop, setRegCrop] = useState<string>('Paddy (Rice)');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithCredentials(emailOrPhone, password);
      if (!res.success) {
        setAuthError(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setAuthError('An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        role: regRole,
        farmLocation: regLocation,
        soilType: regSoil,
        landArea: regArea,
        primaryCrop: regCrop,
      });
      if (!res.success) {
        setAuthError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setAuthError('An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              🌾
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Farmer Authentication
                <span className="text-[11px] font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Mock Auth Mode
                </span>
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Sign in to customize field parameters, soil metrics, and localized weather advisories.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('demo');
              setAuthError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'demo'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Demo Profiles</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setAuthError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setAuthError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Profile</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="font-semibold">Notice:</span> {authError}
            </div>
          )}

          {/* TAB 1: 1-Click Demo Profiles */}
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Select any pre-configured farmer or specialist profile:</p>
                  <p className="text-emerald-700 mt-0.5">
                    Instantly populates field acreage, regional weather conditions, soil types, and active crops.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map((account) => {
                  const isCurrent = user?.id === account.id;
                  return (
                    <div
                      key={account.id}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl leading-none">{account.avatar}</span>
                          <div>
                            <div className="text-xs font-bold text-stone-900">{account.name}</div>
                            <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                              {account.role}
                            </span>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 space-y-1 text-[11px] text-stone-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{account.farmLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>
                            {account.landArea} {account.areaUnit} • {account.soilType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                          <Sprout className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Crop: {account.primaryCrop}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => loginAsDemo(account.id)}
                        className={`w-full mt-3 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isCurrent ? 'Continue as this Profile' : 'Sign in as this Profile'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Sign In */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g., farmer@kisan.in or 9876543210"
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  (Mock credentials: any password is accepted for prototyping)
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailOrPhone('kavitha.agri@tnfarm.org');
                    setPassword('kisan123');
                  }}
                  className="py-2 px-3 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Auto-fill Demo
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Create Account */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Rajesh Sharma"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Farmer / Landowner">Farmer / Landowner</option>
                    <option value="Smallholder Farmer">Smallholder Farmer</option>
                    <option value="Commercial Grower">Commercial Grower</option>
                    <option value="Agronomist / Officer">Agronomist / Extension Officer</option>
                    <option value="Student / Researcher">Student / Researcher</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Farm Location
                  </label>
                  <input
                    type="text"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    placeholder="e.g., Nashik, Maharashtra"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Soil Type
                  </label>
                  <select
                    value={regSoil}
                    onChange={(e) => setRegSoil(e.target.value as SoilType)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Clay">Clay</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Silt">Silt</option>
                    <option value="Peaty">Peaty</option>
                    <option value="Chalky">Chalky</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Land Area (Acres)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={regArea}
                    onChange={(e) => setRegArea(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Crop
                </label>
                <input
                  type="text"
                  value={regCrop}
                  onChange={(e) => setRegCrop(e.target.value)}
                  placeholder="e.g., Paddy, Cotton, Banana, Tomato, Maize"
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Create Farmer Profile & Sign In'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Session automatically saved locally
          </span>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
          >
            Continue as Guest &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
