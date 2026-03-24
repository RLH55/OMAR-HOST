import React from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Phone, MapPin, CheckCircle2, Globe, Zap, Cpu } from 'lucide-react';
import Footer from '../components/Footer';

export function AboutPage() {
  return (
    <div className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-right" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 sm:mb-16"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tighter">عن OMAR HOST</h1>
        <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
          نحن نسعى لتوفير أفضل حلول الاستضافة السحابية للمطورين في العالم العربي، مع التركيز على الأداء العالي والسهولة في الاستخدام.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-16 sm:mb-20">
        <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">رؤيتنا</h3>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            أن نكون المنصة الأولى للمطورين العرب لإطلاق مشاريعهم وتوسيع نطاقها عالمياً.
          </p>
        </div>
        <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">قيمنا</h3>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            الشفافية، الموثوقية، ودعم الابتكار في كل خطوة.
          </p>
        </div>
        <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">مهمتنا</h3>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            توفير بنية تحتية قوية بأسعار تنافسية ودعم فني متخصص.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-right" dir="rtl">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4 tracking-tighter">اتصل بنا</h1>
        <p className="text-sm sm:text-base text-gray-400">نحن هنا لمساعدتك في أي وقت.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        <div className="space-y-4 sm:space-y-8">
          <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-white/5 border border-white/10 rounded-3xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg">البريد الإلكتروني</h4>
              <p className="text-sm sm:text-base text-gray-400">support@omarhost.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-white/5 border border-white/10 rounded-3xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-600/20 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg">الهاتف</h4>
              <p className="text-sm sm:text-base text-gray-400">+20 123 456 7890</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-white/5 border border-white/10 rounded-3xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500 shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg">الموقع</h4>
              <p className="text-sm sm:text-base text-gray-400">القاهرة، مصر</p>
            </div>
          </div>
        </div>

        <form className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-3xl space-y-5 sm:space-y-6">
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">الاسم بالكامل</label>
            <input type="text" className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="أدخل اسمك" />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">البريد الإلكتروني</label>
            <input type="email" className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="example@mail.com" />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">الرسالة</label>
            <textarea className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 h-24 sm:h-32 resize-none text-sm" placeholder="كيف يمكننا مساعدتك؟"></textarea>
          </div>
          <button className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-sm sm:text-base">
            إرسال الرسالة
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export function PricingPage() {
  const plans = [
    {
      name: 'مجانية',
      price: '0',
      features: ['512MB RAM', '1 vCPU (Shared)', '10GB NVMe SSD', 'دعم فني محدود', 'سيرفر واحد فقط'],
      color: 'gray'
    },
    {
      name: 'مميزة',
      price: '300',
      features: ['4GB RAM', '2 vCPU (Dedicated)', '50GB NVMe SSD', 'دعم فني أولوية', 'عدد غير محدود من السيرفرات', 'نسخ احتياطي يومي'],
      color: 'blue',
      popular: true
    }
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-right" dir="rtl">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4 tracking-tighter">خطط الأسعار</h1>
        <p className="text-sm sm:text-base text-gray-400">اختر الخطة التي تناسب احتياجات مشروعك.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <div key={idx} className={`relative p-6 sm:p-8 rounded-3xl border ${plan.popular ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-white/5'}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-full">الأكثر شيوعاً</span>
            )}
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6 sm:mb-8">
              <span className="text-3xl sm:text-4xl font-black">{plan.price}</span>
              <span className="text-xs sm:text-gray-500">EGP / شهرياً</span>
            </div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-300">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3.5 sm:py-4 rounded-xl font-bold transition-all text-sm sm:text-base ${plan.popular ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
              ابدأ الآن
            </button>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-right" dir="rtl">
      <h1 className="text-3xl font-black mb-8">سياسة الخصوصية</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-gray-400">
        <p>نحن في OMAR HOST نلتزم بحماية خصوصيتك وبياناتك الشخصية.</p>
        <h2 className="text-xl font-bold text-white">1. البيانات التي نجمعها</h2>
        <p>نجمع المعلومات التي تقدمها لنا عند إنشاء حساب، مثل البريد الإلكتروني والاسم.</p>
        <h2 className="text-xl font-bold text-white">2. كيف نستخدم بياناتك</h2>
        <p>نستخدم بياناتك لتحسين خدماتنا، والتواصل معك بخصوص حسابك، وضمان أمان المنصة.</p>
        <h2 className="text-xl font-bold text-white">3. حماية البيانات</h2>
        <p>نستخدم تقنيات تشفير متقدمة لحماية بياناتك من الوصول غير المصرح به.</p>
      </div>
      <Footer />
    </div>
  );
}

export function TermsOfService() {
  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-right" dir="rtl">
      <h1 className="text-3xl font-black mb-8">شروط الاستخدام</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-gray-400">
        <p>باستخدامك لخدمات OMAR HOST، فإنك توافق على الالتزام بالشروط التالية.</p>
        <h2 className="text-xl font-bold text-white">1. الاستخدام المقبول</h2>
        <p>يمنع استخدام خدماتنا في أي أنشطة غير قانونية أو تضر بالآخرين.</p>
        <h2 className="text-xl font-bold text-white">2. الحسابات والأمان</h2>
        <p>أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.</p>
        <h2 className="text-xl font-bold text-white">3. إلغاء الخدمة</h2>
        <p>نحتفظ بالحق في تعليق أو إلغاء حسابك في حال مخالفة شروط الاستخدام.</p>
      </div>
      <Footer />
    </div>
  );
}
