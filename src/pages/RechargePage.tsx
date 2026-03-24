import React, { useState } from 'react';
import { useAuth } from '../App';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { motion } from 'motion/react';
import { Send, CheckCircle, Smartphone, Camera, User, MessageCircle } from 'lucide-react';
import Footer from '../components/Footer';

export default function RechargePage() {
  const { user, profile, globalSettings } = useAuth();
  const [amount, setAmount] = useState('');
  const [telegram, setTelegram] = useState('');
  const [transferNumber, setTransferNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);

    try {
      // In a real app, we would upload the screenshot to Firebase Storage
      // For now, we'll just store the name as a placeholder
      await addDoc(collection(db, 'rechargeRequests'), {
        uid: user.uid,
        email: user.email,
        telegram,
        amount: Number(amount),
        transferNumber,
        screenshotName: screenshot?.name || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting recharge request:', error);
      alert('حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">تم تقديم الطلب بنجاح!</h2>
          <p className="text-gray-400 mb-8">سيقوم المشرف بمراجعة طلبك وإضافة الرصيد إلى حسابك في أقرب وقت ممكن.</p>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
          >
            العودة
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 px-3 sm:px-6" dir="rtl">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-black tracking-tighter mb-2">تعبئة الرصيد</h1>
          <p className="text-gray-500 mb-6">أدخل التفاصيل المطلوبة لطلب إضافة رصيد إلى حسابك.</p>

          {/* Payment via Telegram */}
          <div className="mb-8 p-5 bg-blue-600/10 border border-blue-600/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              <span className="text-base font-bold text-white">طريقة الدفع</span>
            </div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              للدفع وشحن الرصيد، يرجى التواصل مباشرة مع المطور عبر تيليجرام:
            </p>
            <a
              href="https://t.me/RLH55"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              @RLH55
            </a>
            <p className="text-xs text-gray-500 mt-3 text-center">
              تواصل مع المطور لإتمام عملية الدفع وشحن رصيدك
            </p>
          </div>

          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-gray-300">أو تحويل مباشر</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">يرجى التحويل إلى الرقم التالي:</p>
            <div className="bg-white/5 p-3 rounded-xl text-center font-mono text-xl font-bold text-blue-400">
              {globalSettings?.transferNumber || '000000000'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">الرصيد المطلوب (بالجنيه المصري)</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="مثال: 100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">الرقم الذي تم التحويل منه</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="01xxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">لقطة شاشة للتحويل</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label 
                  htmlFor="screenshot-upload"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 outline-none cursor-pointer hover:bg-white/10 transition-all flex items-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  {screenshot ? screenshot.name : 'اختر صورة التحويل'}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">يوزر التلجرام</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="@username"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  تقديم الطلب
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500 mb-2">للدفع والاستفسارات تواصل مع المطور</p>
            <a 
              href="https://t.me/RLH55"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-all text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              @RLH55
            </a>
          </div>
        </motion.div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
