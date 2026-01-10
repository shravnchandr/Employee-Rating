import React from 'react';
import { Shield, Plus, Check, Upload, Users, Award, TrendingUp, History, X, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { THEME } from '../../theme';
import { FloatingLabelInput } from '../common/FloatingLabelInput';
import { TrendsView } from '../trends/TrendsView';
import { GivenRatingsView } from '../history/GivenRatingsView';
import type { Employee, Rating } from '../../types';

interface AdminDashboardProps {
    employees: Employee[];
    ratings: Rating[];
    newEmployeeName: string;
    setNewEmployeeName: (name: string) => void;
    newEmployeePhoto: string;
    handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addEmployee: () => void;
    removeEmployee: (id: number) => void;
    startAdminRating: () => void;
    startRatingForEmployee: (e: Employee) => void;
    onLogout: () => void;
    viewTrendsFor: number | null;
    setViewTrendsFor: (id: number | null) => void;
    viewHistoryFor: number | null;
    setViewHistoryFor: (id: number | null) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    employees,
    ratings,
    newEmployeeName,
    setNewEmployeeName,
    newEmployeePhoto,
    handlePhotoUpload,
    addEmployee,
    removeEmployee,
    startAdminRating,
    startRatingForEmployee,
    onLogout,
    viewTrendsFor,
    setViewTrendsFor,
    viewHistoryFor,
    setViewHistoryFor
}) => {

    const [showSensitiveData, setShowSensitiveData] = React.useState(false);
    const [showUnlockModal, setShowUnlockModal] = React.useState(false);
    const [unlockPassword, setUnlockPassword] = React.useState('');
    const [showPasswordInput, setShowPasswordInput] = React.useState(false);
    const [passwordError, setPasswordError] = React.useState('');

    const [pendingAction, setPendingAction] = React.useState<'rate' | null>(null);

    const handleUnlock = () => {
        if (unlockPassword === 'admin123') {
            setShowSensitiveData(true);
            setShowUnlockModal(false);
            setUnlockPassword('');
            setPasswordError('');

            if (pendingAction === 'rate') {
                startAdminRating();
                setPendingAction(null);
            }
        } else {
            setPasswordError('Incorrect password');
        }
    };

    const handleRateAsAdminClick = () => {
        if (showSensitiveData) {
            startAdminRating();
        } else {
            setPendingAction('rate');
            setShowUnlockModal(true);
        }
    };

    const toggleSensitiveData = () => {
        if (showSensitiveData) {
            setShowSensitiveData(false);
        } else {
            setShowUnlockModal(true);
        }
    };

    const calculateWeightedScore = (employeeId: number) => {
        const adminRatings = ratings.filter(r => r.ratedEmployeeId === employeeId && r.isAdminRating);
        const peerRatings = ratings.filter(r => r.ratedEmployeeId === employeeId && !r.isAdminRating);
        const values: Record<string, number> = { 'Needs Improvement': 1, 'Good': 2, 'Excellent': 3 };

        let adminScore = 0;
        if (adminRatings.length > 0) {
            adminScore = adminRatings.reduce((acc, r) => acc + (values[r.rating] || 0), 0) / adminRatings.length;
        }

        let peerScore = 0;
        if (peerRatings.length > 0) {
            peerScore = peerRatings.reduce((acc, r) => acc + (values[r.rating] || 0), 0) / peerRatings.length;
        }

        if (adminRatings.length === 0 && peerRatings.length === 0) return { weighted: 0, admin: 0, peer: 0, hasAdminRating: false, hasPeerRating: false };
        if (adminRatings.length > 0 && peerRatings.length === 0) return { weighted: adminScore.toFixed(2), admin: adminScore.toFixed(2), peer: 0, hasAdminRating: true, hasPeerRating: false };
        if (adminRatings.length === 0 && peerRatings.length > 0) return { weighted: peerScore.toFixed(2), admin: 0, peer: peerScore.toFixed(2), hasAdminRating: false, hasPeerRating: true };

        return {
            weighted: ((adminScore * 0.6) + (peerScore * 0.4)).toFixed(2),
            admin: adminScore.toFixed(2),
            peer: peerScore.toFixed(2),
            hasAdminRating: true,
            hasPeerRating: true
        };
    };

    return (
        <div className="min-h-screen bg-[#F1F8FB] p-6 lg:p-10 relative">
            <div className="max-w-[1400px] mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="animate-fade-in-right flex items-center gap-4">
                        <img src="/janhavi-logo.jpg" alt="Janhavi Medicals" className="w-16 h-16 object-contain" />
                        <div>
                            <h1 className={`${THEME.typography.displayMedium} text-[#263238]`}>Janhavi Medicals</h1>
                            <p className={`${THEME.typography.bodyLarge} text-[#37474F] mt-1`}>Employee Performance Dashboard</p>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap animate-fade-in-left">
                        <button
                            onClick={toggleSensitiveData}
                            className={`px-5 py-3.5 ${THEME.shapes.pill} flex items-center gap-2 ${THEME.animation.spring} ${THEME.typography.labelLarge} text-sm md:text-base ${THEME.elevation.low} hover:${THEME.elevation.medium} ${showSensitiveData
                                ? 'bg-[#B2DFDB] text-[#004D40]'
                                : 'bg-[#263238] text-white hover:bg-[#263238]/90'}`}
                        >
                            {showSensitiveData ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            {showSensitiveData ? 'Data Visible' : 'Show Data'}
                        </button>

                        <button
                            onClick={handleRateAsAdminClick}
                            className={`${THEME.colors.primaryContainer} ${THEME.shapes.asymmetric3} px-6 py-3.5 flex items-center gap-2 ${THEME.elevation.low} hover:${THEME.elevation.medium} ${THEME.animation.spring} ${THEME.typography.labelLarge} text-sm md:text-base hover:scale-105`}
                        >
                            <Shield className="w-5 h-5" />
                            Rate as Admin
                        </button>
                        <button
                            onClick={onLogout}
                            className={`border-2 border-[#546E7A] text-[#0277BD] ${THEME.shapes.full} px-6 py-3.5 hover:bg-[#CFE9F3] ${THEME.animation.spring} ${THEME.typography.labelLarge} text-sm md:text-base hover:border-[#0277BD]`}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add Employee Card */}
                    <div className={`lg:col-span-4 bg-gradient-to-br from-[#CFE9F3] to-[#B3E5FC]/50 ${THEME.shapes.asymmetric1} p-8 ${THEME.elevation.medium} h-fit sticky top-6`}>
                        <h2 className={`${THEME.typography.headlineMedium} mb-8 text-[#263238]`}>Add Employee</h2>
                        <div className="space-y-6">
                            <FloatingLabelInput
                                value={newEmployeeName}
                                onChange={(e) => setNewEmployeeName(e.target.value)}
                                placeholder="Full Name"
                                onKeyPress={(e) => e.key === 'Enter' && addEmployee()}
                            />

                            <div className="flex flex-col gap-4">
                                <label className={`w-full cursor-pointer bg-white border border-[#B0BEC5] border-dashed ${THEME.shapes.medium} p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#F1F8FB] hover:border-[#0277BD] transition-all relative group overflow-hidden`}>
                                    {newEmployeePhoto ? (
                                        <div className="relative">
                                            <img src={newEmployeePhoto} alt="Preview" className="w-20 h-20 object-cover rounded-full shadow-md aspect-square" />
                                            <div className="absolute -bottom-2 -right-2 bg-[#B3E5FC] p-1.5 rounded-full shadow-sm">
                                                <Check className="w-3 h-3 text-[#01579B]" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-[#B2DFDB] p-3 rounded-full group-hover:bg-[#B3E5FC] transition-colors">
                                                <Upload className="w-6 h-6 text-[#004D40] group-hover:text-[#01579B]" />
                                            </div>
                                            <span className={`${THEME.typography.labelLarge} text-[#37474F] group-hover:text-[#0277BD]`}>Upload Photo</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                </label>

                                <button
                                    onClick={addEmployee}
                                    className={`${THEME.colors.primary} ${THEME.shapes.full} py-3.5 px-6 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all font-medium`}
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Employee
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-8 space-y-4">
                        {employees.length === 0 ? (
                            <div className={`text-center py-20 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3] flex flex-col items-center justify-center`}>
                                <div className="w-20 h-20 bg-[#CFE9F3] rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-8 h-8 text-[#37474F]" />
                                </div>
                                <h3 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>No Employees Yet</h3>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F] max-w-xs mx-auto`}>Add your first employee from the panel on the left.</p>
                            </div>
                        ) : (
                            employees.map((emp, idx) => {
                                const scores = calculateWeightedScore(emp.id);

                                return (
                                    <div
                                        key={emp.id}
                                        className={`bg-white ${THEME.shapes.asymmetric2} p-6 ${THEME.elevation.low} border-2 border-[#CFE9F3] hover:${THEME.elevation.high} hover:border-[#0277BD]/30 ${THEME.animation.spring} hover:scale-[1.02] flex flex-col sm:flex-row gap-6 items-center animate-fade-in-up`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="relative shrink-0">
                                            {emp.photo ? (
                                                <img src={emp.photo} alt={emp.name} className="w-16 h-16 rounded-full object-cover shadow-sm bg-gray-50 aspect-square" />
                                            ) : (
                                                <div className={`w-16 h-16 rounded-full ${emp.avatar} flex items-center justify-center text-white text-xl font-bold shadow-sm aspect-square`}>
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="absolute -top-2 -right-2 bg-[#B3E5FC] text-[#01579B] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">
                                                RANK {idx + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full text-center sm:text-left">
                                            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                                                <h3 className={`${THEME.typography.titleLarge} text-[#263238] truncate`}>{emp.name}</h3>
                                                <div className="bg-[#E0E0E0] text-[#37474F] px-2 py-0.5 rounded-[4px] text-xs font-medium">#{emp.id.toString().slice(-4)}</div>
                                            </div>

                                            {showSensitiveData ? (
                                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0277BD]/5 text-[#0277BD] rounded-[8px] text-sm font-medium border border-[#B3E5FC]">
                                                        <Award className="w-3.5 h-3.5" />
                                                        Score: {scores.weighted}
                                                    </span>
                                                    {scores.hasAdminRating && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B2DFDB] text-[#004D40] rounded-[8px] text-xs font-medium">
                                                            Admin: {scores.admin}
                                                        </span>
                                                    )}
                                                    {scores.hasPeerRating && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFCDD2] text-[#B71C1C] rounded-[8px] text-xs font-medium">
                                                            Peer: {scores.peer}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E0E0E0] text-[#37474F] rounded-[8px] text-sm font-medium border border-[#CFE9F3]">
                                                        <Lock className="w-3.5 h-3.5" />
                                                        Score Hidden
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0 flex-wrap justify-center sm:justify-start">
                                            <button
                                                onClick={() => startRatingForEmployee(emp)}
                                                className={`${THEME.colors.primary} ${THEME.shapes.full} px-6 py-2.5 text-sm font-medium hover:shadow-md transition-all flex items-center gap-2`}
                                            >
                                                <Award className="w-4 h-4" /> Rate
                                            </button>

                                            {showSensitiveData && (
                                                <>
                                                    <button
                                                        onClick={() => setViewTrendsFor(emp.id)}
                                                        className={`${THEME.colors.secondaryContainer} ${THEME.shapes.full} px-4 py-2.5 text-sm font-medium hover:shadow-md transition-all text-[#004D40] flex items-center gap-2`}
                                                        title="View Trends"
                                                    >
                                                        <TrendingUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setViewHistoryFor(emp.id)}
                                                        className={`${THEME.colors.surfaceVariant} ${THEME.shapes.full} px-4 py-2.5 text-sm font-medium hover:shadow-md transition-all text-[#37474F] flex items-center gap-2`}
                                                        title="View Given Ratings"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => removeEmployee(emp.id)}
                                                className={`text-[#D32F2F] bg-[#FFCDD2]/10 hover:bg-[#FFCDD2]/30 ${THEME.shapes.full} px-4 py-2.5 text-sm font-medium transition-colors`}
                                                title="Remove Employee"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {viewTrendsFor && (
                <TrendsView
                    employeeId={viewTrendsFor}
                    ratings={ratings}
                    onClose={() => setViewTrendsFor(null)}
                />
            )}

            {viewHistoryFor && (
                <GivenRatingsView
                    raterId={viewHistoryFor}
                    ratings={ratings}
                    employees={employees}
                    onClose={() => setViewHistoryFor(null)}
                />
            )}

            {/* Unlock Dialog */}
            {showUnlockModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm animate-fade-in">
                    <div className={`bg-white ${THEME.shapes.extraLarge} w-full max-w-sm p-6 shadow-2xl flex flex-col`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`${THEME.typography.headlineSmall} text-[#263238]`}>Unlock Data</h3>
                            <button
                                onClick={() => { setShowUnlockModal(false); setUnlockPassword(''); setPasswordError(''); }}
                                className="p-2 hover:bg-[#CFE9F3] rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-[#37474F]" />
                            </button>
                        </div>

                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mb-6`}>
                            Enter admin password to view scores and history.
                        </p>

                        <div className="relative mb-2">
                            <input
                                type={showPasswordInput ? "text" : "password"}
                                value={unlockPassword}
                                onChange={(e) => { setUnlockPassword(e.target.value); setPasswordError(''); }}
                                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                                placeholder="Admin Password"
                                className={`w-full h-[56px] px-4 bg-[#CFE9F3] rounded-t-[4px] border-b ${passwordError ? 'border-[#D32F2F]' : 'border-[#37474F]'} focus:border-b-2 ${passwordError ? 'focus:border-[#D32F2F]' : 'focus:border-[#0277BD]'} outline-none text-[#263238] text-base placeholder-[#37474F]`}
                                autoFocus
                            />
                            <button
                                onClick={() => setShowPasswordInput(!showPasswordInput)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#37474F] p-2 hover:bg-[#CFE9F3] rounded-full"
                            >
                                {showPasswordInput ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {passwordError && (
                            <p className="text-[#D32F2F] text-sm mb-4 px-4">{passwordError}</p>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => { setShowUnlockModal(false); setUnlockPassword(''); setPasswordError(''); }}
                                className="text-[#0277BD] font-medium px-4 py-2.5 hover:bg-[#CFE9F3] rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnlock}
                                className={`${THEME.colors.primary} px-6 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all`}
                            >
                                Unlock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
