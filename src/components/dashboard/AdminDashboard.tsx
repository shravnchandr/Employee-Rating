import React from 'react';
import { Shield, Users, Award, TrendingUp, History, X, Lock, Unlock, Eye, EyeOff, ArrowLeft, Calendar, Search, BarChart3, Star, UserCheck, Settings, Plus, Trash2 } from 'lucide-react';
import { THEME } from '../../theme';
import { TrendsView } from '../trends/TrendsView';
import { GivenRatingsView } from '../history/GivenRatingsView';
import type { Employee, Rating, MonthlyLeaveRecord } from '../../types';

interface AdminDashboardProps {
    employees: Employee[];
    ratings: Rating[];
    monthlyLeaves: MonthlyLeaveRecord[];
    verifyPassword: (password: string) => Promise<boolean>;
    startAdminRating: () => void;
    startRatingForEmployee: (e: Employee) => void;
    onBack: () => void;
    viewTrendsFor: number | null;
    setViewTrendsFor: (id: number | null) => void;
    viewHistoryFor: number | null;
    setViewHistoryFor: (id: number | null) => void;
    categories: string[];
    onAddCategory: (category: string) => void;
    onRemoveCategory: (category: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    employees,
    ratings,
    monthlyLeaves,
    verifyPassword,
    startAdminRating,
    startRatingForEmployee,
    onBack,
    viewTrendsFor,
    setViewTrendsFor,
    viewHistoryFor,
    setViewHistoryFor,
    categories,
    onAddCategory,
    onRemoveCategory
}) => {

    const [showSensitiveData, setShowSensitiveData] = React.useState(false);
    const [showUnlockModal, setShowUnlockModal] = React.useState(false);
    const [unlockPassword, setUnlockPassword] = React.useState('');
    const [showPasswordInput, setShowPasswordInput] = React.useState(false);
    const [passwordError, setPasswordError] = React.useState('');
    const [isVerifying, setIsVerifying] = React.useState(false);

    const [pendingAction, setPendingAction] = React.useState<'rate' | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Category management state
    const [showCategoryModal, setShowCategoryModal] = React.useState(false);
    const [newCategory, setNewCategory] = React.useState('');

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            const trimmed = newCategory.trim();
            if (!categories.includes(trimmed)) {
                onAddCategory(trimmed);
                setNewCategory('');
            } else {
                alert('This category already exists');
            }
        }
    };

    const handleRemoveCategory = (category: string) => {
        if (confirm(`Are you sure you want to remove "${category}"? This will not delete existing ratings.`)) {
            onRemoveCategory(category);
        }
    };

    const handleUnlock = async () => {
        setIsVerifying(true);
        try {
            const isValid = await verifyPassword(unlockPassword);
            if (isValid) {
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
        } finally {
            setIsVerifying(false);
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

    // Calculate attendance score (1-3 scale based on leaves taken vs allocated)
    const calculateAttendanceScore = (employeeId: number) => {
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return { score: 0, hasData: false, leavesTaken: 0, leavesAllocated: 0 };

        const employeeLeaves = monthlyLeaves.filter(l => l.employeeId === employeeId);
        if (employeeLeaves.length === 0) return { score: 3, hasData: false, leavesTaken: 0, leavesAllocated: 0 }; // Perfect score if no leave data

        let totalAllocated = 0;
        let totalTaken = 0;

        employeeLeaves.forEach(record => {
            totalAllocated += record.allocatedLeaves || employee.leavesPerMonth || 3;
            totalTaken += record.leavesTaken || 0;
        });

        if (totalAllocated === 0) return { score: 3, hasData: true, leavesTaken: totalTaken, leavesAllocated: totalAllocated };

        // Calculate attendance percentage (0-100%)
        const attendancePercentage = Math.max(0, Math.min(100, ((totalAllocated - totalTaken) / totalAllocated) * 100));

        // Convert to 1-3 scale: 90%+ = 3, 70-90% = 2, <70% = 1
        let score = 1;
        if (attendancePercentage >= 90) score = 3;
        else if (attendancePercentage >= 70) score = 2;

        return { score, hasData: true, leavesTaken: totalTaken, leavesAllocated: totalAllocated };
    };

    // Weighted scoring: 50% attendance, 30% admin ratings, 20% peer ratings
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

        const attendance = calculateAttendanceScore(employeeId);
        const hasAdminRating = adminRatings.length > 0;
        const hasPeerRating = peerRatings.length > 0;

        // Calculate weighted score based on available data
        // Weightage: 50% attendance, 30% admin, 20% peer
        let weightedScore = 0;
        let totalWeight = 0;

        // Always include attendance (50% weight)
        weightedScore += attendance.score * 0.5;
        totalWeight += 0.5;

        if (hasAdminRating) {
            weightedScore += adminScore * 0.3;
            totalWeight += 0.3;
        }

        if (hasPeerRating) {
            weightedScore += peerScore * 0.2;
            totalWeight += 0.2;
        }

        // Normalize the score if not all components are available
        if (totalWeight > 0 && totalWeight < 1) {
            weightedScore = weightedScore / totalWeight;
        }

        return {
            weighted: weightedScore > 0 ? weightedScore.toFixed(2) : 0,
            weightedNum: weightedScore,
            admin: hasAdminRating ? adminScore.toFixed(2) : 0,
            peer: hasPeerRating ? peerScore.toFixed(2) : 0,
            attendance: attendance.score.toFixed(2),
            hasAdminRating,
            hasPeerRating,
            hasAttendance: attendance.hasData
        };
    };

    // Filter and sort employees by weighted score (highest first)
    const sortedEmployees = React.useMemo(() => {
        const filtered = searchQuery.trim()
            ? employees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : employees;
        return [...filtered].sort((a, b) => {
            const scoreA = calculateWeightedScore(a.id).weightedNum;
            const scoreB = calculateWeightedScore(b.id).weightedNum;
            return scoreB - scoreA;
        });
    }, [employees, ratings, monthlyLeaves, searchQuery]);

    // Dashboard statistics (uses filtered employees when searching)
    const stats = React.useMemo(() => {
        const displayedEmployees = sortedEmployees; // Already filtered by search
        const totalEmployees = employees.length;
        const displayedCount = displayedEmployees.length;

        // Calculate ratings for displayed employees only
        const displayedEmployeeIds = new Set(displayedEmployees.map(e => e.id));
        const filteredRatings = searchQuery.trim()
            ? ratings.filter(r => displayedEmployeeIds.has(r.ratedEmployeeId))
            : ratings;
        const totalRatings = filteredRatings.length;
        const adminRatingsCount = filteredRatings.filter(r => r.isAdminRating).length;
        const peerRatingsCount = filteredRatings.filter(r => !r.isAdminRating).length;

        // Calculate average score across displayed employees
        let totalScore = 0;
        let employeesWithScore = 0;
        displayedEmployees.forEach(emp => {
            const score = calculateWeightedScore(emp.id);
            if (score.weightedNum > 0) {
                totalScore += score.weightedNum;
                employeesWithScore++;
            }
        });
        const avgScore = employeesWithScore > 0 ? (totalScore / employeesWithScore).toFixed(2) : '0';

        // Top performer from displayed employees
        const topPerformer = displayedEmployees.length > 0 && calculateWeightedScore(displayedEmployees[0].id).weightedNum > 0
            ? displayedEmployees[0]
            : null;

        return {
            totalEmployees,
            displayedCount,
            totalRatings,
            adminRatingsCount,
            peerRatingsCount,
            avgScore,
            topPerformer,
            employeesWithScore,
            isFiltered: searchQuery.trim().length > 0
        };
    }, [employees, ratings, sortedEmployees, searchQuery]);

    return (
        <div className="min-h-screen bg-[#F1F8FB] p-6 lg:p-10 relative">
            <div className="max-w-[1200px] mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="animate-fade-in-right flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className={`p-3 hover:bg-white ${THEME.shapes.full} ${THEME.animation.spring} ${THEME.elevation.low}`}
                        >
                            <ArrowLeft className="w-6 h-6 text-[#37474F]" />
                        </button>
                        <img src="./janhavi-logo.jpg" alt="Janhavi Medicals" className="w-16 h-16 object-contain" />
                        <div>
                            <h1 className={`${THEME.typography.displayMedium} text-[#263238]`}>Employee Ratings</h1>
                            <p className={`${THEME.typography.bodyLarge} text-[#37474F] mt-1`}>Performance evaluations and analytics</p>
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
                            onClick={() => setShowCategoryModal(true)}
                            className={`px-5 py-3.5 ${THEME.shapes.pill} flex items-center gap-2 ${THEME.animation.spring} ${THEME.typography.labelLarge} text-sm md:text-base bg-[#7B1FA2] text-white hover:bg-[#6A1B9A] ${THEME.elevation.low} hover:${THEME.elevation.medium}`}
                            title="Manage Rating Categories"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="hidden md:inline">Categories</span>
                        </button>

                        <button
                            onClick={handleRateAsAdminClick}
                            className={`${THEME.colors.primaryContainer} ${THEME.shapes.asymmetric3} px-6 py-3.5 flex items-center gap-2 ${THEME.elevation.low} hover:${THEME.elevation.medium} ${THEME.animation.spring} ${THEME.typography.labelLarge} text-sm md:text-base hover:scale-105`}
                        >
                            <Shield className="w-5 h-5" />
                            Rate as Admin
                        </button>
                    </div>
                </header>

                {/* Statistics Cards */}
                {showSensitiveData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
                        <div className={`bg-white ${THEME.shapes.medium} p-4 ${THEME.elevation.low} border border-[#CFE9F3]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-[#0277BD]" />
                                <span className={`${THEME.typography.labelLarge} text-[#37474F]`}>Employees</span>
                            </div>
                            <p className={`${THEME.typography.headlineMedium} text-[#263238]`}>
                                {stats.isFiltered ? `${stats.displayedCount}/${stats.totalEmployees}` : stats.totalEmployees}
                            </p>
                            {stats.isFiltered && (
                                <p className="text-xs text-[#0277BD]">filtered</p>
                            )}
                        </div>

                        <div className={`bg-white ${THEME.shapes.medium} p-4 ${THEME.elevation.low} border border-[#CFE9F3]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-5 h-5 text-[#00897B]" />
                                <span className={`${THEME.typography.labelLarge} text-[#37474F]`}>Avg Score</span>
                            </div>
                            <p className={`${THEME.typography.headlineMedium} text-[#263238]`}>{stats.avgScore}</p>
                        </div>

                        <div className={`bg-white ${THEME.shapes.medium} p-4 ${THEME.elevation.low} border border-[#CFE9F3]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-[#F57C00]" />
                                <span className={`${THEME.typography.labelLarge} text-[#37474F]`}>Total Ratings</span>
                            </div>
                            <p className={`${THEME.typography.headlineMedium} text-[#263238]`}>{stats.totalRatings}</p>
                            <p className={`text-xs text-[#37474F] mt-1`}>
                                Admin: {stats.adminRatingsCount} | Peer: {stats.peerRatingsCount}
                            </p>
                        </div>

                        <div className={`bg-white ${THEME.shapes.medium} p-4 ${THEME.elevation.low} border border-[#CFE9F3]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <UserCheck className="w-5 h-5 text-[#7B1FA2]" />
                                <span className={`${THEME.typography.labelLarge} text-[#37474F]`}>Top Performer</span>
                            </div>
                            {stats.topPerformer ? (
                                <p className={`${THEME.typography.titleMedium} text-[#263238] truncate`}>{stats.topPerformer.name}</p>
                            ) : (
                                <p className={`text-sm text-[#37474F]`}>No ratings yet</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#37474F]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search employees..."
                            className={`w-full pl-12 pr-4 py-3 bg-white border border-[#CFE9F3] ${THEME.shapes.full} focus:outline-none focus:ring-2 focus:ring-[#0277BD] focus:border-transparent ${THEME.elevation.low}`}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-4 h-4 text-[#37474F]" />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mt-2`}>
                            Showing {sortedEmployees.length} of {employees.length} employees
                        </p>
                    )}
                </div>

                {/* Employee List */}
                <div className="space-y-4">
                    {employees.length === 0 ? (
                        <div className={`text-center py-20 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3] flex flex-col items-center justify-center`}>
                            <div className="w-20 h-20 bg-[#CFE9F3] rounded-full flex items-center justify-center mb-6">
                                <Users className="w-8 h-8 text-[#37474F]" />
                            </div>
                            <h3 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>No Employees Yet</h3>
                            <p className={`${THEME.typography.bodyLarge} text-[#37474F] max-w-xs mx-auto`}>Add employees from the Manage Employees section first.</p>
                        </div>
                    ) : (
                        sortedEmployees.map((emp, idx) => {
                            const scores = calculateWeightedScore(emp.id);

                            return (
                                <div
                                    key={emp.id}
                                    className={`bg-white ${THEME.shapes.asymmetric2} p-6 ${THEME.elevation.low} border-2 border-[#CFE9F3] hover:${THEME.elevation.high} hover:border-[#0277BD]/30 ${THEME.animation.spring} hover:scale-[1.01] flex flex-col sm:flex-row gap-6 items-center animate-fade-in-up`}
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
                                        </div>

                                        {showSensitiveData ? (
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0277BD]/5 text-[#0277BD] rounded-[8px] text-sm font-medium border border-[#B3E5FC]">
                                                    <Award className="w-3.5 h-3.5" />
                                                    Score: {scores.weighted}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-[8px] text-xs font-medium">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Attendance: {scores.attendance} (50%)
                                                </span>
                                                {scores.hasAdminRating && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B2DFDB] text-[#004D40] rounded-[8px] text-xs font-medium">
                                                        Admin: {scores.admin} (30%)
                                                    </span>
                                                )}
                                                {scores.hasPeerRating && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFCDD2] text-[#B71C1C] rounded-[8px] text-xs font-medium">
                                                        Peer: {scores.peer} (20%)
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
                                    </div>
                                </div>
                            );
                        })
                    )}
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
                                disabled={isVerifying}
                                className="text-[#0277BD] font-medium px-4 py-2.5 hover:bg-[#CFE9F3] rounded-full transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnlock}
                                disabled={isVerifying}
                                className={`${THEME.colors.primary} px-6 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50`}
                            >
                                {isVerifying ? 'Verifying...' : 'Unlock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Management Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className={`bg-white ${THEME.shapes.extraLarge} ${THEME.elevation.high} max-w-md w-full p-6`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`${THEME.typography.headlineSmall} text-[#263238]`}>Rating Categories</h2>
                            <button
                                onClick={() => { setShowCategoryModal(false); setNewCategory(''); }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-[#37474F]" />
                            </button>
                        </div>

                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mb-4`}>
                            Manage the categories used for employee ratings.
                        </p>

                        {/* Add New Category */}
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                placeholder="Enter new category name"
                                className={`flex-1 px-4 py-3 border border-gray-300 ${THEME.shapes.medium} focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent`}
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={!newCategory.trim()}
                                className={`px-4 py-3 bg-[#7B1FA2] text-white hover:bg-[#6A1B9A] disabled:opacity-50 disabled:cursor-not-allowed ${THEME.shapes.medium} ${THEME.animation.spring}`}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Current Categories */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {categories.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No categories defined</p>
                            ) : (
                                categories.map((category, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-3 bg-gray-50 ${THEME.shapes.small} border border-gray-200`}
                                    >
                                        <span className={`${THEME.typography.bodyMedium} text-[#263238]`}>{category}</span>
                                        <button
                                            onClick={() => handleRemoveCategory(category)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Remove category"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => { setShowCategoryModal(false); setNewCategory(''); }}
                                className={`w-full px-4 py-3 bg-[#7B1FA2] text-white hover:bg-[#6A1B9A] ${THEME.shapes.medium} ${THEME.animation.spring}`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
