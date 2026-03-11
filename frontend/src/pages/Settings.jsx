import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Camera, User, Mail, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import { Maximize2, Minimize2, ZoomIn } from 'lucide-react';

const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: -5, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1 bg-slate-800 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap z-50 pointer-events-none"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Settings = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const fileInputRef = useRef(null);

    const [profileData, setProfileData] = useState({
        name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        avatar_url: user?.user_metadata?.avatar_url || ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [imageSettings, setImageSettings] = useState({
        fit: 'cover', // 'cover' or 'contain'
        zoom: 1
    });

    // Check if user already has a local password set (we'll look for a metadata flag)
    const hasExistingPassword = user?.user_metadata?.has_password === true;

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { 
                    full_name: profileData.name,
                    avatar_url: profileData.avatar_url 
                }
            });

            if (error) throw error;
            
            setUser(data.user);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
            
            // Auto-update metadata
            await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });
            
            setMessage({ text: 'Avatar uploaded!', type: 'success' });
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Storage error. Using local preview only.', type: 'error' });
            // Fallback: use object URL if storage fails (common in new projects)
            setProfileData(prev => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
        } finally {
            setUploading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ text: 'Passwords do not match', type: 'error' });
        }

        if (passwordData.newPassword.length < 6) {
            return setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.updateUser({ 
                password: passwordData.newPassword,
                data: { has_password: true } // Mark that they now have a password
            });

            if (error) throw error;

            setUser(data.user);
            setMessage({ text: 'Password secured successfully!', type: 'success' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ text: err.message || 'Security update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-['Inter',sans-serif] p-4 lg:p-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto relative z-10"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 group bg-white/5 px-4 py-2 rounded-full border border-white/5"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
                        </button>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase font-outfit">
                            Account <span className="text-blue-500">Settings</span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium tracking-tight">Manage your profile and security protocols.</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {message.text && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-8 p-4 rounded-[24px] flex items-center gap-4 border backdrop-blur-xl ${
                                message.type === 'success' 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                        >
                            <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            </div>
                            <p className="text-sm font-bold uppercase tracking-wide">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 shadow-2xl">
                            <div className="flex flex-col items-center">
                                <div className="relative group mb-6">
                                    <div className="w-40 h-40 rounded-[32px] overflow-hidden border-4 border-white/5 shadow-2xl relative bg-slate-800">
                                        {profileData.avatar_url ? (
                                            <img 
                                                src={profileData.avatar_url} 
                                                alt="Profile" 
                                                className="w-full h-full transition-transform duration-300" 
                                                style={{ 
                                                    objectFit: imageSettings.fit,
                                                    transform: `scale(${imageSettings.zoom})`
                                                }} 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={48} className="text-slate-600" />
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="text-blue-500 animate-spin" size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-6 left-0 right-0 flex justify-center items-center gap-2">
                                        <button 
                                            onClick={() => setImageSettings(s => ({...s, fit: s.fit === 'cover' ? 'contain' : 'cover'}))}
                                            className="w-8 h-8 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center hover:text-white border border-white/10 transition-colors"
                                            title={imageSettings.fit === 'cover' ? 'Fit' : 'Fill'}
                                        >
                                            {imageSettings.fit === 'cover' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                        </button>
                                        <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-lg border border-white/10">
                                            <ZoomIn size={12} className="text-slate-500" />
                                            <input 
                                                type="range" 
                                                min="0.5" 
                                                max="2" 
                                                step="0.1" 
                                                value={imageSettings.zoom}
                                                onChange={(e) => setImageSettings(s => ({...s, zoom: parseFloat(e.target.value)}))}
                                                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute top-0 -right-2 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xl flex items-center justify-center transition-all border-4 border-slate-950 group-hover:scale-110"
                                    >
                                        <Camera size={18} />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleAvatarUpload}
                                    />
                                </div>

                                <div className="w-full space-y-6">
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operative Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                                <input 
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Core Identity (Email)</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                                <input 
                                                    type="email"
                                                    disabled
                                                    value={user?.email}
                                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-slate-500 text-sm cursor-not-allowed font-outfit"
                                                />
                                            </div>
                                        </div>
                                        <Tooltip text="Save">
                                            <button 
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-3.5 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16}/> Save Changes</>}
                                            </button>
                                        </Tooltip>
                                    </form>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Security Cards */}
                    <div className="lg:col-span-3 space-y-8">
                        <section className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Shield size={120} />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-outfit">Security Protocols</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Authentication management & encryption</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                {hasExistingPassword && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-1">Current Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                                            <input 
                                                type="password" 
                                                required
                                                placeholder="Verification required"
                                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit"
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-1">New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                                            <input 
                                                type="password" 
                                                required
                                                placeholder="Min. 6 chars"
                                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-1">Repeat Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                                            <input 
                                                type="password" 
                                                required
                                                placeholder="Match new"
                                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-outfit"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Tooltip text={hasExistingPassword ? 'Change' : 'Set'}>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-700 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-xs font-outfit"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            hasExistingPassword ? 'Update Password' : 'Set Password'
                                        )}
                                    </button>
                                </Tooltip>
                            </form>
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Settings;
