import React, { useState, useEffect } from 'react';
import { Star, ClipboardList, LogOut, Users, ShieldAlert, Calendar, Download, X, RefreshCw, Key, Eye, EyeOff } from 'lucide-react';
import { THEME } from '../../theme';
import { updaterApi } from '../../services/api';

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

interface AdminSelectionViewProps {
    onSelectRatings: () => void;
    onSelectTasks: () => void;
    onSelectEmployees: () => void;
    onSelectRules: () => void;
    onSelectAttendance: () => void;
    onExport: (dateRange?: DateRange) => void;
    onLogout: () => void;
    onChangePassword: (newPassword: string) => void;
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';

export const AdminSelectionView: React.FC<AdminSelectionViewProps> = ({
    onSelectRatings,
    onSelectTasks,
    onSelectEmployees,
    onSelectRules,
    onSelectAttendance,
    onExport,
    onLogout,
    onChangePassword
}) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Update state
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
    const [updateVersion, setUpdateVersion] = useState<string>('');
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [updateError, setUpdateError] = useState<string>('');

    useEffect(() => {
        if (!updaterApi.isElectron()) return;

        // Set up update event listeners
        updaterApi.onUpdateAvailable((info) => {
            setUpdateStatus('available');
            setUpdateVersion(info.version);
        });

        updaterApi.onUpdateNotAvailable(() => {
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

        // Cleanup listeners on unmount
        return () => {
            updaterApi.removeUpdateListeners();
        };
    }, []);

    const handleDownloadUpdate = async () => {
        setUpdateStatus('downloading');
        setDownloadProgress(0);
        await updaterApi.downloadUpdate();
    };

    const handleInstallUpdate = () => {
        updaterApi.installUpdate();
    };

    const handleExport = () => {
        const dateRange = (startDate || endDate)
            ? { startDate: startDate || null, endDate: endDate || null }
            : undefined;
        onExport(dateRange);
        setShowExportModal(false);
        setStartDate('');
        setEndDate('');
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
        alert('Password changed successfully!');
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
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

        return null;
    };

    const bannerVisible = updateStatus !== 'idle' && updateStatus !== 'checking' && updaterApi.isElectron();

    return (
        <div className={`min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F1F8FB] to-[#B3E5FC] flex items-center justify-center p-6 relative overflow-hidden ${bannerVisible ? 'pt-20' : ''}`}>
            {renderUpdateBanner()}

            {/* Decorative background shapes */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#B3E5FC]/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00ACC1]/20 rounded-full blur-3xl"></div>

            <div className="max-w-4xl w-full animate-fade-in-up relative z-10">
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

                {/* Second Row - 2 cards centered */}
                <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-8">
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
                            Performance evaluations and analytics
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
                            Assign tasks and track completion
                        </p>
                    </button>
                </div>

                {/* Export, Change Password & Logout Buttons */}
                <div className="text-center flex justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#00897B] text-white hover:bg-[#00796B] ${THEME.shapes.full} ${THEME.animation.spring} shadow-md hover:shadow-lg`}
                    >
                        <Download className="w-5 h-5" />
                        <span className={THEME.typography.labelLarge}>Export to Excel</span>
                    </button>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#546E7A] text-white hover:bg-[#455A64] ${THEME.shapes.full} ${THEME.animation.spring} shadow-md hover:shadow-lg`}
                    >
                        <Key className="w-5 h-5" />
                        <span className={THEME.typography.labelLarge}>Change Password</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className={`inline-flex items-center gap-2 px-6 py-3 text-[#37474F] hover:text-[#0277BD] hover:bg-white/50 ${THEME.shapes.full} ${THEME.animation.spring}`}
                    >
                        <LogOut className="w-5 h-5" />
                        <span className={THEME.typography.labelLarge}>Logout</span>
                    </button>
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`bg-white ${THEME.shapes.extraLarge} ${THEME.elevation.high} max-w-md w-full p-6 animate-fade-in-up`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`${THEME.typography.headlineSmall} text-[#263238]`}>Export Data</h2>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-[#37474F]" />
                            </button>
                        </div>

                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mb-4`}>
                            Optionally select a date range to filter exported data. Leave empty to export all data.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block ${THEME.typography.labelLarge} text-[#37474F] mb-2`}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`w-full px-4 py-3 border border-gray-300 ${THEME.shapes.medium} focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent`}
                                />
                            </div>
                            <div>
                                <label className={`block ${THEME.typography.labelLarge} text-[#37474F] mb-2`}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || undefined}
                                    className={`w-full px-4 py-3 border border-gray-300 ${THEME.shapes.medium} focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent`}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className={`flex-1 px-4 py-3 border border-gray-300 text-[#37474F] hover:bg-gray-50 ${THEME.shapes.medium} ${THEME.animation.spring}`}
                            >
                                Clear Dates
                            </button>
                            <button
                                onClick={handleExport}
                                className={`flex-1 px-4 py-3 bg-[#00897B] text-white hover:bg-[#00796B] ${THEME.shapes.medium} ${THEME.animation.spring} flex items-center justify-center gap-2`}
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
