import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDocs } from '../firebase';
import { ServerInstance, PLANS, ServerStatus, ServerLanguage, Plan } from '../types';
import { Plus, Server, Play, Square, Trash2, ExternalLink, Cpu, Database, Activity, Search, Filter, MoreVertical, X, AlertTriangle, Wallet, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from '../components/Footer';

export default function Dashboard() {
  const { user, profile, globalSettings, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerLang, setNewServerLang] = useState<ServerLanguage>('python');
  const [newServerVersion, setNewServerVersion] = useState('3.10');
  const [newServerPlan, setNewServerPlan] = useState<Plan>('free');
  const [newServerDuration, setNewServerDuration] = useState(1); // Months
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const versions = {
    python: ['3.10', '3.11', '3.12'],
    javascript: ['16', '18', '20'],
    php: ['7.4', '8.1', '8.2']
  };

  useEffect(() => {
    setNewServerVersion(versions[newServerLang][0]);
  }, [newServerLang]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'servers'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serverList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServerInstance));
      setServers(serverList);
    }, (error) => {
      console.error('Error in servers listener:', error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (servers.length === 0 || !user) return;

    const checkExpirations = async () => {
      for (const server of servers) {
        if (server.plan === 'unlimited') continue; // Unlimited servers never expire
        
        const graceStatus = getGracePeriodStatus(server);
        
        if (graceStatus === 'deleted') {
          // Delete server
          await deleteDoc(doc(db, 'servers', server.id));
          if (profile) {
            await updateDoc(doc(db, 'users', user.uid), {
              serverCount: Math.max(0, (profile.serverCount || 0) - 1)
            });
          }
        } else if (graceStatus === 'stopped' && server.status !== 'stopped') {
          // Stop server after 2 days of premium grace
          await updateDoc(doc(db, 'servers', server.id), { status: 'stopped' });
        } else if (server.plan === 'free' && isServerExpired(server) && server.status !== 'stopped') {
          // Stop free server immediately if expired
          await updateDoc(doc(db, 'servers', server.id), { status: 'stopped' });
        }
      }
    };

    checkExpirations();
  }, [servers, user, profile]);

  useEffect(() => {
    if (!isModalOpen) {
      setNewServerName('');
      setError('');
    }
  }, [isModalOpen]);

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !globalSettings) return;

    setError('');
    
    // Check global settings
    if (newServerPlan === 'free' && !globalSettings.allowFreePlans) {
      setError('الخطط المجانية غير متوفرة حالياً.');
      return;
    }
    if (newServerPlan === 'premium' && !globalSettings.allowPremiumPlans) {
      setError('الخطط المميزة غير متوفرة حالياً.');
      return;
    }

    // Check balance for premium
    const pricePerMonth = globalSettings.premiumPlanPrice || 300;
    const totalPrice = newServerPlan === 'premium' ? pricePerMonth * newServerDuration : 0;
    
    if (newServerPlan === 'premium' && (profile.balance || 0) < totalPrice) {
      setError(`رصيدك غير كافٍ. سعر الخطة المميزة هو ${totalPrice} EGP لـ ${newServerDuration} شهر.`);
      return;
    }

    if (newServerPlan === 'unlimited' && profile.role !== 'admin') {
      setError('هذه الخطة مخصصة للمشرفين فقط.');
      return;
    }

    // Check limits
    const userServersOfThisPlan = servers.filter(s => s.plan === newServerPlan);
    const planDetails = PLANS[newServerPlan];
    const serverLimit = newServerPlan === 'free' ? (globalSettings.maxFreeServers || 1) : planDetails.serverLimit;
    
    if (userServersOfThisPlan.length >= serverLimit) {
      setError(`لقد وصلت للحد الأقصى من الخوادم لهذه الخطة (${serverLimit} خادم).`);
      return;
    }

    setLoading(true);
    try {
      // Deduct balance if premium
      const pricePerMonth = globalSettings.premiumPlanPrice || 300;
      const totalPrice = newServerPlan === 'premium' ? pricePerMonth * newServerDuration : 0;

      if (newServerPlan === 'premium') {
        await updateDoc(doc(db, 'users', user.uid), {
          balance: (profile.balance || 0) - totalPrice
        });
      }

      const now = new Date();
      const expiresAt = newServerPlan === 'premium' 
        ? new Date(now.setMonth(now.getMonth() + newServerDuration))
        : null;

      const newServer: Omit<ServerInstance, 'id'> = {
        ownerId: user.uid,
        name: newServerName,
        language: newServerLang,
        version: newServerVersion,
        status: 'starting',
        plan: newServerPlan,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        cpu: 0,
        ram: 0,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt ? expiresAt : null,
        lastRenewedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'servers'), newServer);
      
      await updateDoc(doc(db, 'users', user.uid), {
        serverCount: (profile.serverCount || 0) + 1
      });
      await refreshProfile();

      setTimeout(async () => {
        await updateDoc(doc(db, 'servers', docRef.id), { status: 'running', cpu: Math.random() * 5, ram: Math.random() * 100 + 50 });
      }, 3000);

      setIsModalOpen(false);
      setNewServerName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleServerStatus = async (server: ServerInstance) => {
    const newStatus: ServerStatus = server.status === 'running' ? 'stopped' : 'running';
    await updateDoc(doc(db, 'servers', server.id), { 
      status: newStatus,
      cpu: newStatus === 'running' ? Math.random() * 5 : 0,
      ram: newStatus === 'running' ? Math.random() * 100 + 50 : 0
    });
  };

  const [deleteConfirm, setDeleteConfirm] = useState<ServerInstance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteServer = async () => {
    if (!user || !profile || !deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      // 1. Stop the server process if it's running
      if (deleteConfirm.status === 'running') {
        await fetch('/api/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serverId: deleteConfirm.id })
        }).catch(err => console.error('Failed to stop server before deletion:', err));
      }

      // 2. Delete all files associated with the server
      const filesSnapshot = await getDocs(collection(db, 'servers', deleteConfirm.id, 'files'));
      const deleteFilePromises = filesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteFilePromises);

      // 3. Delete all databases
      const dbSnapshot = await getDocs(collection(db, 'servers', deleteConfirm.id, 'databases'));
      const deleteDbPromises = dbSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteDbPromises);

      // 4. Delete all backups
      const backupSnapshot = await getDocs(collection(db, 'servers', deleteConfirm.id, 'backups'));
      const deleteBackupPromises = backupSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteBackupPromises);

      // 5. Delete the server document itself
      await deleteDoc(doc(db, 'servers', deleteConfirm.id));

      // 6. Update user server count
      await updateDoc(doc(db, 'users', user.uid), {
        serverCount: Math.max(0, (profile.serverCount || 0) - 1)
      });

      // 7. Log activity
      await addDoc(collection(db, 'activities'), {
        uid: user.uid,
        type: 'delete',
        description: `تم حذف السيرفر ${deleteConfirm.name} نهائياً`,
        createdAt: serverTimestamp()
      });

      await refreshProfile();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting server:', error);
      alert('حدث خطأ أثناء حذف السيرفر. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenewServer = async (server: ServerInstance) => {
    if (!user || !profile || !globalSettings) return;
    
    if (server.plan === 'premium') {
      const pricePerMonth = globalSettings.premiumPlanPrice || 300;
      if (profile.balance < pricePerMonth) {
        alert(`رصيدك غير كافٍ للتجديد (${pricePerMonth} EGP للشهر)`);
        return;
      }
      
      const currentExpiry = server.expiresAt?.toDate ? server.expiresAt.toDate() : new Date();
      const newExpiry = new Date(currentExpiry.setMonth(currentExpiry.getMonth() + 1));
      
      await updateDoc(doc(db, 'users', user.uid), {
        balance: profile.balance - pricePerMonth
      });
      await updateDoc(doc(db, 'servers', server.id), {
        expiresAt: newExpiry,
        status: 'running'
      });
      alert('تم تجديد السيرفر المميز لمدة شهر بنجاح!');
    } else {
      // Free renewal
      await updateDoc(doc(db, 'servers', server.id), {
        lastRenewedAt: serverTimestamp(),
        status: 'running'
      });
      alert('تم تجديد السيرفر المجاني لمدة 6 أيام بنجاح!');
    }
    await refreshProfile();
  };

  const isServerExpired = (server: ServerInstance) => {
    if (server.plan === 'unlimited') return false;
    const now = new Date();
    if (server.plan === 'premium') {
      if (!server.expiresAt) return false;
      const expiry = server.expiresAt.toDate ? server.expiresAt.toDate() : new Date(server.expiresAt);
      return now > expiry;
    } else {
      if (!server.lastRenewedAt) return false;
      const lastRenewed = server.lastRenewedAt.toDate ? server.lastRenewedAt.toDate() : new Date(server.lastRenewedAt);
      const sixDaysInMs = 6 * 24 * 60 * 60 * 1000;
      return now.getTime() - lastRenewed.getTime() > sixDaysInMs;
    }
  };

  const getGracePeriodStatus = (server: ServerInstance) => {
    if (!isServerExpired(server)) return null;
    const now = new Date();
    
    if (server.plan === 'premium') {
      const expiry = server.expiresAt.toDate ? server.expiresAt.toDate() : new Date(server.expiresAt);
      const diffDays = Math.floor((now.getTime() - expiry.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 5) return 'deleted'; // In reality we might delete it or just block it forever
      if (diffDays >= 2) return 'stopped';
      return 'grace';
    } else {
      const lastRenewed = server.lastRenewedAt.toDate ? server.lastRenewedAt.toDate() : new Date(server.lastRenewedAt);
      const sixDaysInMs = 6 * 24 * 60 * 60 * 1000;
      const expiry = new Date(lastRenewed.getTime() + sixDaysInMs);
      const diffDays = Math.floor((now.getTime() - expiry.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 1) return 'deleted';
      return 'grace';
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
        <div className="text-right">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2">لوحة التحكم</h1>
          <p className="text-gray-500 text-xs sm:text-base">إدارة الخوادم الافتراضية الخاصة بك وعمليات النشر.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {profile?.role === 'admin' && (
            <Link 
              to="/admin"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-center"
            >
              لوحة المشرف
            </Link>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" /> إنشاء سيرفر جديد
          </button>
        </div>
      </div>

      {globalSettings?.announcement && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-bold text-blue-400 mb-1">إعلان هام</h4>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{globalSettings.announcement}</p>
          </div>
        </motion.div>
      )}

      {/* Balance and Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
        {/* Balance Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/recharge')}
          className="col-span-2 sm:col-span-1 p-5 sm:p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl text-white cursor-pointer shadow-xl shadow-blue-600/20 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-16 h-16 sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-80">رصيد الحساب</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-2xl sm:text-4xl font-black mb-1">{profile?.balance || 0} EGP</div>
            <p className="text-[9px] sm:text-xs opacity-70">اضغط هنا لتعبئة الرصيد</p>
          </div>
        </motion.div>

        <div className="p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-2xl sm:rounded-3xl text-right">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Server className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <span className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">السيرفرات</span>
          </div>
          <div className="text-xl sm:text-3xl font-bold">{servers.length}</div>
          <p className="text-[9px] sm:text-xs text-gray-500 mt-1">{servers.filter(s => s.status === 'running').length} يعمل</p>
        </div>

        <div className="p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-3xl text-right">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            <span className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest text-right">المعالج</span>
          </div>
          <div className="text-xl sm:text-3xl font-bold">
            {servers.length > 0 
              ? (servers.reduce((acc, s) => acc + (s.cpu || 0), 0) / servers.length).toFixed(1) 
              : 0}%
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-3xl text-right">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <span className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">الخطة</span>
          </div>
          <div className="text-base sm:text-xl font-bold uppercase tracking-widest text-blue-400">
            {profile?.plan === 'unlimited' ? 'غير محدودة' : profile?.plan === 'premium' ? 'مميزة' : 'مجانية'}
          </div>
        </div>
      </div>

      {/* Server List */}
      <div className="space-y-4">
        <div className="hidden sm:flex items-center justify-between px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          <div className="flex-1 text-right">تفاصيل السيرفر</div>
          <div className="w-32 text-center">الحالة</div>
          <div className="w-48 text-center hidden md:block">الاستهلاك</div>
          <div className="w-32 text-left">الإجراءات</div>
        </div>

        {servers.length === 0 ? (
          <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
            <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد سيرفرات</h3>
            <p className="text-gray-500 mb-8 px-4">ابدأ بإنشاء أول سيرفر افتراضي لك الآن.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
            >
              إنشاء سيرفر
            </button>
          </div>
        ) : (
          servers.map((server) => (
            <motion.div
              layout
              key={server.id}
              className="group p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                  <Server className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {server.language}
                    </span>
                    <h3 className="font-bold truncate">{server.name}</h3>
                  </div>
                  <div className="text-xs text-gray-500 font-mono" dir="ltr">{server.ip}</div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-center w-full sm:w-32 py-2 sm:py-0 border-y sm:border-none border-white/5">
                <span className="sm:hidden text-[10px] font-bold text-gray-500 uppercase tracking-widest">الحالة</span>
                <div className="flex flex-col items-center gap-1">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    server.plan === 'unlimited' ? 'bg-purple-500/10 text-purple-500' :
                    isServerExpired(server) ? 'bg-red-500/10 text-red-500' :
                    server.status === 'running' ? 'bg-green-500/10 text-green-500' :
                    server.status === 'starting' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      server.plan === 'unlimited' ? 'bg-purple-500' :
                      isServerExpired(server) ? 'bg-red-500' :
                      server.status === 'running' ? 'bg-green-500 animate-pulse' :
                      server.status === 'starting' ? 'bg-yellow-500 animate-spin' :
                      'bg-red-500'
                    }`}></div>
                    {server.plan === 'unlimited' ? 'غير محدود' : isServerExpired(server) ? 'منتهي' : server.status === 'running' ? 'يعمل' : server.status === 'starting' ? 'جاري البدء' : 'متوقف'}
                  </span>
                  {isServerExpired(server) && (
                    <span className="text-[8px] text-red-400 font-bold">يجب التجديد</span>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-48 hidden md:flex items-center gap-4 px-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span>المعالج</span>
                    <span>{server.cpu?.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${server.cpu}%` }}></div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span>الذاكرة</span>
                    <span>{server.ram?.toFixed(0)}MB</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${(server.ram / 512) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-32 gap-2">
                <span className="sm:hidden text-[10px] font-bold text-gray-500 uppercase tracking-widest">الإجراءات</span>
                <div className="flex items-center gap-1">
                  {isServerExpired(server) ? (
                    <button
                      onClick={() => handleRenewServer(server)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all"
                    >
                      تجديد
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleServerStatus(server)}
                      className={`p-2 rounded-lg transition-all ${
                        server.status === 'running' ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'
                      }`}
                      title={server.status === 'running' ? 'إيقاف' : 'تشغيل'}
                    >
                      {server.status === 'running' ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  )}
                  <Link
                    to={`/server/${server.id}`}
                    className={`relative z-10 p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all ${isServerExpired(server) ? 'opacity-50 pointer-events-none' : ''}`}
                    title="إدارة السيرفر"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(server)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Server Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tighter">إنشاء سيرفر جديد</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateServer} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-right">اسم السيرفر</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                    placeholder="my-server"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-right">اختر اللغة</label>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {(['python', 'javascript', 'php'] as ServerLanguage[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setNewServerLang(lang)}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                          newServerLang === lang ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest">{lang}</span>
                      </button>
                    ))}
                  </div>
                  
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-right">اختر الإصدار</label>
                  <div className="grid grid-cols-3 gap-4">
                    {versions[newServerLang].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNewServerVersion(v)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          newServerVersion === v ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-right">اختر الخطة</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {(['free', 'premium', 'unlimited'] as Plan[]).filter(p => p !== 'unlimited' || profile?.role === 'admin').map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewServerPlan(p)}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                          newServerPlan === p ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {p === 'free' ? 'مجانية' : p === 'premium' ? 'مميزة' : 'غير محدودة'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {p === 'free' ? '0 EGP' : p === 'premium' ? `${globalSettings.premiumPlanPrice || 300} EGP / شهر` : 'للمشرفين'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {newServerPlan === 'premium' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-right">مدة السيرفر (بالأشهر)</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setNewServerDuration(m)}
                          className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                            newServerDuration === m ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-left text-xs text-blue-400 font-bold">
                      التكلفة الإجمالية: {newServerDuration * (globalSettings.premiumPlanPrice || 300)} EGP
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-600/5 border border-blue-600/20 rounded-xl text-right">
                  <div className="flex items-center gap-3 mb-2 justify-end">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">تفاصيل الخطة</span>
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    خطة <strong>{newServerPlan === 'free' ? 'المجانية' : newServerPlan === 'premium' ? 'المميزة' : 'غير المحدودة'}</strong> تتضمن {newServerPlan === 'free' ? '512 ميجا رام' : newServerPlan === 'premium' ? '4 جيجا رام' : 'موارد غير محدودة'} ومعالج {newServerPlan === 'free' ? 'مشترك' : 'مخصص'}.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? 'جاري التجهيز...' : 'تجهيز السيرفر'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-red-500/20 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter mb-4 text-white">تأكيد الحذف النهائي</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                هل أنت متأكد من حذف السيرفر <span className="text-red-400 font-bold">"{deleteConfirm.name}"</span>؟ 
                سيتم مسح جميع الملفات وقواعد البيانات والنسخ الاحتياطية نهائياً. لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteServer}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحذف...
                    </>
                  ) : (
                    'حذف السيرفر نهائياً'
                  )}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
