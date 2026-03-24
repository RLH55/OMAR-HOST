import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/10 px-4 sm:px-6 lg:px-8 bg-[#050505]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tighter">OMAR HOST</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              منصة استضافة VPS متطورة للمطورين العرب. نوفر لك الأداء والأمان الذي تحتاجه لتنمية مشاريعك.
            </p>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-600 text-xs">© 2026 OMAR HOST. جميع الحقوق محفوظة لـ OMAR.</p>
        </div>
      </div>
    </footer>
  );
}
