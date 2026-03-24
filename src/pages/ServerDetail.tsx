import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, doc, onSnapshot, updateDoc, collection, query, where, addDoc, deleteDoc, serverTimestamp, getDocs, getDoc } from '../firebase';
import { useAuth } from '../App';
import { ServerInstance, ServerFile, ServerStatus, DatabaseInstance, BackupInstance, UserProfile } from '../types';
import { 
  Terminal, Folder, Settings, Activity as ActivityIcon, Play, Square, RefreshCcw, Save, 
  Plus, Trash2, ChevronRight, FileText, X, AlertCircle, LayoutDashboard, AlertTriangle,
  Database, HardDrive, User, HelpCircle, MessageSquare, Info, Shield, Cpu,
  Server, Globe, Calendar, Users as UsersIcon, LogOut, Search, FileArchive, Upload, FilePlus, MoreVertical,
  ChevronLeft, FolderPlus, FileCode, FileJson, FileImage, History, Menu, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ServerDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [server, setServer] = useState<ServerInstance | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'console' | 'settings' | 'files' | 'databases' | 'backups' | 'account'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) setProfile(doc.data());
    });
    return () => unsubscribe();
  }, [user]);

  const isServerExpired = (server: ServerInstance) => {
    if (server.plan === 'unlimited' || server.plan === 'premium') return false;
    if (!server.lastRenewedAt) return false;
    const now = new Date();
    const lastRenewed = server.lastRenewedAt.toDate ? server.lastRenewedAt.toDate() : new Date(server.lastRenewedAt);
    const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
    return now.getTime() - lastRenewed.getTime() > tenDaysInMs;
  };

  const handleToggleAutoRenew = async () => {
    if (!server) return;
    await updateDoc(doc(db, 'servers', server.id), {
      autoRenew: !server.autoRenew
    });
  };

  const handleRenewServer = async () => {
    if (!user || !profile || !server) return;
    
    let cost = 0;
    if (server.plan === 'premium') {
      cost = 100;
    } else if (server.plan === 'free') {
      // User said auto-renew for free is 10, maybe manual is also 10 now or just for convenience
      // I'll assume manual renewal for free remains 0 unless specified otherwise, 
      // but the user's request about 10 EGP for auto-renew is specific.
      // Let's make manual renewal for free also 10 EGP if they want to "renew" it? 
      // Actually, I'll keep manual free renewal at 0 but show the 10 EGP option for auto.
      cost = 0; 
    }

    if (cost > 0 && profile.balance < cost) {
      alert(`رصيدك غير كافٍ للتجديد (${cost} EGP)`);
      return;
    }
    
    if (server.plan === 'premium' || server.plan === 'unlimited') {
      if (server.plan === 'premium') {
        const currentExpiry = server.expiresAt?.toDate ? server.expiresAt.toDate() : new Date();
        const newExpiry = new Date(currentExpiry.setMonth(currentExpiry.getMonth() + 1));
        
        await updateDoc(doc(db, 'users', user.uid), {
          balance: profile.balance - cost
        });
        await updateDoc(doc(db, 'servers', server.id), {
          expiresAt: newExpiry,
          status: 'running'
        });
        alert('تم تجديد السيرفر المميز لمدة شهر بنجاح!');
      } else {
        await updateDoc(doc(db, 'servers', server.id), {
          status: 'running'
        });
        alert('تم تجديد السيرفر غير المحدود بنجاح!');
      }
    }
    // Free renewal
    if (server.plan === 'free') {
      await updateDoc(doc(db, 'servers', server.id), {
        lastRenewedAt: serverTimestamp(),
        status: 'running'
      });
      alert('تم تجديد السيرفر المجاني لمدة 10 أيام بنجاح!');
    }
  };

  useEffect(() => {
    console.log('ServerDetail mounted with id:', id);
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'servers', id), (doc) => {
      console.log('Server snapshot:', doc.exists(), doc.data());
      if (doc.exists()) {
        setServer({ id: doc.id, ...doc.data() } as ServerInstance);
      } else {
        navigate('/dashboard');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error in server detail listener:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const logActivity = async (type: string, description: string) => {
    if (!server || !user) return;
    await addDoc(collection(db, 'activities'), {
      uid: user.uid,
      serverId: server.id,
      serverName: server.name,
      type,
      description,
      createdAt: serverTimestamp()
    });
  };

  useEffect(() => {
    if (!server || server.status !== 'running') return;

    const interval = setInterval(() => {
      const cpu = Math.random() * 5 + 2; // 2-7%
      const ram = Math.random() * 50 + 120; // 120-170 MB
      updateDoc(doc(db, 'servers', server.id), { cpu, ram });
    }, 5000);

    return () => clearInterval(interval);
  }, [server?.status, server?.id]);

  useEffect(() => {
    if (!server || server.status !== 'running') return;

    const interval = setInterval(() => {
      const activities = [
        'تم إنشاء اتصال من 192.168.1.45',
        'تم تنفيذ استعلام قاعدة البيانات في 12ms',
        'اكتملت المهمة المجدولة: تنظيف السجلات',
        'تم اكتشاف زيادة في حركة المرور الواردة',
        'تم إجراء تحسين للذاكرة'
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      logActivity('info', randomActivity);
    }, 15000);

    return () => clearInterval(interval);
  }, [server?.status, server?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">جاري تحميل بيانات السيرفر...</p>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] text-center space-y-6 backdrop-blur-3xl">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white">عذراً، لم يتم العثور على السيرفر</h2>
          <p className="text-gray-400 leading-relaxed">
            {error || "يبدو أن السيرفر الذي تحاول الوصول إليه غير موجود أو ليس لديك صلاحية للوصول إليه."}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  if (isServerExpired(server)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4 bg-[#0b0f19]" dir="rtl">
        <div className="max-w-md w-full p-8 bg-[#111622] border border-red-500/20 rounded-3xl text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">انتهت صلاحية السيرفر</h2>
          <p className="text-gray-400">
            {server.plan === 'premium' 
              ? 'لقد انتهت مدة اشتراك السيرفر المميز. يرجى التجديد للاستمرار في استخدامه.'
              : 'لقد انتهت مدة صلاحية السيرفر المجاني (6 أيام). يرجى التجديد لتجنب الحذف.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRenewServer}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              تجديد الآن
            </button>
            <Link
              to="/dashboard"
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold transition-all"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const SidebarItem = ({ id, icon: Icon, label, active }: { id: typeof activeTab, icon: any, label: string, active?: boolean }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded transition-all text-xs font-medium ${
        active 
          ? 'bg-red-500/10 text-red-500 border-r-2 border-red-500 rounded-r-none' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const handleServerAction = async (action: 'running' | 'starting' | 'stopped') => {
    if (!server) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await updateDoc(doc(db, 'servers', server.id), { status: action });
    
    let type: 'start' | 'stop' | 'restart' = 'start';
    let desc = '';
    if (action === 'running') {
      type = 'start';
      desc = `تم تشغيل السيرفر ${server.name}`;
    } else if (action === 'starting') {
      type = 'restart';
      desc = `تم إعادة تشغيل السيرفر ${server.name}`;
      // Simulate starting to running transition
      timeoutRef.current = setTimeout(async () => {
        await updateDoc(doc(db, 'servers', server.id), { status: 'running' });
        timeoutRef.current = null;
      }, 2000);
    } else if (action === 'stopped') {
      type = 'stop';
      desc = `تم إيقاف السيرفر ${server.name}`;
    }
    await logActivity(type, desc);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex pt-16 relative" dir="rtl">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-600/40 flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-40 w-72 h-[calc(100vh-64px)] border-l border-white/5 bg-[#0a0a0a] flex flex-col shadow-2xl transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-white/5 mb-4">
          <span className="text-xl font-black tracking-tighter text-white">OMAR HOST</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-4 mb-6">
          <div className="p-3 bg-white/5 rounded border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg transition-colors duration-300 ${
                server.status === 'running' ? 'bg-green-500' : 
                server.status === 'starting' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}>
                {server.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[10px] text-gray-500 truncate" dir="ltr">{server.ip}:20147</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => handleServerAction('running')}
                className="flex-1 p-2 bg-green-600 hover:bg-green-500 text-white rounded transition-all"
                title="Start"
              >
                <Play className="w-4 h-4 mx-auto" />
              </button>
              <button 
                onClick={() => handleServerAction('starting')}
                className="flex-1 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-all"
                title="Restart"
              >
                <RefreshCcw className="w-4 h-4 mx-auto" />
              </button>
              <button 
                onClick={() => handleServerAction('stopped')}
                className="flex-1 p-2 bg-red-600 hover:bg-red-500 text-white rounded transition-all"
                title="Stop"
              >
                <Square className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-6 custom-scrollbar">
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-4">GENERAL</p>
            <div className="space-y-0.5">
              <SidebarItem id="dashboard" icon={LayoutDashboard} label="لوحة التحكم" active={activeTab === 'dashboard'} />
              <SidebarItem id="console" icon={Terminal} label="الكونسول" active={activeTab === 'console'} />
              <SidebarItem id="settings" icon={Settings} label="الإعدادات" active={activeTab === 'settings'} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-4">الإدارة</p>
            <div className="space-y-0.5">
              <SidebarItem id="files" icon={Folder} label="الملفات" active={activeTab === 'files'} />
              <SidebarItem id="databases" icon={Database} label="قواعد البيانات" active={activeTab === 'databases'} />
              <SidebarItem id="backups" icon={History} label="النسخ الاحتياطي" active={activeTab === 'backups'} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-4">الحساب</p>
            <div className="space-y-0.5">
              <SidebarItem id="account" icon={User} label="تفاصيل الحساب" active={activeTab === 'account'} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#050505] custom-scrollbar flex flex-col p-4 sm:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 bg-white/[0.02] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-white">معلومات السيرفر</h2>
                    <p className="text-xs text-gray-500">إدارة تفاصيل الاشتراك واستهلاك الموارد</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">رصيد الحساب</p>
                    <p className="text-lg font-black text-green-500">{profile?.balance || 0} EGP</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="p-5 sm:p-6 bg-white/[0.02] border border-white/10 rounded-3xl shadow-lg flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">المعالج</p>
                    <p className="text-xl sm:text-2xl font-black text-white">{server.status === 'running' ? `${server.cpu.toFixed(1)}%` : '0%'}</p>
                  </div>
                  <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500/20 group-hover:text-blue-500/40 transition-all" />
                </div>
                <div className="p-5 sm:p-6 bg-white/[0.02] border border-white/10 rounded-3xl shadow-lg flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">الذاكرة</p>
                    <p className="text-xl sm:text-2xl font-black text-white">{server.status === 'running' ? `${server.ram.toFixed(0)} MB` : '0 MB'}</p>
                  </div>
                  <Database className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500/20 group-hover:text-purple-500/40 transition-all" />
                </div>
                <div className="p-5 sm:p-6 bg-white/[0.02] border border-white/10 rounded-3xl shadow-lg flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">المساحة</p>
                    <p className="text-xl sm:text-2xl font-black text-white">10 GB</p>
                  </div>
                  <HardDrive className="w-6 h-6 sm:w-8 sm:h-8 text-green-500/20 group-hover:text-green-500/40 transition-all" />
                </div>
                <div className="p-5 sm:p-6 bg-white/[0.02] border border-white/10 rounded-3xl shadow-lg flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">الخطة</p>
                    <p className="text-xl sm:text-2xl font-black text-blue-400 uppercase">{server.plan === 'free' ? 'مجانية' : server.plan === 'premium' ? 'مميزة' : 'غير محدودة'}</p>
                  </div>
                  <ActivityIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500/20 group-hover:text-blue-500/40 transition-all" />
                </div>
              </div>

              {/* Detailed Info */}
              <div className="grid grid-cols-1 gap-8">
                <div className="p-6 bg-[#111622] border border-white/5 rounded-2xl shadow-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-blue-500" /> تفاصيل الاشتراك
                    </h3>
                    {isServerExpired(server) && (
                      <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded uppercase">منتهي الصلاحية</span>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-xs text-gray-500 uppercase">تاريخ الانتهاء</span>
                      <span className="text-sm font-bold text-white">
                        {server.plan === 'unlimited' ? 'أبداً' : (server.expiresAt?.toDate ? server.expiresAt.toDate().toLocaleDateString('ar-EG') : '6 أيام من التجديد')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-xs text-gray-500 uppercase">وقت التجديد المطلوب</span>
                      <span className="text-sm font-bold text-blue-400">
                        {server.plan === 'premium' ? 'لا يوجد' : server.plan === 'free' ? 'كل 10 أيام' : 'لا يوجد'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-xs text-gray-500 uppercase">تكلفة التجديد</span>
                      <span className="text-sm font-bold text-green-500">
                        {server.plan === 'premium' ? '100 EGP' : server.plan === 'free' ? '0 EGP' : '0 EGP'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleRenewServer}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> تجديد السيرفر الآن
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'console' && <Console server={server} />}
          {activeTab === 'files' && <FileManager server={server} />}
          {activeTab === 'databases' && <DatabasesSection server={server} />}
          {activeTab === 'backups' && <BackupsSection server={server} />}
          {activeTab === 'account' && <AccountSection server={server} />}
          {activeTab === 'settings' && <ServerSettings server={server} />}
      </main>
    </div>
  );
}


function DatabasesSection({ server }: { server: ServerInstance }) {
  const [databases, setDatabases] = useState<DatabaseInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbName, setDbName] = useState('');
  const [dbType, setDbType] = useState<'mysql' | 'postgresql' | 'mongodb'>('mysql');

  useEffect(() => {
    const q = collection(db, 'servers', server.id, 'databases');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDatabases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DatabaseInstance)));
    });
    return () => unsubscribe();
  }, [server.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbName.trim()) return;
    await addDoc(collection(db, 'servers', server.id, 'databases'), {
      serverId: server.id,
      name: dbName,
      type: dbType,
      user: 'admin_' + Math.random().toString(36).substring(7),
      host: 'localhost',
      port: dbType === 'mysql' ? 3306 : dbType === 'postgresql' ? 5432 : 27017,
      createdAt: serverTimestamp()
    });
    setIsModalOpen(false);
    setDbName('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('حذف قاعدة البيانات هذه؟')) {
      await deleteDoc(doc(db, 'servers', server.id, 'databases', id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-right" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">قواعد البيانات</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold rounded transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> قاعدة بيانات جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {databases.length === 0 ? (
          <div className="col-span-full p-8 sm:p-12 bg-[#111622] border border-white/5 rounded-xl text-center">
            <Database className="w-10 h-10 sm:w-12 sm:h-12 text-gray-800 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">لا توجد قواعد بيانات حالياً.</p>
          </div>
        ) : (
          databases.map((db) => (
            <div key={db.id} className="p-5 sm:p-6 bg-[#111622] border border-white/5 rounded-xl shadow-lg group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 rounded flex items-center justify-center text-blue-500">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">{db.name}</h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">{db.type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(db.id)}
                  className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 text-[10px] sm:text-xs font-mono text-gray-400" dir="ltr">
                <p>Host: {db.host}</p>
                <p>Port: {db.port}</p>
                <p>User: {db.user}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#111622] border border-white/10 p-8 rounded shadow-2xl max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-6">إنشاء قاعدة بيانات</h3>
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">الاسم</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm"
                    placeholder="my_database"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">النوع</label>
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white outline-none focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 bg-white/5 text-white text-xs font-bold rounded">إلغاء</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white text-xs font-bold rounded">إنشاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BackupsSection({ server }: { server: ServerInstance }) {
  const [backups, setBackups] = useState<BackupInstance[]>([]);

  useEffect(() => {
    const q = collection(db, 'servers', server.id, 'backups');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBackups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BackupInstance)));
    });
    return () => unsubscribe();
  }, [server.id]);

  const handleCreate = async () => {
    await addDoc(collection(db, 'servers', server.id, 'backups'), {
      serverId: server.id,
      name: `نسخة احتياطية - ${new Date().toLocaleDateString('ar-EG')}`,
      size: Math.floor(Math.random() * 50 + 10) * 1024 * 1024, // 10-60 MB
      status: 'completed',
      createdAt: serverTimestamp()
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('حذف هذه النسخة الاحتياطية؟')) {
      await deleteDoc(doc(db, 'servers', server.id, 'backups', id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">النسخ الاحتياطي</h2>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> إنشاء نسخة احتياطية
        </button>
      </div>

      <div className="bg-[#111622] border border-white/5 rounded-xl overflow-x-auto scrollbar-hide">
        <table className="w-full text-right min-w-[600px] sm:min-w-0">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">الاسم</th>
              <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">الحجم</th>
              <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">الحالة</th>
              <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">التاريخ</th>
              <th className="px-4 sm:px-6 py-4 w-16 sm:w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {backups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-gray-500 text-sm">لا توجد نسخ احتياطية حالياً.</td>
              </tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="px-4 sm:px-6 py-4 font-bold text-xs sm:text-sm">{backup.name}</td>
                  <td className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs text-gray-500 font-mono" dir="ltr">{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] sm:text-[10px] font-bold uppercase rounded">مكتمل</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs text-gray-500">
                    {backup.createdAt?.toDate ? backup.createdAt.toDate().toLocaleDateString('ar-EG') : 'الآن'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-left">
                    <button 
                      onClick={() => handleDelete(backup.id)}
                      className="p-1.5 sm:p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountSection({ server }: { server: ServerInstance }) {
  const { profile } = useAuth();
  
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 text-right" dir="rtl">
      <div className="p-6 sm:p-8 bg-[#111622] border border-white/5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white border-4 border-white/5 shrink-0">
          {profile?.displayName?.charAt(0) || profile?.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-right">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">{profile?.displayName || 'مستخدم'}</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-4">{profile?.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] sm:text-xs font-bold rounded-full border border-blue-500/20">
              {profile?.plan === 'unlimited' ? 'الخطة غير المحدودة' : profile?.plan === 'free' ? 'الخطة المجانية' : 'الخطة المميزة'}
            </span>
            <span className="px-3 py-1 bg-green-600/10 text-green-500 text-[10px] sm:text-xs font-bold rounded-full border border-green-500/20">
              الرصيد: {profile?.balance} ج.م
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 bg-[#111622] border border-white/5 rounded-xl text-sm sm:text-base">
          <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-4">تفاصيل الملكية</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-[10px] sm:text-xs text-gray-500">تاريخ الإنشاء</span>
              <span className="text-[10px] sm:text-xs text-gray-300">{server.createdAt?.toDate ? server.createdAt.toDate().toLocaleDateString('ar-EG') : 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-[10px] sm:text-xs text-gray-500">تاريخ الانتهاء</span>
              <span className="text-[10px] sm:text-xs text-red-400">
                {server.plan === 'unlimited' ? 'أبداً' : (server.expiresAt?.toDate ? server.expiresAt.toDate().toLocaleDateString('ar-EG') : 'غير متوفر')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[10px] sm:text-xs text-gray-500">معرف المالك</span>
              <span className="text-[10px] sm:text-xs font-mono text-gray-500 truncate max-w-[100px] sm:max-w-none">{server.ownerId.substring(0, 12)}...</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-[#111622] border border-white/5 rounded-xl">
          <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-4">الدعم الفني</h3>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-6 leading-relaxed">
            إذا كنت تواجه أي مشاكل في خادمك، يمكنك التواصل مع فريق الدعم الفني عبر تليجرام أو البريد الإلكتروني.
          </p>
          <div className="flex gap-3">
            <a href="https://t.me/RLH55" target="_blank" rel="noreferrer" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold rounded text-center transition-all">تليجرام</a>
            <a href="mailto:support@haroun.py" className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] sm:text-xs font-bold rounded text-center transition-all">البريد الإلكتروني</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Console({ server }: { server: ServerInstance }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const consoleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for logs
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (server.status === 'running') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/logs/${server.id}`);
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              if (data.logs) {
                setLogs(data.logs);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [server.id, server.status]);

  useEffect(() => {
    return () => {
      if (consoleTimeoutRef.current) clearTimeout(consoleTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Fetch all files for the server to support imports/requirements
    const q = query(collection(db, 'servers', server.id, 'files'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServerFile)));
    });
    return () => unsubscribe();
  }, [server.id]);

  const runCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setLogs([`[ OMAR HOST ] جاري التحضير للتشغيل...`]);
    
    const defaultMain = server.language === 'python' ? 'main.py' : server.language === 'javascript' ? 'index.js' : 'index.php';
    const commonMains = server.language === 'python' ? ['main.py', 'app.py', 'bot.py', 'index.py'] : 
                        server.language === 'javascript' ? ['index.js', 'app.js', 'server.js', 'main.js'] : 
                        ['index.php', 'main.php', 'app.php'];
    
    let mainFileName = server.mainFile;
    
    if (!mainFileName) {
      // Try to find a common main file if it exists
      const foundMain = files.find(f => commonMains.includes(f.name));
      mainFileName = foundMain ? foundMain.name : defaultMain;
    }

    const getFileFullPath = (f: ServerFile) => {
      const cleanPath = f.path === '/' ? '' : (f.path.startsWith('/') ? f.path.slice(1) : f.path);
      return cleanPath ? `${cleanPath}/${f.name}` : f.name;
    };

    let mainFile = files.find(f => f.type === 'file' && (f.name === mainFileName || getFileFullPath(f) === mainFileName));
    
    if (!mainFile && !server.mainFile) {
      // If no explicit main file, try common ones again with full path check
      mainFile = files.find(f => f.type === 'file' && commonMains.includes(f.name));
    }

    if (!mainFile) {
      setLogs(prev => [...prev, `[ ERROR ] لم يتم العثور على الملف الرئيسي: ${mainFileName}`]);
      setLogs(prev => [...prev, `[ INFO ] الملفات المتاحة: ${files.filter(f => f.type === 'file').map(f => f.name).join(', ')}`]);
      setIsExecuting(false);
      return;
    }

    const actualMainPath = getFileFullPath(mainFile);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: server.language,
          files: files.filter(f => f.type === 'file').map(f => ({
            name: getFileFullPath(f),
            content: f.content
          })),
          main: actualMainPath,
          serverId: server.id,
          ownerEmail: user?.email || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setLogs(prev => [...prev, `[ ERROR ] ${errorData.message || 'فشل بدء التشغيل'}`]);
        setIsExecuting(false);
        return;
      }

      setLogs(prev => [...prev, `[ OMAR HOST ] تم إرسال طلب التشغيل بنجاح.`]);
    } catch (error) {
      console.error('Execution error:', error);
      setLogs(prev => [...prev, `[ ERROR ] فشل الاتصال بمحرك التشغيل.`]);
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (server.status === 'running' && !isExecuting) {
      runCode();
    } else if (server.status === 'stopped') {
      setLogs(prev => [...prev, `[ OMAR HOST ] تم إيقاف السيرفر.`]);
    } else if (server.status === 'starting') {
      setLogs(prev => [...prev, `[ OMAR HOST ] جاري تهيئة السيرفر...`]);
    }
  }, [server.status]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLogs(prev => [...prev, `> ${input}`]);
    
    const cmd = input.toLowerCase().trim();
    if (cmd === 'help') {
      setLogs(prev => [...prev, 'الأوامر المتاحة: help, clear, status, version, run']);
    } else if (cmd === 'clear') {
      setLogs([]);
    } else if (cmd === 'status') {
      setLogs(prev => [...prev, `حالة السيرفر: ${server.status === 'running' ? 'يعمل' : 'متوقف'}`, `المعالج: ${server.cpu.toFixed(1)}%`, `الذاكرة: ${server.ram.toFixed(0)}MB`]);
    } else if (cmd === 'version') {
      setLogs(prev => [...prev, `Haroun.py Engine v1.0.0`, `Runtime: ${server.language} ${server.version || 'latest'}`]);
    } else if (cmd === 'run') {
      runCode();
    } else {
      setLogs(prev => [...prev, `[ ERROR ] الأمر غير معروف: ${cmd}`]);
    }
    
    setInput('');
  };

  const handleAction = async (action: 'running' | 'stopped' | 'starting') => {
    if (consoleTimeoutRef.current) {
      clearTimeout(consoleTimeoutRef.current);
      consoleTimeoutRef.current = null;
    }

    if (action === 'stopped') {
      try {
        await fetch('/api/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serverId: server.id })
        });
      } catch (e) {
        console.error('Failed to stop process:', e);
      }
    }

    await updateDoc(doc(db, 'servers', server.id), { status: action });
    if (action === 'starting') {
      consoleTimeoutRef.current = setTimeout(async () => {
        await updateDoc(doc(db, 'servers', server.id), { status: 'running' });
        consoleTimeoutRef.current = null;
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Output */}
      <div className="bg-[#111622] border border-white/5 rounded shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">كونسول السيرفر</span>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button 
              onClick={() => setLogs([])}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase rounded border border-white/5 transition-all"
            >
              مسح
            </button>
            <button 
              onClick={() => handleAction('starting')}
              disabled={server.status === 'running' || server.status === 'starting' || isExecuting}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[9px] sm:text-[10px] font-bold uppercase rounded transition-all"
            >
              {isExecuting ? 'جاري التشغيل...' : 'تشغيل'}
            </button>
            <button 
              onClick={() => {
                handleAction('starting');
              }}
              disabled={server.status === 'stopped'}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[9px] sm:text-[10px] font-bold uppercase rounded transition-all"
            >
              إعادة
            </button>
            <button 
              onClick={() => handleAction('stopped')}
              disabled={server.status === 'stopped'}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[9px] sm:text-[10px] font-bold uppercase rounded transition-all"
            >
              إيقاف
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-1 bg-black/20"
        >
          {logs.map((log, i) => {
            const isError = log.includes('ERROR');
            const isDetails = log.includes('DETAILS');
            const isSystem = log.includes('OMAR HOST');
            const isInput = log.startsWith('>');
            
            let colorClass = 'text-gray-300';
            if (isInput) colorClass = 'text-blue-400';
            else if (isError) colorClass = 'text-red-500 font-bold';
            else if (isDetails) colorClass = 'text-red-400/80 text-xs italic';
            else if (isSystem) colorClass = 'text-blue-500 font-bold';

            return (
              <div key={i} className={`${colorClass} break-all flex gap-3`}>
                <span className="text-gray-600 shrink-0 select-none">[{new Date().toLocaleTimeString()}]</span>
                <span className="flex-1">
                  {log}
                </span>
              </div>
            );
          })}
          {(server.status === 'running' || isExecuting) && (
            <div className="text-blue-500 animate-pulse">_</div>
          )}
        </div>

        <form onSubmit={handleCommand} className="p-4 bg-black/40 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 rounded px-4 py-2 border border-white/5 focus-within:border-blue-500/50 transition-all">
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب أمراً..."
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-700"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
function FileManager({ server }: { server: ServerInstance }) {
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ServerFile | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isNewFileModal, setIsNewFileModal] = useState(false);
  const [isNewFolderModal, setIsNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [currentPath, setCurrentPath] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');

  const [isRenameModal, setIsRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ServerFile | null>(null);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'file' | 'folder', name: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModal, setIsBulkDeleteModal] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [currentPath]);

  useEffect(() => {
    const q = query(
      collection(db, 'servers', server.id, 'files'),
      where('path', '==', currentPath)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServerFile));
      // Sort: Folders first, then alphabetically
      fileList.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
      setFiles(fileList);
    });
    return () => unsubscribe();
  }, [server.id, currentPath]);

  const handleSave = async () => {
    if (!selectedFile) return;
    await updateDoc(doc(db, 'servers', server.id, 'files', selectedFile.id), {
      content: editContent,
      updatedAt: serverTimestamp()
    });
    alert('تم حفظ الملف بنجاح!');
    setView('list');
    setSelectedFile(null);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    await addDoc(collection(db, 'servers', server.id, 'files'), {
      serverId: server.id,
      name: newFileName,
      content: '',
      path: currentPath,
      type: 'file',
      updatedAt: serverTimestamp()
    });
    setIsNewFileModal(false);
    setNewFileName('');
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await addDoc(collection(db, 'servers', server.id, 'files'), {
      serverId: server.id,
      name: newFolderName,
      content: '',
      path: currentPath,
      type: 'folder',
      updatedAt: serverTimestamp()
    });
    setIsNewFolderModal(false);
    setNewFolderName('');
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !newName.trim()) return;
    await updateDoc(doc(db, 'servers', server.id, 'files', renameTarget.id), {
      name: newName,
      updatedAt: serverTimestamp()
    });
    setIsRenameModal(false);
    setRenameTarget(null);
    setNewName('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      await addDoc(collection(db, 'servers', server.id, 'files'), {
        serverId: server.id,
        name: file.name,
        content: content,
        path: currentPath,
        type: 'file',
        updatedAt: serverTimestamp()
      });
    };
    reader.readAsText(file);
  };

  const handleDeleteFile = async (fileId: string, fileType: 'file' | 'folder', fileName: string) => {
    await deleteDoc(doc(db, 'servers', server.id, 'files', fileId));
    
    // If it's a folder, delete all files inside it (simulated recursive delete)
    if (fileType === 'folder') {
      const folderPath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
      const q = query(
        collection(db, 'servers', server.id, 'files'),
        where('path', '>=', folderPath),
        where('path', '<=', folderPath + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }

    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setEditContent('');
      setView('list');
    }
    setDeleteConfirm(null);
  };

  const handleDeleteSelected = async () => {
    const itemsToDelete = files.filter(f => selectedIds.includes(f.id));
    for (const item of itemsToDelete) {
      await deleteDoc(doc(db, 'servers', server.id, 'files', item.id));
      if (item.type === 'folder') {
        const folderPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
        const q = query(
          collection(db, 'servers', server.id, 'files'),
          where('path', '>=', folderPath),
          where('path', '<=', folderPath + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
    }
    setSelectedIds([]);
    setIsBulkDeleteModal(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map(f => f.id));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'الآن';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ar-EG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: ServerFile) => {
    if (file.type === 'folder') return <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />;
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
      case 'js':
      case 'ts':
      case 'tsx':
      case 'jsx':
      case 'html':
      case 'css':
      case 'php':
      case 'go':
      case 'rs':
      case 'c':
      case 'cpp':
        return <FileCode className="w-5 h-5 text-blue-400" />;
      case 'json':
        return <FileJson className="w-5 h-5 text-yellow-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage className="w-5 h-5 text-purple-400" />;
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return <FileArchive className="w-5 h-5 text-orange-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const filteredFiles = files.filter(f => {
    if (searchQuery) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return f.path === currentPath;
  });

  if (view === 'edit' && selectedFile) {
    return (
      <div className="flex flex-col h-[600px] bg-[#0d1117] border border-white/5 rounded shadow-2xl overflow-hidden" dir="ltr">
        <div className="h-14 bg-[#161b22] border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile)}
              <span className="text-sm font-bold text-gray-200">{selectedFile.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-all"
            >
              <Save className="w-4 h-4" /> حفظ المحتوى
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex overflow-hidden">
            <div 
              id="line-numbers"
              className="w-12 bg-[#161b22] border-r border-white/5 flex flex-col items-center py-8 text-[10px] font-mono text-gray-600 select-none overflow-hidden"
            >
              {editContent.split('\n').map((_, i) => (
                <div key={i} className="h-[22.4px] flex items-center justify-center w-full">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onScroll={(e) => {
                const gutter = document.getElementById('line-numbers');
                if (gutter) gutter.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
              }}
              onKeyUp={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const textBeforeCursor = target.value.substring(0, target.selectionStart);
                const lines = textBeforeCursor.split('\n');
                const line = lines.length;
                const col = lines[lines.length - 1].length + 1;
                const statusBar = document.getElementById('editor-status');
                if (statusBar) statusBar.innerText = `Line ${line}, Col ${col} | Total Lines: ${target.value.split('\n').length}`;
              }}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const textBeforeCursor = target.value.substring(0, target.selectionStart);
                const lines = textBeforeCursor.split('\n');
                const line = lines.length;
                const col = lines[lines.length - 1].length + 1;
                const statusBar = document.getElementById('editor-status');
                if (statusBar) statusBar.innerText = `Line ${line}, Col ${col} | Total Lines: ${target.value.split('\n').length}`;
              }}
              className="flex-1 p-8 bg-transparent text-gray-300 font-mono text-sm outline-none resize-none custom-scrollbar leading-relaxed"
              placeholder="ابدأ البرمجة..."
              spellCheck={false}
              autoFocus
            />
          </div>
          <div className="h-6 bg-[#161b22] border-t border-white/5 px-4 flex items-center justify-end text-[10px] font-mono text-gray-500 gap-4">
            <span id="editor-status">Line 1, Col 1 | Total Lines: {editContent.split('\n').length}</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-right" dir="rtl">
      {/* File Manager Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="البحث عن ملفات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111622] border border-white/5 rounded px-4 py-2 pr-10 text-sm text-white placeholder:text-gray-700 focus:border-blue-500/50 outline-none transition-all text-right"
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest overflow-x-auto whitespace-nowrap py-2 scrollbar-hide" dir="ltr">
            <button onClick={() => setCurrentPath('/')} className="hover:text-blue-400 transition-all">/home/container</button>
            {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
              <React.Fragment key={i}>
                <span className="text-gray-700">/</span>
                <button 
                  onClick={() => setCurrentPath('/' + arr.slice(0, i + 1).join('/'))}
                  className="hover:text-blue-400 transition-all"
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase rounded border border-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" /> رفع
          </button>
          <button 
            onClick={() => setIsNewFolderModal(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase rounded border border-white/5 transition-all flex items-center justify-center gap-2"
          >
            <FolderPlus className="w-4 h-4" /> مجلد
          </button>
          <button 
            onClick={() => setIsNewFileModal(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> ملف
          </button>
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setIsBulkDeleteModal(true)}
              className="flex-1 sm:flex-none px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-[10px] font-bold uppercase rounded border border-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> حذف المحددين ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="bg-[#111622] border border-white/5 rounded shadow-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-right border-collapse min-w-[600px] sm:min-w-0">
            <thead>
              <tr className="bg-[#161b22] border-b border-white/5">
                <th className="px-4 sm:px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-10 sm:w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-white/10 bg-white/5 cursor-pointer"
                    checked={filteredFiles.length > 0 && selectedIds.length === filteredFiles.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">الاسم</th>
                <th className="hidden sm:table-cell px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">الحجم</th>
                <th className="hidden md:table-cell px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">آخر تعديل</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-16 sm:w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentPath !== '/' && (
                <tr 
                  className="hover:bg-white/[0.02] transition-all group cursor-pointer"
                  onClick={navigateUp}
                >
                  <td className="px-4 sm:px-6 py-4 text-center"></td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-all" />
                      <span className="text-xs sm:text-sm text-gray-500 font-medium italic group-hover:text-blue-400 transition-all">..</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4"></td>
                  <td className="hidden md:table-cell px-6 py-4"></td>
                  <td className="px-4 sm:px-6 py-4"></td>
                </tr>
              )}

              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-12 text-center">
                    <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-600 font-bold text-sm">هذا المجلد فارغ.</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr 
                    key={file.id}
                    className="hover:bg-white/[0.02] transition-all group cursor-pointer items-center"
                    onClick={() => {
                      if (file.type === 'folder') {
                        navigateToFolder(file.name);
                      } else {
                        setSelectedFile(file);
                        setEditContent(file.content || '');
                        setView('edit');
                      }
                    }}
                  >
                    <td className="px-4 sm:px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-white/10 bg-white/5 cursor-pointer"
                        checked={selectedIds.includes(file.id)}
                        onChange={() => toggleSelect(file.id)}
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {getFileIcon(file)}
                        <span className="text-xs sm:text-sm font-bold text-gray-300 group-hover:text-blue-400 transition-all truncate max-w-[120px] sm:max-w-none">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-[10px] sm:text-xs text-gray-500 font-mono">
                      {file.type === 'folder' ? '---' : formatSize(file.content?.length || 0)}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-[10px] sm:text-xs text-gray-500">
                      {formatDate(file.updatedAt)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameTarget(file);
                            setNewName(file.name);
                            setIsRenameModal(true);
                          }}
                          className="p-1.5 hover:bg-blue-500/10 text-gray-500 hover:text-blue-500 rounded transition-all"
                          title="إعادة تسمية"
                        >
                          <FilePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: file.id, type: file.type, name: file.name });
                          }}
                          className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
              onClick={() => setDeleteConfirm(null)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#111622] border border-white/10 p-8 rounded shadow-2xl max-w-md w-full text-right"
              dir="rtl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">تأكيد الحذف</h3>
              <p className="text-sm text-gray-500 mb-6 text-center">
                هل أنت متأكد من حذف {deleteConfirm.type === 'folder' ? 'المجلد' : 'الملف'} <span className="text-red-400 font-bold">"{deleteConfirm.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDeleteFile(deleteConfirm.id, deleteConfirm.type, deleteConfirm.name)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-all"
                >
                  حذف نهائي
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {(isNewFileModal || isNewFolderModal || isRenameModal) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
              onClick={() => {
                setIsNewFileModal(false);
                setIsNewFolderModal(false);
                setIsRenameModal(false);
              }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#111622] border border-white/10 p-8 rounded shadow-2xl max-w-md w-full text-right"
              dir="rtl"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {isNewFileModal ? 'إنشاء ملف جديد' : isNewFolderModal ? 'إنشاء مجلد جديد' : 'إعادة تسمية'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {isRenameModal ? `أدخل الاسم الجديد لـ ${renameTarget?.name}` : `أدخل اسماً لـ ${isNewFileModal ? 'الملف' : 'المجلد'} الجديد.`}
              </p>
              <form onSubmit={isNewFileModal ? handleCreateFile : isNewFolderModal ? handleCreateFolder : handleRename} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">الاسم</label>
                  <input
                    type="text"
                    value={isNewFileModal ? newFileName : isNewFolderModal ? newFolderName : newName}
                    onChange={(e) => {
                      if (isNewFileModal) setNewFileName(e.target.value);
                      else if (isNewFolderModal) setNewFolderName(e.target.value);
                      else setNewName(e.target.value);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:border-blue-500 outline-none transition-all text-sm text-right"
                    placeholder={isNewFileModal ? "مثال: config.json" : isNewFolderModal ? "مثال: assets" : "الاسم الجديد"}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsNewFileModal(false);
                      setIsNewFolderModal(false);
                      setIsRenameModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase rounded transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded transition-all shadow-lg shadow-blue-600/20"
                  >
                    {isRenameModal ? 'تحديث' : 'إنشاء'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isBulkDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
              onClick={() => setIsBulkDeleteModal(false)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#111622] border border-white/10 p-8 rounded shadow-2xl max-w-md w-full text-right"
              dir="rtl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">تأكيد حذف المحددين</h3>
              <p className="text-sm text-gray-500 mb-6 text-center">
                هل أنت متأكد من حذف <span className="text-red-400 font-bold">{selectedIds.length}</span> عناصر؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleDeleteSelected}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-all"
                >
                  حذف نهائي
                </button>
                <button 
                  onClick={() => setIsBulkDeleteModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServerSettings({ server }: { server: ServerInstance }) {
  const navigate = useNavigate();
  const [name, setName] = useState(server.name);
  const [mainFile, setMainFile] = useState(server.mainFile || 'index.py');
  const [version, setVersion] = useState(server.version || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);

  const versions = {
    python: ['3.10', '3.11', '3.12'],
    javascript: ['16', '18', '20'],
    php: ['7.4', '8.1', '8.2']
  };

  useEffect(() => {
    setName(server.name);
    setMainFile(server.mainFile || 'index.py');
    setVersion(server.version || (versions[server.language as keyof typeof versions]?.[0] || ''));
  }, [server.id]);

  const handleUpdate = async () => {
    await updateDoc(doc(db, 'servers', server.id), { 
      name,
      mainFile,
      version
    });
    alert('تم تحديث الإعدادات!');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Stop the server process
      await fetch('/api/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: server.id })
      }).catch(() => {});

      // 2. Delete files
      const filesSnap = await getDocs(collection(db, 'servers', server.id, 'files'));
      for (const fileDoc of filesSnap.docs) {
        await deleteDoc(fileDoc.ref);
      }

      // 3. Delete databases
      const dbsSnap = await getDocs(collection(db, 'servers', server.id, 'databases'));
      for (const dbDoc of dbsSnap.docs) {
        await deleteDoc(dbDoc.ref);
      }

      // 4. Delete backups
      const backupsSnap = await getDocs(collection(db, 'servers', server.id, 'backups'));
      for (const backupDoc of backupsSnap.docs) {
        await deleteDoc(backupDoc.ref);
      }

      // 5. Delete server document
      await deleteDoc(doc(db, 'servers', server.id));

      // 6. Update user server count
      const userRef = doc(db, 'users', server.ownerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          serverCount: Math.max(0, (userSnap.data().serverCount || 1) - 1)
        });
      }

      // 7. Log activity
      await addDoc(collection(db, 'activities'), {
        uid: server.ownerId,
        type: 'delete',
        description: `تم حذف السيرفر ${server.name} نهائياً`,
        createdAt: serverTimestamp(),
        serverId: server.id,
        serverName: server.name
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting server:', error);
      alert('حدث خطأ أثناء حذف السيرفر.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModal(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-6 sm:space-y-8 text-right" dir="rtl">
      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">إعدادات السيرفر</h3>
        <div className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">اسم السيرفر</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">اسم الملف الرئيسي</label>
            <input
              type="text"
              value={mainFile}
              onChange={(e) => setMainFile(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-right font-mono text-sm sm:text-base"
              placeholder="index.py"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">اللغة</label>
              <div className="px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 uppercase font-bold text-[10px] sm:text-xs">
                {server.language}
              </div>
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">الإصدار</label>
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-right appearance-none text-sm sm:text-base"
              >
                {versions[server.language as keyof typeof versions]?.map(v => (
                  <option key={v} value={v} className="bg-[#111622]">{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">الخطة</label>
              <div className="px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-blue-400 uppercase font-bold text-[10px] sm:text-xs">
                {server.plan === 'free' ? 'مجانية' : server.plan === 'premium' ? 'مميزة' : 'غير محدودة'}
              </div>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-sm sm:text-base"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="pt-6 sm:pt-8 border-t border-white/10">
        <h3 className="text-lg sm:text-xl font-bold text-red-500 mb-3 sm:mb-4">منطقة الخطر</h3>
        <p className="text-gray-500 text-[10px] sm:text-sm mb-5 sm:mb-6">بمجرد حذف السيرفر، لا يمكن التراجع. يرجى التأكد.</p>
        <button
          onClick={() => setIsDeleteModal(true)}
          className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold transition-all text-sm sm:text-base"
        >
          حذف السيرفر
        </button>
      </div>

      <AnimatePresence>
        {isDeleteModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setIsDeleteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#111622] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 mx-auto">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">تأكيد حذف السيرفر</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                هل أنت متأكد من حذف السيرفر <span className="text-white font-bold">"{server.name}"</span>؟
                سيتم مسح جميع الملفات وقواعد البيانات والنسخ الاحتياطية نهائياً.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    'نعم، احذف السيرفر'
                  )}
                </button>
                <button
                  onClick={() => setIsDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
