import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, googleProvider, auth, sendEmailVerification } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Chrome, ArrowRight, Server, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('تسجيل الدخول بهذا المزود غير مفعل حالياً. يرجى التواصل مع الإدارة.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationCode = async (targetEmail: string, code: string) => {
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code }),
      });
      if (!response.ok) throw new Error('Failed to send verification code');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError('يرجى التحقق من بريدك الإلكتروني أولاً. لقد أرسلنا لك رابط التحقق.');
          await auth.signOut();
          setLoading(false);
          return;
        }
        navigate('/dashboard');
      } else {
        const code = generateCode();
        setGeneratedCode(code);
        const sent = await sendVerificationCode(email, code);
        if (sent) {
          setIsVerifying(true);
        } else {
          setError('فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('تسجيل الدخول بالبريد الإلكتروني غير مفعل حالياً. يرجى التواصل مع الإدارة.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مستخدم بالفعل.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCode !== generatedCode) {
      setError('رمز التحقق غير صحيح.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setVerificationSent(true);
      await auth.signOut();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] text-center space-y-6 backdrop-blur-3xl"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white">تم التحقق بنجاح!</h2>
          <p className="text-gray-400 leading-relaxed">
            لقد تم إنشاء حسابك بنجاح. يرجى التحقق من بريدك الإلكتروني <span className="text-blue-400 font-bold">{email}</span> لتفعيل حسابك نهائياً والبدء.
          </p>
          <button
            onClick={() => {
              setVerificationSent(false);
              setIsLogin(true);
              setIsVerifying(false);
            }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20"
          >
            العودة لتسجيل الدخول
          </button>
        </motion.div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 sm:p-12 bg-white/[0.02] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl space-y-8"
        >
          <div className="text-center">
            <div className="mx-auto h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/40">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-white mb-2">تحقق من هويتك</h2>
            <p className="text-gray-400 text-sm">
              أدخل الرمز المكون من 6 أرقام الذي أرسلناه إلى <br />
              <span className="text-blue-400 font-bold">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-6">
            <input
              type="text"
              maxLength={6}
              required
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="block w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="000000"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
            </button>
            <button
              type="button"
              onClick={() => setIsVerifying(false)}
              className="w-full text-gray-500 hover:text-white text-sm font-medium transition-colors"
            >
              تغيير البريد الإلكتروني
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] overflow-hidden" dir="rtl">
      {/* Left Side - Visual/Marketing */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="relative z-10 max-w-xl text-right">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">منصة استضافة احترافية</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter text-white leading-[0.9] mb-6">
              قوة <br /> <span className="text-blue-500">التحكم</span> <br /> في مشروعك.
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              انضم إلى OMAR HOST واستمتع بأفضل تجربة استضافة VPS مع لوحة تحكم متكاملة ودعم فني على مدار الساعة.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-600/10 blur-[80px] rounded-full -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full space-y-8 p-6 sm:p-12 bg-white/[0.02] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>

          <div className="text-center relative">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/40 rotate-3">
              <Server className="h-9 w-9 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-white mb-2">
              {isLogin ? 'مرحباً بعودتك' : 'انضم إلينا اليوم'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="mr-2 font-bold text-blue-500 hover:text-blue-400 transition-colors underline underline-offset-4"
              >
                {isLogin ? 'سجل الآن' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form className="space-y-5 relative" onSubmit={handleEmailAuth}>
            <div className="space-y-3">
              {!isLogin && (
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pr-12 pl-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all text-right text-sm"
                    placeholder="اسم المستخدم"
                  />
                </div>
              )}
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pr-12 pl-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all text-right text-sm"
                  placeholder="البريد الإلكتروني"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-12 pl-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all text-right text-sm"
                  placeholder="كلمة المرور"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50"
            >
              {loading ? 'جاري المعالجة...' : isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
              <ArrowRight className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform rotate-180" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="px-4 bg-[#020617]/50 backdrop-blur-md text-gray-500">أو المتابعة باستخدام</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all group"
            >
              <Chrome className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <span>Google</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
