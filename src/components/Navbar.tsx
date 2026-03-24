import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { signOut, auth } from '../firebase';
import { Server, LogOut, User, LayoutDashboard, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, globalSettings } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-white uppercase">{globalSettings?.siteName || 'OMAR HOST'}</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="mr-10 flex items-baseline space-x-4 space-x-reverse">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">الرئيسية</Link>
              {user && (
                <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">لوحة التحكم</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link 
                  to="/recharge"
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 rounded-full transition-all group"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] sm:text-sm font-bold text-blue-400">{profile?.balance || 0} EGP</span>
                </Link>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                    {profile?.plan === 'premium' ? 'برو' : 'مجاني'}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 hidden lg:inline">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all hidden sm:block"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all md:hidden"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/auth" className="text-gray-300 hover:text-white text-xs sm:text-sm font-medium">تسجيل الدخول</Link>
                <Link to="/auth" className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
                  ابدأ الآن
                </Link>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all md:hidden"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-2xl hover:bg-white/5 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-bold">الرئيسية</span>
              </Link>
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-2xl hover:bg-white/5 transition-all"
                  >
                    <Server className="w-5 h-5" />
                    <span className="font-bold">لوحة التحكم</span>
                  </Link>
                  <Link 
                    to="/recharge" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-2xl hover:bg-white/5 transition-all"
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="font-bold">شحن الرصيد</span>
                  </Link>
                  <div className="pt-4 border-t border-white/10">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 text-red-500 hover:bg-red-500/10 px-4 py-3 rounded-2xl transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-bold">تسجيل الخروج</span>
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <Link 
                  to="/auth" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20"
                >
                  ابدأ الآن
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
