import React from 'react';
import { Star, ClipboardList, LogOut, Users, ShieldAlert, Calendar, Download } from 'lucide-react';
import { THEME } from '../../theme';

interface AdminSelectionViewProps {
    onSelectRatings: () => void;
    onSelectTasks: () => void;
    onSelectEmployees: () => void;
    onSelectRules: () => void;
    onSelectAttendance: () => void;
    onExport: () => void;
    onLogout: () => void;
}

export const AdminSelectionView: React.FC<AdminSelectionViewProps> = ({
    onSelectRatings,
    onSelectTasks,
    onSelectEmployees,
    onSelectRules,
    onSelectAttendance,
    onExport,
    onLogout
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F1F8FB] to-[#B3E5FC] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#B3E5FC]/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00ACC1]/20 rounded-full blur-3xl"></div>

            <div className="max-w-4xl w-full animate-fade-in-up relative z-10">
                <div className="text-center mb-10">
                    <div className={`mx-auto w-28 h-28 bg-white ${THEME.shapes.asymmetric1} flex items-center justify-center mb-5 ${THEME.elevation.high} p-4`}>
                        <img src="/janhavi-logo.jpg" alt="Janhavi Medicals" className="w-full h-full object-contain" />
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

                {/* Export & Logout Buttons */}
                <div className="text-center flex justify-center gap-4">
                    <button
                        onClick={onExport}
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#00897B] text-white hover:bg-[#00796B] ${THEME.shapes.full} ${THEME.animation.spring} shadow-md hover:shadow-lg`}
                    >
                        <Download className="w-5 h-5" />
                        <span className={THEME.typography.labelLarge}>Export to Excel</span>
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
        </div>
    );
};
