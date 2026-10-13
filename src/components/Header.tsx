import React, { useState, useRef, useEffect } from 'react';
import { Sprout, Sparkles, Activity, Globe, ChevronDown, Check, Download, User, LogOut, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  locationName: string;
  isUpdating: boolean;
  onRefreshAll: () => void;
}

export const Header: React.FC<Props> = ({ locationName, isUpdating, onRefreshAll }) => {
  const { language, setLanguage, t, supportedLanguages, currentLanguageOption } = useLanguage();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header id="main-app-header" className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                {t.appName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Gemini AI
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Location indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 rounded-lg text-xs text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium truncate max-w-[130px] sm:max-w-[180px]">{locationName}</span>
          </div>

          {/* Language Selector Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="language-selector-dropdown-btn"
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={isOpen}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 transition-colors cursor-pointer shadow-xs"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-sm leading-none">{currentLanguageOption.flag}</span>
              <span className="font-medium text-stone-900">{currentLanguageOption.nativeName}</span>
              <span className="text-stone-400 text-[11px] hidden md:inline">({currentLanguageOption.name})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div
                id="language-dropdown-menu"
                className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-1.5 divide-y divide-stone-100"
              >
                <div className="px-3.5 py-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{t.languageSelect}</span>
                  <span className="text-[10px] font-normal text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Gemini AI
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {supportedLanguages.map((opt) => {
                    const isSelected = opt.code === language;
                    return (
                      <button
                        key={opt.code}
                        id={`lang-option-${opt.code}`}
                        type="button"
                        onClick={() => {
                          setLanguage(opt.code);
                          setIsOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{opt.flag}</span>
                          <div>
                            <div className="font-medium text-stone-900">{opt.nativeName}</div>
                            <div className="text-[11px] text-stone-500">{opt.name}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Profile / Login Button */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="user-profile-menu-btn"
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 transition-colors cursor-pointer shadow-xs"
              >
                <span className="text-base leading-none">{user.avatar || '👨‍🌾'}</span>
                <span className="max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-xl shadow-2xl z-50 py-2 divide-y divide-stone-100">
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl leading-none">{user.avatar || '👨‍🌾'}</span>
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-stone-900 truncate">{user.name}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">{user.role}</div>
                        <div className="text-[10px] text-stone-400 truncate">{user.email}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Farm Location:</span>
                        <span className="font-medium truncate max-w-[140px]">{user.farmLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Land Holding:</span>
                        <span className="font-medium">{user.landArea} {user.areaUnit} ({user.soilType})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Primary Crop:</span>
                        <span className="font-semibold text-emerald-800">{user.primaryCrop}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-stone-500" />
                      <span>Switch Profile / Demo Farmer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-sign-in-btn"
              type="button"
              onClick={openAuthModal}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Demo</span>
            </button>
          )}

          {/* Sync Weather Button */}
          <button
            id="header-refresh-btn"
            type="button"
            onClick={onRefreshAll}
            disabled={isUpdating}
            className="text-xs font-semibold px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? t.syncing : t.syncWeather}</span>
          </button>

          {/* Download Project ZIP Button */}
          <a
            id="header-download-zip-btn"
            href="/api/download-zip"
            download="agri-crop-advisor-project.zip"
            className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer text-decoration-none"
            title="Download full project source code as a ZIP file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </a>
        </div>
      </div>
    </header>
  );
};
