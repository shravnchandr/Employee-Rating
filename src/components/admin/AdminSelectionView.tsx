import React, { useState, useEffect } from 'react';
import { Star, ClipboardList, LogOut, Users, ShieldAlert, Calendar, X, RefreshCw, Key, Eye, EyeOff, Database, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { THEME } from '../../theme';
import { updaterApi } from '../../services/api';
import type { AppSettings } from '../../types';

interface AdminSelectionViewProps {
    onSelectRatings: () => void;
    onSelectTasks: () => void;
    onSelectEmployees: () => void;
    onSelectRules: () => void;
    onSelectAttendance: () => void;
    onSelectData: () => void;
    onLogout: () => void;
    onChangePassword: (newPassword: string) => void;
    lastRatingTimestamp: number | null;
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';

export const AdminSelectionView: React.FC<AdminSelectionViewProps> = ({
    onSelectRatings,
    onSelectTasks,
    onSelectEmployees,
    onSelectRules,
    onSelectAttendance,
    onSelectData,
    onLogout,
    onChangePassword,
    lastRatingTimestamp,
    settings,
    onUpdateSettings
}) => {
    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editExcellent, setEditExcellent] = useState(settings.attendanceExcellentThreshold);
    const [editGood, setEditGood] = useState(settings.attendanceGoodThreshold);
    const [settingsError, setSettingsError] = useState('');

    const handleSaveSettings = () => {
        if (editGood >= editExcellent) {
            setSettingsError('Good threshold must be lower than Excellent threshold.');
            return;
        }
        if (editExcellent > 100 || editGood < 0) {
            setSettingsError('Thresholds must be between 0 and 100.');
            return;
        }
        onUpdateSettings({ attendanceExcellentThreshold: editExcellent, attendanceGoodThreshold: editGood });
        setShowSettingsModal(false);
        setSettingsError('');
    };

    const openSettingsModal = () => {
        setEditExcellent(settings.attendanceExcellentThreshold);
        setEditGood(settings.attendanceGoodThreshold);
        setSettingsError('');
        setShowSettingsModal(true);
    };

    // Rating round tracking
    const monthsSinceLastRating = lastRatingTimestamp
        ? (Date.now() - lastRatingTimestamp) / (1000 * 60 * 60 * 24 * 30)
        : null;
    const showRatingBanner = monthsSinceLastRating === null || monthsSinceLastRating >= 3;
    const [ratingBannerDismissed, setRatingBannerDismissed] = useState(false);

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Update state
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
    const [updateVersion, setUpdateVersion] = useState<string>('');
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [updateError, setUpdateError] = useState<string>('');
    const [showNoUpdateMessage, setShowNoUpdateMessage] = useState(false);

    useEffect(() => {
        if (!updaterApi.isElectron()) return;

        updaterApi.onUpdateAvailable((info) => {
            setUpdateStatus('available');
            setUpdateVersion(info.version);
        });

        updaterApi.onUpdateNotAvailable(() => {
            if (updateStatus === 'checking') {
                setShowNoUpdateMessage(true);
                setTimeout(() => setShowNoUpdateMessage(false), 3000);
            }
            setUpdateStatus('idle');
        });

        updaterApi.onDownloadProgress((progress) => {
            setDownloadProgress(Math.round(progress.percent));
        });

        updaterApi.onUpdateDownloaded(() => {
            setUpdateStatus('ready');
        });

        updaterApi.onUpdateError((error) => {
            setUpdateStatus('error');
            setUpdateError(error);
        });

        return () => {
            updaterApi.removeUpdateListeners();
        };
    }, []);

    const handleCheckForUpdates = async () => {
        setUpdateStatus('checking');
        setUpdateError('');
        try {
            await updaterApi.checkForUpdates();
        } catch {
            setUpdateStatus('error');
            setUpdateError('Failed to check for updates');
        }
    };

    const handleDownloadUpdate = async () => {
        setUpdateStatus('downloading');
        setDownloadProgress(0);
        await updaterApi.downloadUpdate();
    };

    const handleInstallUpdate = () => {
        updaterApi.installUpdate();
    };

    const handlePasswordChange = () => {
        setPasswordError('');

        if (newPassword.length < 4) {
            setPasswordError('Password must be at least 4 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        onChangePassword(newPassword);
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 3000);
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordSuccess(false);
    };

    const renderUpdateBanner = () => {
        if (!updaterApi.isElectron()) return null;

        if (updateStatus === 'available') {
            return (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#0277BD] to-[#00ACC1] text-white py-3 px-4 flex items-center justify-center gap-4 z-50 shadow-lg">
                    <RefreshCw className="w-5 h-5" />
                    <span className={THEME.typography.bodyMedium}>
                        A new version ({updateVersion}) is available!
                    </span>
                    <button
                        onClick={handleDownloadUpdate}
                        className={`px-4 py-1.5 bg-white text-[#0277BD] hover:bg-gray-100 ${THEME.shapes.full} ${THEME.animation.spring} font-medium text-sm`}
                    >
                        Download Update
                    </button>
                </div>
            );
        }

        if (updateStatus === 'downloading') {
            return (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#0277BD] to-[#00ACC1] text-white py-3 px-4 z-50 shadow-lg">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className={THEME.typography.bodyMedium}>
                            Downloading update... {downloadProgress}%
                        </span>
                    </div>
                    <div className="max-w-md mx-auto bg-white/30 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-white h-full transition-all duration-300 ease-out"
                            style={{ width: `${downloadProgress}%` }}
                        />
                    </div>
                </div>
            );
        }

        if (updateStatus === 'ready') {
            return (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#00897B] to-[#00ACC1] text-white py-3 px-4 flex items-center justify-center gap-4 z-50 shadow-lg">
                    <RefreshCw className="w-5 h-5" />
                    <span className={THEME.typography.bodyMedium}>
                        Update downloaded! Restart to install.
                    </span>
                    <button
                        onClick={handleInstallUpdate}
                        className={`px-4 py-1.5 bg-white text-[#00897B] hover:bg-gray-100 ${THEME.shapes.full} ${THEME.animation.spring} font-medium text-sm`}
                    >
                        Restart & Install
                    </button>
                </div>
            );
        }

        if (updateStatus === 'error') {
            return (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#D32F2F] to-[#EF5350] text-white py-3 px-4 flex items-center justify-center gap-4 z-50 shadow-lg">
                    <X className="w-5 h-5" />
                    <span className={THEME.typography.bodyMedium}>
                        Update failed: {updateError}
                    </span>
                    <button
                        onClick={() => setUpdateStatus('idle')}
                        className={`px-4 py-1.5 bg-white text-[#D32F2F] hover:bg-gray-100 ${THEME.shapes.full} ${THEME.animation.spring} font-medium text-sm`}
                    >
                        Dismiss
                    </button>
                </div>
            );
        }

        if (updateStatus === 'checking') {
            return (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#0277BD] to-[#00ACC1] text-white py-3 px-4 flex items-center justify-center gap-4 z-50 shadow-lg">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className={THEME.typography.bodyMedium}>
                        Checking for updates...
                    </span>
                </div>
            );
        }

        if (showNoUpdateMessage) {
            return (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#00897B] to-[#00ACC1] text-white py-3 px-4 flex items-center justify-center gap-4 z-50 shadow-lg">
                    <RefreshCw className="w-5 h-5" />
                    <span className={THEME.typography.bodyMedium}>
                        You're running the latest version!
                    </span>
                </div>
            );
        }

        return null;
    };

    const bannerVisible = (updateStatus !== 'idle' || showNoUpdateMessage) && updaterApi.isElectron();

    return (
        <div className={`min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F1F8FB] to-[#B3E5FC] flex items-center justify-center p-6 relative overflow-hidden ${bannerVisible ? 'pt-20' : ''}`}>
            {renderUpdateBanner()}

            {/* Decorative background shapes */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#B3E5FC]/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00ACC1]/20 rounded-full blur-3xl"></div>

            <div className="max-w-4xl w-full animate-fade-in-up relative z-10">
                {/* Rating Round Banner */}
                {showRatingBanner && !ratingBannerDismissed && (
                    <div className={`bg-amber-50 border border-amber-200 ${THEME.shapes.extraLarge} px-5 py-4 mb-6 flex items-start gap-3`}>
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className={`${THEME.typography.labelLarge} text-amber-800`}>
                                {lastRatingTimestamp === null
                                    ? 'No ratings have been recorded yet. Consider starting a rating round.'
                                    : `It's been ${Math.floor(monthsSinceLastRating!)} month${Math.floor(monthsSinceLastRating!) !== 1 ? 's' : ''} since the last rating. Consider starting a new rating round.`}
                            </p>
                        </div>
                        <button
                            onClick={() => setRatingBannerDismissed(true)}
                            className="text-amber-500 hover:text-amber-700 shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="text-center mb-10">
                    <div className={`mx-auto w-28 h-28 bg-white ${THEME.shapes.asymmetric1} flex items-center justify-center mb-5 ${THEME.elevation.high} p-4`}>
                        <img src="./janhavi-logo.jpg" alt="Janhavi Medicals" className="w-full h-full object-contain" />
                    </div>
                    <h1 className={`${THEME.typography.headlineLarge} text-[#263238] mb-2`}>Admin Dashboard</h1>
                    <p className={`${THEME.typography.bodyLarge} text-[#37474F]`}>Select a module to continue</p>
                </div>

                {/* First Row - 3 cards */}
                <div className="grid md:grid-cols-3 gap-5 mb-5">
                    {/* Manage Employees Card */}
                    <button
                        onClick={onSelectEmployees}
                        className={`bg-white/95 backdrop-blur-sm p-6 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-14 h-14 bg-gradient-to-br from-[#263238] to-[#546E7A] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-4 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.titleLarge} text-[#263238] mb-1`}>Manage Employees</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                            Add or remove staff members
                        </p>
                    </button>

                    {/* Attendance Card */}
                    <button
                        onClick={onSelectAttendance}
                        className={`bg-white/95 backdrop-blur-sm p-6 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-14 h-14 bg-gradient-to-br from-[#7B1FA2] to-[#BA68C8] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-4 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.titleLarge} text-[#263238] mb-1`}>Attendance</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                            Track daily attendance
                        </p>
                    </button>

                    {/* Rules Compliance Card */}
                    <button
                        onClick={onSelectRules}
                        className={`bg-white/95 backdrop-blur-sm p-6 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-14 h-14 bg-gradient-to-br from-[#D32F2F] to-[#EF5350] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-4 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <ShieldAlert className="w-7 h-7 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.titleLarge} text-[#263238] mb-1`}>Rules Compliance</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                            Track rule violations
                        </p>
                    </button>
                </div>

                {/* Second Row - 3 cards */}
                <div className="grid md:grid-cols-3 gap-5 mb-8">
                    {/* Ratings Dashboard Card */}
                    <button
                        onClick={onSelectRatings}
                        className={`bg-white/95 backdrop-blur-sm p-6 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-14 h-14 bg-gradient-to-br from-[#0277BD] to-[#00ACC1] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-4 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <Star className="w-7 h-7 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.titleLarge} text-[#263238] mb-1`}>Employee Ratings</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                            Performance evaluations
                        </p>
                    </button>

                    {/* Daily Tasks Dashboard Card */}
                    <button
                        onClick={onSelectTasks}
                        className={`bg-white/95 backdrop-blur-sm p-6 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-14 h-14 bg-gradient-to-br from-[#00897B] to-[#00ACC1] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-4 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <ClipboardList className="w-7 h-7 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.titleLarge} text-[#263238] mb-1`}>Daily Tasks</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                            Assign and track tasks
                        </p>
                    </button>

                    {/* Data Management Card */}
                    <button
                        onClick={onSelectData}
                        className={`bg-white/95 backdrop-blur-sm p-6 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-14 h-14 bg-gradient-to-br from-[#1565C0] to-[#42A5F5] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-4 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <Database className="w-7 h-7 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.titleLarge} text-[#263238] mb-1`}>Data Management</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                            Export, backup & restore
                        </p>
                    </button>
                </div>

                {/* Password change success message */}
                {passwordSuccess && (
                    <p className={`${THEME.typography.bodyMedium} text-[#00897B] text-center mb-4`}>
                        Password changed successfully.
                    </p>
                )}

                {/* Bottom Buttons */}
                <div className="text-center flex justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#546E7A] text-white hover:bg-[#455A64] ${THEME.shapes.full} ${THEME.animation.spring} shadow-md hover:shadow-lg`}
                    >
                        <Key className="w-5 h-5" />
                        <span className={THEME.typography.labelLarge}>Change Password</span>
                    </button>
                    <button
                        onClick={openSettingsModal}
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#00897B] text-white hover:bg-[#00796B] ${THEME.shapes.full} ${THEME.animation.spring} shadow-md hover:shadow-lg`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        <span className={THEME.typography.labelLarge}>Attendance Settings</span>
                    </button>
                    {updaterApi.isElectron() && (
                        <button
                            onClick={handleCheckForUpdates}
                            disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                            className={`inline-flex items-center gap-2 px-6 py-3 bg-[#0277BD] text-white hover:bg-[#01579B] disabled:opacity-50 disabled:cursor-not-allowed ${THEME.shapes.full} ${THEME.animation.spring} shadow-md hover:shadow-lg`}
                        >
                            <RefreshCw className={`w-5 h-5 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                            <span className={THEME.typography.labelLarge}>Check for Updates</span>
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className={`inline-flex items-center gap-2 px-6 py-3 text-[#37474F] hover:text-[#0277BD] hover:bg-white/50 ${THEME.shapes.full} ${THEME.animation.spring}`}
                    >
                        <LogOut className="w-5 h-5" />
                        <span className={THEME.typography.labelLarge}>Logout</span>
                    </button>
                </div>
            </div>

            {/* Attendance Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={`bg-white ${THEME.shapes.extraLarge} ${THEME.elevation.high} max-w-md w-full p-6 animate-fade-in-up`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`${THEME.typography.headlineSmall} text-[#263238]`}>Attendance Score Settings</h2>
                            <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-[#37474F]" />
                            </button>
                        </div>

                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mb-5`}>
                            Set the minimum attendance % needed for each score level.
                        </p>

                        <div className="space-y-4 mb-5">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-xs font-bold shrink-0">3</span>
                                <label className={`${THEME.typography.labelLarge} text-[#37474F] w-36 shrink-0`}>Excellent — at least</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={editExcellent}
                                    onChange={(e) => { setEditExcellent(Number(e.target.value)); setSettingsError(''); }}
                                    className={`w-20 px-3 py-2 border border-gray-300 ${THEME.shapes.medium} text-center text-[#263238] font-bold focus:outline-none focus:ring-2 focus:ring-[#0277BD]`}
                                />
                                <span className={`${THEME.typography.bodyMedium} text-[#37474F]`}>% attendance</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#F57C00] flex items-center justify-center text-white text-xs font-bold shrink-0">2</span>
                                <label className={`${THEME.typography.labelLarge} text-[#37474F] w-36 shrink-0`}>Good — at least</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={editGood}
                                    onChange={(e) => { setEditGood(Number(e.target.value)); setSettingsError(''); }}
                                    className={`w-20 px-3 py-2 border border-gray-300 ${THEME.shapes.medium} text-center text-[#263238] font-bold focus:outline-none focus:ring-2 focus:ring-[#00897B]`}
                                />
                                <span className={`${THEME.typography.bodyMedium} text-[#37474F]`}>% attendance</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#D32F2F] flex items-center justify-center text-white text-xs font-bold shrink-0">1</span>
                                <span className={`${THEME.typography.labelLarge} text-[#37474F] w-36 shrink-0`}>Needs Improvement</span>
                                <span className={`${THEME.typography.bodyMedium} text-[#546E7A] italic`}>below {editGood}%</span>
                            </div>
                        </div>

                        {settingsError && <p className="text-red-500 text-sm mb-4">{settingsError}</p>}


                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className={`flex-1 px-4 py-3 border border-gray-300 text-[#37474F] hover:bg-gray-50 ${THEME.shapes.medium} ${THEME.animation.spring}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                className={`flex-1 px-4 py-3 bg-[#00897B] text-white hover:bg-[#00796B] ${THEME.shapes.medium} ${THEME.animation.spring} flex items-center justify-center gap-2`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={`bg-white ${THEME.shapes.extraLarge} ${THEME.elevation.high} max-w-md w-full p-6 animate-fade-in-up`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`${THEME.typography.headlineSmall} text-[#263238]`}>Change Password</h2>
                            <button
                                onClick={closePasswordModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-[#37474F]" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block ${THEME.typography.labelLarge} text-[#37474F] mb-2`}>
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className={`w-full px-4 py-3 pr-12 border border-gray-300 ${THEME.shapes.medium} focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#37474F] hover:text-[#0277BD]"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={`block ${THEME.typography.labelLarge} text-[#37474F] mb-2`}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        onKeyPress={(e) => e.key === 'Enter' && handlePasswordChange()}
                                        className={`w-full px-4 py-3 pr-12 border border-gray-300 ${THEME.shapes.medium} focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#37474F] hover:text-[#0277BD]"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {passwordError && (
                                <p className="text-red-500 text-sm">{passwordError}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closePasswordModal}
                                className={`flex-1 px-4 py-3 border border-gray-300 text-[#37474F] hover:bg-gray-50 ${THEME.shapes.medium} ${THEME.animation.spring}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className={`flex-1 px-4 py-3 bg-[#546E7A] text-white hover:bg-[#455A64] ${THEME.shapes.medium} ${THEME.animation.spring} flex items-center justify-center gap-2`}
                            >
                                <Key className="w-4 h-4" />
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
