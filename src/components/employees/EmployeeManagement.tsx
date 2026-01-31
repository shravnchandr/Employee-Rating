import React from 'react';
import { ArrowLeft, Plus, Check, Upload, Users, X, Calendar } from 'lucide-react';
import { THEME } from '../../theme';
import { FloatingLabelInput } from '../common/FloatingLabelInput';
import type { Employee } from '../../types';

interface EmployeeManagementProps {
    employees: Employee[];
    newEmployeeName: string;
    setNewEmployeeName: (name: string) => void;
    newEmployeePhoto: string;
    handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    newEmployeeLeavesPerMonth: number;
    setNewEmployeeLeavesPerMonth: (leaves: number) => void;
    addEmployee: () => void;
    removeEmployee: (id: number) => void;
    updateEmployeeLeavesPerMonth: (employeeId: number, leaves: number) => void;
    onBack: () => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
    employees,
    newEmployeeName,
    setNewEmployeeName,
    newEmployeePhoto,
    handlePhotoUpload,
    newEmployeeLeavesPerMonth,
    setNewEmployeeLeavesPerMonth,
    addEmployee,
    removeEmployee,
    updateEmployeeLeavesPerMonth,
    onBack
}) => {
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
                                <h1 className={`${THEME.typography.displayMedium} text-[#263238]`}>Manage Employees</h1>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F] mt-1`}>Add or remove pharmacy staff members</p>
                            </div>
                        </div>
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

                            {/* Leaves per Month */}
                            <div>
                                <label className={`${THEME.typography.labelLarge} text-[#37474F] block mb-2`}>
                                    Leaves per Month
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        value={newEmployeeLeavesPerMonth}
                                        onChange={(e) => setNewEmployeeLeavesPerMonth(parseInt(e.target.value) || 0)}
                                        className={`w-20 px-3 py-2 bg-white border border-[#B0BEC5] ${THEME.shapes.small} focus:outline-none focus:border-[#0277BD] focus:ring-1 focus:ring-[#0277BD] text-center`}
                                    />
                                    <span className={`${THEME.typography.bodyMedium} text-[#37474F]`}>
                                        days
                                    </span>
                                </div>
                            </div>

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

                    {/* Employee List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`${THEME.typography.headlineMedium} text-[#263238]`}>Current Employees</h2>
                            <span className={`${THEME.typography.labelLarge} text-[#37474F] bg-white px-4 py-2 rounded-full`}>
                                {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
                            </span>
                        </div>

                        {employees.length === 0 ? (
                            <div className={`text-center py-20 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3] flex flex-col items-center justify-center`}>
                                <div className="w-20 h-20 bg-[#CFE9F3] rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-8 h-8 text-[#37474F]" />
                                </div>
                                <h3 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>No Employees Yet</h3>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F] max-w-xs mx-auto`}>Add your first employee using the form on the left.</p>
                            </div>
                        ) : (
                            employees.map((emp, idx) => (
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
                                    </div>

                                    <div className="flex-1 w-full text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                                            <h3 className={`${THEME.typography.titleLarge} text-[#263238] truncate`}>{emp.name}</h3>
                                            <div className="bg-[#E0E0E0] text-[#37474F] px-2 py-0.5 rounded-[4px] text-xs font-medium">#{emp.id.toString().slice(-4)}</div>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-[#0277BD]" />
                                            <span className={`${THEME.typography.bodyMedium} text-[#37474F]`}>Leaves/Month:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="31"
                                                value={emp.leavesPerMonth ?? 3}
                                                onChange={(e) => updateEmployeeLeavesPerMonth(emp.id, parseInt(e.target.value) || 0)}
                                                className={`w-14 px-2 py-1 border border-[#B0BEC5] rounded text-center text-sm focus:outline-none focus:border-[#0277BD] focus:ring-1 focus:ring-[#0277BD]`}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeEmployee(emp.id)}
                                        className={`text-[#D32F2F] bg-[#FFCDD2]/10 hover:bg-[#FFCDD2]/30 ${THEME.shapes.full} px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2`}
                                        title="Remove Employee"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Remove</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
