import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Plus, X } from 'lucide-react';
import { THEME } from '../../theme';
import type { Employee, MonthlyLeaveRecord } from '../../types';

interface LeaveTrackerProps {
    employees: Employee[];
    monthlyLeaves: MonthlyLeaveRecord[];
    onAddOrUpdateMonthlyLeave: (record: Omit<MonthlyLeaveRecord, 'id'>) => void;
    onUpdateEmployeeLeavesPerMonth: (employeeId: number, leaves: number) => void;
    onBack: () => void;
}

export const LeaveTracker: React.FC<LeaveTrackerProps> = ({
    employees,
    monthlyLeaves,
    onAddOrUpdateMonthlyLeave,
    // onUpdateEmployeeLeavesPerMonth is available for updating default employee allocation
    // Currently we only update per-month allocation in this component
    onUpdateEmployeeLeavesPerMonth: _onUpdateEmployeeLeavesPerMonth,
    onBack
}) => {
    void _onUpdateEmployeeLeavesPerMonth; // Mark as intentionally unused for now
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [expandedEmployee, setExpandedEmployee] = useState<number | null>(null);
    const [newLeaveDate, setNewLeaveDate] = useState('');

    const navigateMonth = (direction: 'prev' | 'next') => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-').map(Number);
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getLeaveRecordForEmployee = (employeeId: number): MonthlyLeaveRecord | undefined => {
        return monthlyLeaves.find(r => r.employeeId === employeeId && r.month === selectedMonth);
    };

    const getEmployeeAllocation = (emp: Employee): number => {
        const record = getLeaveRecordForEmployee(emp.id);
        return record?.allocatedLeaves ?? emp.leavesPerMonth ?? 3;
    };

    const getLeavesTaken = (employeeId: number): number => {
        const record = getLeaveRecordForEmployee(employeeId);
        return record?.leavesTaken ?? 0;
    };

    const getLeaveDates = (employeeId: number): string[] => {
        const record = getLeaveRecordForEmployee(employeeId);
        return record?.leaveDates ?? [];
    };

    const handleAllocationChange = (emp: Employee, newAllocation: number) => {
        const record = getLeaveRecordForEmployee(emp.id);
        onAddOrUpdateMonthlyLeave({
            employeeId: emp.id,
            month: selectedMonth,
            allocatedLeaves: newAllocation,
            leavesTaken: record?.leavesTaken ?? 0,
            leaveDates: record?.leaveDates,
            notes: record?.notes
        });
    };

    const handleLeavesTakenChange = (emp: Employee, newLeavesTaken: number) => {
        const record = getLeaveRecordForEmployee(emp.id);
        const allocation = getEmployeeAllocation(emp);
        onAddOrUpdateMonthlyLeave({
            employeeId: emp.id,
            month: selectedMonth,
            allocatedLeaves: allocation,
            leavesTaken: Math.max(0, newLeavesTaken),
            leaveDates: record?.leaveDates,
            notes: record?.notes
        });
    };

    const handleAddLeaveDate = (emp: Employee, date: string) => {
        if (!date) return;
        const record = getLeaveRecordForEmployee(emp.id);
        const currentDates = record?.leaveDates ?? [];
        if (currentDates.includes(date)) return;

        const newDates = [...currentDates, date].sort();
        const allocation = getEmployeeAllocation(emp);

        onAddOrUpdateMonthlyLeave({
            employeeId: emp.id,
            month: selectedMonth,
            allocatedLeaves: allocation,
            leavesTaken: newDates.length,
            leaveDates: newDates,
            notes: record?.notes
        });
        setNewLeaveDate('');
    };

    const handleRemoveLeaveDate = (emp: Employee, dateToRemove: string) => {
        const record = getLeaveRecordForEmployee(emp.id);
        const currentDates = record?.leaveDates ?? [];
        const newDates = currentDates.filter(d => d !== dateToRemove);
        const allocation = getEmployeeAllocation(emp);

        onAddOrUpdateMonthlyLeave({
            employeeId: emp.id,
            month: selectedMonth,
            allocatedLeaves: allocation,
            leavesTaken: newDates.length,
            leaveDates: newDates,
            notes: record?.notes
        });
    };

    // Summary stats
    const stats = useMemo(() => {
        let totalAllocated = 0;
        let totalTaken = 0;
        let employeesWithRemaining = 0;

        employees.forEach(emp => {
            const allocation = getEmployeeAllocation(emp);
            const taken = getLeavesTaken(emp.id);
            totalAllocated += allocation;
            totalTaken += taken;
            if (taken < allocation) employeesWithRemaining++;
        });

        return { totalAllocated, totalTaken, remaining: totalAllocated - totalTaken, employeesWithRemaining };
    }, [employees, monthlyLeaves, selectedMonth]);

    // Get min/max dates for the selected month for date picker
    const [year, month] = selectedMonth.split('-').map(Number);
    const minDate = `${selectedMonth}-01`;
    const maxDate = `${selectedMonth}-${new Date(year, month, 0).getDate()}`;

    return (
        <div className="min-h-screen bg-[#F1F8FB] p-6 lg:p-10">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="animate-fade-in-right flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className={`p-3 hover:bg-white ${THEME.shapes.full} ${THEME.animation.spring} ${THEME.elevation.low}`}
                        >
                            <ArrowLeft className="w-6 h-6 text-[#37474F]" />
                        </button>
                        <div className="flex items-center gap-4">
                            <img src="./janhavi-logo.jpg" alt="Janhavi Medicals" className="w-16 h-16 object-contain" />
                            <div>
                                <h1 className={`${THEME.typography.displayMedium} text-[#263238]`}>Leave Management</h1>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F] mt-1`}>Track monthly employee leaves</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Month Navigator */}
                <div className={`bg-white ${THEME.shapes.extraLarge} p-4 ${THEME.elevation.low} mb-6 flex items-center justify-between`}>
                    <button
                        onClick={() => navigateMonth('prev')}
                        className={`p-2 hover:bg-[#CFE9F3] ${THEME.shapes.full} ${THEME.animation.spring}`}
                    >
                        <ChevronLeft className="w-6 h-6 text-[#37474F]" />
                    </button>
                    <h2 className={`${THEME.typography.headlineSmall} text-[#263238]`}>
                        {formatMonth(selectedMonth)}
                    </h2>
                    <button
                        onClick={() => navigateMonth('next')}
                        className={`p-2 hover:bg-[#CFE9F3] ${THEME.shapes.full} ${THEME.animation.spring}`}
                    >
                        <ChevronRight className="w-6 h-6 text-[#37474F]" />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`bg-[#B3E5FC] ${THEME.shapes.medium} p-4 text-center`}>
                        <p className={`${THEME.typography.displayMedium} text-[#01579B]`}>{stats.totalAllocated}</p>
                        <p className={`${THEME.typography.labelLarge} text-[#01579B]`}>Total Allocated</p>
                    </div>
                    <div className={`bg-[#FFCDD2] ${THEME.shapes.medium} p-4 text-center`}>
                        <p className={`${THEME.typography.displayMedium} text-[#B71C1C]`}>{stats.totalTaken}</p>
                        <p className={`${THEME.typography.labelLarge} text-[#B71C1C]`}>Total Taken</p>
                    </div>
                    <div className={`bg-[#B2DFDB] ${THEME.shapes.medium} p-4 text-center`}>
                        <p className={`${THEME.typography.displayMedium} text-[#004D40]`}>{stats.remaining}</p>
                        <p className={`${THEME.typography.labelLarge} text-[#004D40]`}>Remaining</p>
                    </div>
                    <div className={`bg-[#FFE0B2] ${THEME.shapes.medium} p-4 text-center`}>
                        <p className={`${THEME.typography.displayMedium} text-[#E65100]`}>{stats.employeesWithRemaining}</p>
                        <p className={`${THEME.typography.labelLarge} text-[#E65100]`}>With Leaves Left</p>
                    </div>
                </div>

                {/* Employee Cards */}
                <div className="space-y-4">
                    {employees.length === 0 ? (
                        <div className={`text-center py-12 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3]`}>
                            <p className={`${THEME.typography.bodyLarge} text-[#37474F]`}>No employees found. Add employees first.</p>
                        </div>
                    ) : (
                        employees.map((emp, idx) => {
                            const allocation = getEmployeeAllocation(emp);
                            const leavesTaken = getLeavesTaken(emp.id);
                            const remaining = allocation - leavesTaken;
                            const leaveDates = getLeaveDates(emp.id);
                            const isExpanded = expandedEmployee === emp.id;

                            return (
                                <div
                                    key={emp.id}
                                    className={`bg-white ${THEME.shapes.asymmetric2} p-5 ${THEME.elevation.low} border-2 border-[#CFE9F3] animate-fade-in-up`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        {/* Avatar */}
                                        {emp.photo ? (
                                            <img src={emp.photo} alt={emp.name} className="w-14 h-14 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-14 h-14 rounded-full ${emp.avatar} flex items-center justify-center text-white text-xl font-bold`}>
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="flex-1 w-full">
                                            <h3 className={`${THEME.typography.titleLarge} text-[#263238] mb-2`}>{emp.name}</h3>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {/* Allocated Leaves */}
                                                <div>
                                                    <label className={`${THEME.typography.labelLarge} text-[#37474F] block mb-1`}>
                                                        Allocated Leaves
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="31"
                                                            value={allocation}
                                                            onChange={(e) => handleAllocationChange(emp, parseInt(e.target.value) || 0)}
                                                            className={`w-20 px-3 py-2 border border-[#B0BEC5] ${THEME.shapes.small} focus:outline-none focus:border-[#0277BD] focus:ring-1 focus:ring-[#0277BD] text-center`}
                                                        />
                                                        <span className={`${THEME.typography.bodyMedium} text-[#37474F]`}>
                                                            (Default: {emp.leavesPerMonth ?? 3})
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Leaves Taken */}
                                                <div>
                                                    <label className={`${THEME.typography.labelLarge} text-[#37474F] block mb-1`}>
                                                        Leaves Taken
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={allocation}
                                                        value={leavesTaken}
                                                        onChange={(e) => handleLeavesTakenChange(emp, parseInt(e.target.value) || 0)}
                                                        className={`w-20 px-3 py-2 border border-[#B0BEC5] ${THEME.shapes.small} focus:outline-none focus:border-[#0277BD] focus:ring-1 focus:ring-[#0277BD] text-center`}
                                                    />
                                                </div>

                                                {/* Remaining */}
                                                <div>
                                                    <label className={`${THEME.typography.labelLarge} text-[#37474F] block mb-1`}>
                                                        Remaining
                                                    </label>
                                                    <div className={`px-3 py-2 ${THEME.shapes.small} text-center font-bold ${
                                                        remaining > 0 ? 'bg-[#B2DFDB] text-[#004D40]' :
                                                        remaining === 0 ? 'bg-[#FFE0B2] text-[#E65100]' :
                                                        'bg-[#FFCDD2] text-[#B71C1C]'
                                                    }`}>
                                                        {remaining}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expand button for leave dates */}
                                        <button
                                            onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium ${THEME.animation.spring} flex items-center gap-2 ${
                                                isExpanded ? 'bg-[#0277BD] text-white' : 'bg-[#CFE9F3] text-[#01579B] hover:bg-[#B3E5FC]'
                                            }`}
                                        >
                                            <Calendar className="w-4 h-4" />
                                            {isExpanded ? 'Hide Dates' : 'Add Dates'}
                                        </button>
                                    </div>

                                    {/* Expandable section for leave dates */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-[#CFE9F3]">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <input
                                                    type="date"
                                                    value={newLeaveDate}
                                                    onChange={(e) => setNewLeaveDate(e.target.value)}
                                                    min={minDate}
                                                    max={maxDate}
                                                    className={`px-3 py-2 border border-[#B0BEC5] ${THEME.shapes.small} focus:outline-none focus:border-[#0277BD] focus:ring-1 focus:ring-[#0277BD]`}
                                                />
                                                <button
                                                    onClick={() => handleAddLeaveDate(emp, newLeaveDate)}
                                                    disabled={!newLeaveDate}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium ${THEME.animation.spring} flex items-center gap-1 ${
                                                        newLeaveDate
                                                            ? 'bg-[#0277BD] text-white hover:bg-[#01579B]'
                                                            : 'bg-[#E0E0E0] text-[#9E9E9E] cursor-not-allowed'
                                                    }`}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Date
                                                </button>
                                            </div>

                                            {leaveDates.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {leaveDates.map(date => (
                                                        <span
                                                            key={date}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFCDD2] text-[#B71C1C] rounded-full text-sm"
                                                        >
                                                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                            <button
                                                                onClick={() => handleRemoveLeaveDate(emp, date)}
                                                                className="hover:bg-[#B71C1C] hover:text-white rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`${THEME.typography.bodyMedium} text-[#37474F]`}>
                                                    No specific leave dates recorded. Add dates to track when leaves were taken.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
