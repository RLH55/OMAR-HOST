import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Server, Zap, Shield, Globe, Cpu, Database, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { PLANS } from '../types';
import Footer from '../components/Footer';
import { useAuth } from '../App';

export default function LandingPage() {
  const { globalSettings } = useAuth();
  const siteName = globalSettings?.siteName || 'OMAR HOST';
  
  const features = [
    { icon: <Cpu className="w-6 h-6" />, title: 'أداء عالي', description: 'أجهزة بمواصفات مؤسسية مع أقراص NVMe SSD وشبكات عالية السرعة.' },
    { icon: <Shield className="w-6 h-6" />, title: 'آمن وموثوق', description: 'حماية متقدمة من هجمات DDoS وضمان وقت تشغيل بنسبة 99.9% لتطبيقاتك.' },
    { icon: <Globe className="w-6 h-6" />, title: 'تغطية عالمية', description: 'انشر خوادمك بالقرب من مستخدميك من خلال شبكتنا العالمية.' },
    { icon: <Zap className="w-6 h-6" />, title: 'إعداد فوري', description: 'خادمك الافتراضي جاهز في ثوانٍ مع لغتك المفضلة مثبتة مسبقاً.' },
  ];

  return (
    <div className="pt-16 overflow-hidden bg-[#020617]" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] sm:h-[600px] bg-blue-600/10 blur-[80px] sm:blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6">
              <Zap className="w-3 h-3" /> استضافة VPS من الجيل القادم
            </span>
            <h1 className="text-3xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent leading-tight">
              OMAR HOST <br /> <span className="text-blue-500">VPS قوي ومتكامل</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-lg text-gray-400 mb-8 sm:mb-10 leading-relaxed px-4">
              قم بتشغيل تطبيقات Python و Node.js و PHP على خوادم افتراضية عالية الأداء. 
              ابدأ مجاناً ووسع نطاق عملك لاحقاً.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                to="/auth"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
              >
                أنشئ خادمك الأول <ArrowRight className="w-5 h-5 rotate-180" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] -z-10"></div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="mr-4 h-6 w-48 bg-white/5 rounded-md"></div>
              </div>
              <div className="aspect-video bg-[#050505] rounded-xl flex items-center justify-center border border-white/5 p-8">
                <div className="w-full h-full font-mono text-left space-y-2 text-sm text-blue-400/80" dir="ltr">
                  <p className="text-gray-500"># Initializing OMAR HOST VPS...</p>
                  <p className="text-green-400">$ omar deploy --lang python --name my-app</p>
                  <p>Searching for available nodes...</p>
                  <p className="text-blue-400">✓ Node found in Europe-West-1</p>
                  <p>Provisioning 2GB RAM, 1 vCPU...</p>
                  <p className="text-green-400">✓ Server "my-app" is now live at 192.168.1.42</p>
                  <p className="text-yellow-400">! Access your dashboard to manage files.</p>
                  <div className="animate-pulse inline-block w-2 h-4 bg-blue-500 ml-1"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4">بنيت للمطورين</h2>
            <p className="text-gray-400 text-sm sm:text-base">كل ما تحتاجه لتشغيل تطبيقاتك على نطاق واسع.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all text-right"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 mb-4 sm:mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]" id="docs">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4">التوثيق التقني</h2>
            <p className="text-gray-400 text-sm sm:text-base">تعلم كيفية نشر تطبيقاتك في ثوانٍ.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-right">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3 justify-end">
                  أمر النشر الفوري <Zap className="w-6 h-6 text-blue-500" />
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  استخدم أداة CLI الخاصة بنا لنشر تطبيقاتك مباشرة من جهازك المحلي. 
                  كل ما عليك فعله هو تثبيت الأداة وتشغيل أمر النشر.
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">الخطوة 1: تثبيت الأداة</p>
                  <code className="text-blue-400 font-mono text-xs sm:text-sm break-all">npm install -g omar-cli</code>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">الخطوة 2: تسجيل الدخول</p>
                  <code className="text-blue-400 font-mono text-xs sm:text-sm break-all">omar login</code>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">الخطوة 3: النشر</p>
                  <code className="text-blue-400 font-mono text-xs sm:text-sm break-all">omar deploy --lang python</code>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-blue-600/20 blur-[100px] -z-10"></div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
                <h4 className="font-bold mb-4 text-gray-300 text-sm sm:text-base">كيفية ربط التطبيقات</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400">
                  <li className="flex items-start gap-3 justify-end">
                    <span className="text-right">تأكد من وجود ملف <code className="text-blue-400">requirements.txt</code> أو <code className="text-blue-400">package.json</code>.</span>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span className="text-right">قم بتحديد الملف الرئيسي في إعدادات السيرفر (مثل <code className="text-blue-400">main.py</code>).</span>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span className="text-right">استخدم الكونسول لمراقبة عملية التشغيل وتثبيت المكتبات الإضافية.</span>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
