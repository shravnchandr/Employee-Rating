import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, AlertTriangle, Shield, X, Settings, ToggleLeft, ToggleRight, Trash2, Users } from 'lucide-react';
import { THEME } from '../../theme';
import { FloatingLabelInput } from '../common/FloatingLabelInput';
import type { Employee, Rule, RuleViolation } from '../../types';

interface RulesComplianceProps {
    employees: Employee[];
    rules: Rule[];
    violations: RuleViolation[];
    onAddRule: (rule: Omit<Rule, 'id'>) => void;
    onToggleRuleActive: (id: number) => void;
    onDeleteRule: (id: number) => void;
    onBack: () => void;
}

export const RulesCompliance: React.FC<RulesComplianceProps> = ({
    employees,
    rules,
    violations,
    onAddRule,
    onToggleRuleActive,
    onDeleteRule,
    onBack
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'history'>('overview');
    const [newRuleName, setNewRuleName] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const todaysViolations = useMemo(() => {
        return violations.filter(v => v.date === today);
    }, [violations, today]);

    const handleAddRule = () => {
        if (newRuleName.trim()) {
            onAddRule({
                name: newRuleName.trim(),
                isActive: true
            });
            setNewRuleName('');
        }
    };

    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'Unknown';
    const getRuleName = (id: number) => rules.find(r => r.id === id)?.name || 'Unknown Rule';
    const getEmployee = (id: number) => employees.find(e => e.id === id);

    const getViolationCountForEmployee = (employeeId: number) => {
        return violations.filter(v => v.employeeId === employeeId).length;
    };

    const getTodayViolationCountForEmployee = (employeeId: number) => {
        return todaysViolations.filter(v => v.employeeId === employeeId).length;
    };

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
                                <h1 className={`${THEME.typography.displayMedium} text-[#263238]`}>Rules Compliance</h1>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F] mt-1`}>Manage rules and view violations reported by peers</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-white p-1.5 rounded-full shadow-sm">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-5 py-2.5 rounded-full ${THEME.typography.labelLarge} ${THEME.animation.spring} ${
                                activeTab === 'overview'
                                    ? 'bg-[#D32F2F] text-white shadow-md'
                                    : 'text-[#37474F] hover:bg-[#CFE9F3]'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`px-5 py-2.5 rounded-full ${THEME.typography.labelLarge} ${THEME.animation.spring} ${
                                activeTab === 'rules'
                                    ? 'bg-[#D32F2F] text-white shadow-md'
                                    : 'text-[#37474F] hover:bg-[#CFE9F3]'
                            }`}
                        >
                            <Settings className="w-4 h-4 inline mr-2" />
                            Manage Rules
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-5 py-2.5 rounded-full ${THEME.typography.labelLarge} ${THEME.animation.spring} ${
                                activeTab === 'history'
                                    ? 'bg-[#D32F2F] text-white shadow-md'
                                    : 'text-[#37474F] hover:bg-[#CFE9F3]'
                            }`}
                        >
                            History
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Info Banner */}
                        <div className={`bg-[#B3E5FC]/30 ${THEME.shapes.extraLarge} p-5 border border-[#B3E5FC]`}>
                            <p className={`${THEME.typography.bodyLarge} text-[#01579B]`}>
                                <AlertTriangle className="w-5 h-5 inline mr-2" />
                                Rule violations are now reported by employees during the peer rating process.
                                This page shows violations reported by colleagues.
                            </p>
                        </div>

                        {/* Today's Violations by Employee */}
                        <h2 className={`${THEME.typography.headlineMedium} text-[#263238]`}>Today's Status</h2>
                        {employees.length === 0 ? (
                            <div className={`text-center py-12 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3]`}>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F]`}>No employees found. Add employees first.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {employees.map((emp, idx) => {
                                    const todayCount = getTodayViolationCountForEmployee(emp.id);
                                    const totalCount = getViolationCountForEmployee(emp.id);
                                    const empViolationsToday = todaysViolations.filter(v => v.employeeId === emp.id);

                                    return (
                                        <div
                                            key={emp.id}
                                            className={`bg-white ${THEME.shapes.asymmetric2} p-5 ${THEME.elevation.low} border-2 ${
                                                todayCount > 0 ? 'border-[#FFCDD2]' : 'border-[#B2DFDB]'
                                            } animate-fade-in-up`}
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                {emp.photo ? (
                                                    <img src={emp.photo} alt={emp.name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full ${emp.avatar} flex items-center justify-center text-white font-bold`}>
                                                        {emp.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className={`${THEME.typography.titleMedium} text-[#263238]`}>{emp.name}</h4>
                                                    <p className={`text-xs ${todayCount > 0 ? 'text-[#D32F2F]' : 'text-[#00897B]'}`}>
                                                        {todayCount > 0 ? `${todayCount} violation${todayCount > 1 ? 's' : ''} today` : 'No violations today'}
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    todayCount > 0 ? 'bg-[#FFCDD2] text-[#B71C1C]' : 'bg-[#B2DFDB] text-[#004D40]'
                                                }`}>
                                                    {todayCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                </div>
                                            </div>
                                            {empViolationsToday.length > 0 && (
                                                <div className="space-y-1 mt-3 pt-3 border-t border-[#FFCDD2]">
                                                    {empViolationsToday.map(v => (
                                                        <div key={v.id} className="text-sm text-[#B71C1C] flex items-start gap-2">
                                                            <X className="w-3 h-3 mt-1 shrink-0" />
                                                            <div>
                                                                <span>{getRuleName(v.ruleId)}</span>
                                                                {v.reporterName && (
                                                                    <span className="text-[#37474F] text-xs ml-1">
                                                                        (reported by {v.reporterName})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className={`text-xs text-[#37474F] mt-2`}>Total violations: {totalCount}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Add Rule Form */}
                        <div className={`lg:col-span-4 bg-gradient-to-br from-[#FFCDD2]/30 to-[#FFEBEE] ${THEME.shapes.asymmetric1} p-8 ${THEME.elevation.medium} h-fit sticky top-6`}>
                            <h2 className={`${THEME.typography.headlineMedium} mb-8 text-[#263238]`}>Add Rule</h2>
                            <div className="space-y-6">
                                <FloatingLabelInput
                                    value={newRuleName}
                                    onChange={(e) => setNewRuleName(e.target.value)}
                                    placeholder="Rule Name"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                                />
                                <button
                                    onClick={handleAddRule}
                                    className={`w-full bg-[#D32F2F] text-white ${THEME.shapes.full} py-3.5 px-6 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:bg-[#B71C1C] transition-all font-medium`}
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Rule
                                </button>
                            </div>

                            <div className={`mt-8 p-4 bg-white/50 ${THEME.shapes.medium}`}>
                                <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                                    <strong>Note:</strong> Active rules will appear in the employee rating form for peer reporting.
                                </p>
                            </div>
                        </div>

                        {/* Rules List */}
                        <div className="lg:col-span-8 space-y-4">
                            {rules.length === 0 ? (
                                <div className={`text-center py-20 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3]`}>
                                    <div className="w-20 h-20 bg-[#FFCDD2] rounded-full flex items-center justify-center mb-6 mx-auto">
                                        <Shield className="w-8 h-8 text-[#B71C1C]" />
                                    </div>
                                    <h3 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>No Rules Yet</h3>
                                    <p className={`${THEME.typography.bodyLarge} text-[#37474F]`}>Create your first workplace rule.</p>
                                </div>
                            ) : (
                                rules.map((rule, idx) => (
                                    <div
                                        key={rule.id}
                                        className={`bg-white ${THEME.shapes.asymmetric2} p-6 ${THEME.elevation.low} border-2 ${
                                            rule.isActive ? 'border-[#FFCDD2]' : 'border-[#E0E0E0]'
                                        } ${THEME.animation.spring} hover:${THEME.elevation.medium} animate-fade-in-up flex items-center gap-4`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <button
                                            onClick={() => onToggleRuleActive(rule.id)}
                                            className={THEME.animation.spring}
                                        >
                                            {rule.isActive ? (
                                                <ToggleRight className="w-8 h-8 text-[#D32F2F]" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8 text-[#37474F]" />
                                            )}
                                        </button>
                                        <div className="flex-1">
                                            <h3 className={`${THEME.typography.titleLarge} text-[#263238] ${!rule.isActive && 'opacity-50'}`}>
                                                {rule.name}
                                            </h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            rule.isActive ? 'bg-[#FFCDD2] text-[#B71C1C]' : 'bg-[#E0E0E0] text-[#37474F]'
                                        }`}>
                                            {rule.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => onDeleteRule(rule.id)}
                                            className={`text-[#D32F2F] bg-[#FFCDD2]/10 hover:bg-[#FFCDD2]/30 ${THEME.shapes.full} p-2 transition-colors`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <h2 className={`${THEME.typography.headlineMedium} text-[#263238] mb-4`}>Violation History</h2>
                        {violations.length === 0 ? (
                            <div className={`text-center py-20 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3]`}>
                                <div className="w-20 h-20 bg-[#B2DFDB] rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <Shield className="w-8 h-8 text-[#004D40]" />
                                </div>
                                <h3 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>No Violations Recorded</h3>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F]`}>Great job! Everyone is following the rules.</p>
                            </div>
                        ) : (
                            [...violations].reverse().map((violation, idx) => {
                                const emp = getEmployee(violation.employeeId);
                                return (
                                    <div
                                        key={violation.id}
                                        className={`bg-white ${THEME.shapes.asymmetric2} p-5 ${THEME.elevation.low} border-2 border-[#FFCDD2] animate-fade-in-up flex items-center gap-4`}
                                        style={{ animationDelay: `${idx * 30}ms` }}
                                    >
                                        {emp?.photo ? (
                                            <img src={emp.photo} alt={emp.name} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full ${emp?.avatar || 'bg-gray-400'} flex items-center justify-center text-white font-bold`}>
                                                {emp?.name.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className={`${THEME.typography.titleMedium} text-[#263238]`}>
                                                {getEmployeeName(violation.employeeId)}
                                            </h4>
                                            <p className={`${THEME.typography.bodyMedium} text-[#D32F2F]`}>
                                                {getRuleName(violation.ruleId)}
                                            </p>
                                            {violation.reporterName && (
                                                <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm mt-1`}>
                                                    Reported by: {violation.reporterName}
                                                </p>
                                            )}
                                            {violation.notes && (
                                                <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm mt-1`}>
                                                    Note: {violation.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className={`${THEME.typography.labelLarge} text-[#37474F]`}>{violation.date}</p>
                                            <p className={`text-xs text-[#37474F]`}>
                                                {new Date(violation.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
