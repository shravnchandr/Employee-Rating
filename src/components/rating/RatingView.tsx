import React, { useMemo } from 'react';
import { Award, Shield, Check, ArrowLeft, X, AlertTriangle, ClipboardList } from 'lucide-react';
import { THEME } from '../../theme';
import { RatingButton } from '../common/RatingButton';
import type { Employee, Rule, DailyTask } from '../../types';

interface RatingViewProps {
    employeesToRate: Employee[];
    currentRatingIndex: number;
    currentRatings: Record<number, Record<string, string>>;
    categories: string[];
    isAdminRating: boolean;
    animating: boolean;
    submitCategoryRating: (category: string, value: string) => void;
    submitFeedback: (value: string) => void;
    currentFeedbacks: Record<number, string>;
    goToNextEmployee: () => void;
    saveData: () => void;
    onExit: () => void;
    // New props for rules and tasks
    rules: Rule[];
    dailyTasks: DailyTask[];
    currentViolations: Record<number, number[]>;
    currentIncompleteTasks: Record<number, number[]>;
    onToggleViolation: (employeeId: number, ruleId: number) => void;
    onToggleIncompleteTask: (employeeId: number, taskId: number) => void;
}

export const RatingView: React.FC<RatingViewProps> = ({
    employeesToRate,
    currentRatingIndex,
    currentRatings,
    categories,
    isAdminRating,
    animating,
    submitCategoryRating,
    submitFeedback,
    currentFeedbacks,
    goToNextEmployee,
    saveData: _saveData,
    onExit,
    rules,
    dailyTasks,
    currentViolations,
    currentIncompleteTasks,
    onToggleViolation,
    onToggleIncompleteTask
}) => {
    void _saveData; // Kept for interface compatibility

    const employeeToRate = employeesToRate[currentRatingIndex];

    // Get tasks assigned to current employee being rated
    const employeeTasks = useMemo(() => {
        if (!employeeToRate) return [];
        return dailyTasks.filter(task => task.assignedTo === employeeToRate.id);
    }, [dailyTasks, employeeToRate]);

    if (employeesToRate.length === 0 || !employeeToRate) return null;

    const isLastEmployee = currentRatingIndex === employeesToRate.length - 1;
    const currentEmployeeRatings = currentRatings[employeeToRate.id] || {};

    // Get current violations for this employee
    const selectedViolations = currentViolations[employeeToRate.id] || [];
    const selectedIncompleteTasks = currentIncompleteTasks[employeeToRate.id] || [];

    return (
        <div className="min-h-screen bg-[#F1F8FB] flex flex-col items-center justify-start p-6 py-10 overflow-y-auto">
            <div className={`max-w-2xl w-full bg-white ${THEME.shapes.extraLarge} p-8 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-[#CFE9F3] transition-all duration-300 ${animating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className={`px-4 py-1.5 bg-[#B3E5FC]/50 border border-[#B3E5FC] rounded-full text-[#01579B] text-sm font-medium`}>
                        {currentRatingIndex + 1} of {employeesToRate.length}
                    </div>
                    <button onClick={onExit} className="text-[#37474F] hover:bg-[#FFCDD2] hover:text-[#D32F2F] p-2.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4 group">
                        {employeeToRate.photo ? (
                            <img src={employeeToRate.photo} alt={employeeToRate.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-[4px] border-[#CFE9F3] aspect-square" />
                        ) : (
                            <div className={`w-24 h-24 rounded-full ${employeeToRate.avatar} flex items-center justify-center text-white text-4xl font-bold shadow-lg border-[4px] border-[#CFE9F3] aspect-square`}>
                                {employeeToRate.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {isAdminRating && (
                            <div className="absolute -bottom-1 -right-1 bg-[#0277BD] text-white p-2 rounded-[10px] shadow-md border-2 border-white" title="Admin Rating Session">
                                <Shield className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                    <h2 className={`${THEME.typography.headlineMedium} text-center flex items-center gap-2 text-[#263238]`}>
                        {employeeToRate.name}
                        <div className="bg-[#0277BD]/10 p-1.5 rounded-full">
                            {isAdminRating ? <Shield className="w-5 h-5 text-[#0277BD]" /> : <Award className="w-5 h-5 text-[#0277BD]" />}
                        </div>
                    </h2>
                    <p className={`${THEME.typography.bodyMedium} text-[#37474F] mt-2 max-w-xs text-center`}>
                        {isAdminRating
                            ? 'Provide an assessment across the following criteria.'
                            : 'Rate your colleague and report any concerns.'
                        }
                    </p>
                </div>

                {/* Performance Ratings */}
                <div className="space-y-6 mb-8">
                    <h3 className={`${THEME.typography.titleLarge} text-[#263238] flex items-center gap-2`}>
                        <Award className="w-5 h-5 text-[#0277BD]" />
                        Performance Rating
                    </h3>
                    {categories.map((category, idx) => (
                        <div key={category} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h4 className={`${THEME.typography.titleMedium} text-[#263238]`}>{category}</h4>
                                {currentEmployeeRatings[category] && (
                                    <div className="flex items-center gap-1 text-[#0277BD] bg-[#B3E5FC]/30 px-2 py-0.5 rounded-full text-xs font-medium">
                                        <Check className="w-3 h-3" />
                                        <span>Selected</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <RatingButton
                                    label="Needs Work"
                                    isSelected={currentEmployeeRatings[category] === 'Needs Improvement'}
                                    onClick={() => submitCategoryRating(category, 'Needs Improvement')}
                                    colorClass="bg-[#D32F2F] border-[#D32F2F]"
                                    shapeVariant="needs"
                                />
                                <RatingButton
                                    label="Good"
                                    isSelected={currentEmployeeRatings[category] === 'Good'}
                                    onClick={() => submitCategoryRating(category, 'Good')}
                                    colorClass="bg-[#B2DFDB] !text-[#004D40] border-[#B2DFDB]"
                                    shapeVariant="good"
                                />
                                <RatingButton
                                    label="Excellent"
                                    isSelected={currentEmployeeRatings[category] === 'Excellent'}
                                    onClick={() => submitCategoryRating(category, 'Excellent')}
                                    colorClass="bg-[#0277BD] border-[#0277BD]"
                                    shapeVariant="excellent"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rules Compliance Section */}
                {rules.length > 0 && (
                    <div className="mb-8 pt-6 border-t border-[#CFE9F3]">
                        <h3 className={`${THEME.typography.titleLarge} text-[#263238] flex items-center gap-2 mb-4`}>
                            <AlertTriangle className="w-5 h-5 text-[#D32F2F]" />
                            Rule Violations
                        </h3>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mb-4`}>
                            Select any rules this employee may have broken:
                        </p>
                        <div className="space-y-2">
                            {rules.map(rule => {
                                const isSelected = selectedViolations.includes(rule.id);
                                return (
                                    <button
                                        key={rule.id}
                                        onClick={() => onToggleViolation(employeeToRate.id, rule.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg ${THEME.animation.spring} text-left ${
                                            isSelected
                                                ? 'bg-[#FFCDD2] border-2 border-[#D32F2F]'
                                                : 'bg-[#F5F5F5] border-2 border-transparent hover:bg-[#EEEEEE]'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${THEME.animation.spring} ${
                                            isSelected
                                                ? 'bg-[#D32F2F] border-[#D32F2F] text-white'
                                                : 'border-[#37474F]'
                                        }`}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>
                                        <span className={`${THEME.typography.bodyLarge} ${isSelected ? 'text-[#B71C1C]' : 'text-[#263238]'}`}>
                                            {rule.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedViolations.length > 0 && (
                            <p className={`${THEME.typography.bodyMedium} text-[#D32F2F] mt-3`}>
                                {selectedViolations.length} violation{selectedViolations.length > 1 ? 's' : ''} reported
                            </p>
                        )}
                    </div>
                )}

                {/* Daily Tasks Section */}
                {employeeTasks.length > 0 && (
                    <div className="mb-8 pt-6 border-t border-[#CFE9F3]">
                        <h3 className={`${THEME.typography.titleLarge} text-[#263238] flex items-center gap-2 mb-4`}>
                            <ClipboardList className="w-5 h-5 text-[#E65100]" />
                            Task Completion
                        </h3>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mb-4`}>
                            Select any tasks this employee did NOT complete:
                        </p>
                        <div className="space-y-2">
                            {employeeTasks.map(task => {
                                const isSelected = selectedIncompleteTasks.includes(task.id);
                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => onToggleIncompleteTask(employeeToRate.id, task.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg ${THEME.animation.spring} text-left ${
                                            isSelected
                                                ? 'bg-[#FFE0B2] border-2 border-[#E65100]'
                                                : 'bg-[#F5F5F5] border-2 border-transparent hover:bg-[#EEEEEE]'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${THEME.animation.spring} ${
                                            isSelected
                                                ? 'bg-[#E65100] border-[#E65100] text-white'
                                                : 'border-[#37474F]'
                                        }`}>
                                            {isSelected && <X className="w-3 h-3" />}
                                        </div>
                                        <span className={`${THEME.typography.bodyLarge} ${isSelected ? 'text-[#E65100]' : 'text-[#263238]'}`}>
                                            {task.name}
                                        </span>
                                        {task.templateId === null && (
                                            <span className="text-xs px-2 py-0.5 bg-[#B3E5FC] text-[#01579B] rounded-full ml-auto">Extra</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedIncompleteTasks.length > 0 && (
                            <p className={`${THEME.typography.bodyMedium} text-[#E65100] mt-3`}>
                                {selectedIncompleteTasks.length} incomplete task{selectedIncompleteTasks.length > 1 ? 's' : ''} reported
                            </p>
                        )}
                    </div>
                )}

                {/* Feedback Box (Always visible) */}
                <div className="mb-8 pt-6 border-t border-[#CFE9F3]">
                    <h3 className={`${THEME.typography.titleMedium} text-[#263238] mb-3`}>Additional Feedback (Optional)</h3>
                    <textarea
                        className={`w-full p-4 bg-white border border-[#CFE9F3] ${THEME.shapes.large} text-[#263238] placeholder-[#546E7A] focus:outline-none focus:border-[#0277BD] focus:ring-1 focus:ring-[#0277BD] transition-all min-h-[100px] resize-none hover:border-[#546E7A]`}
                        placeholder="Share your thoughts on their performance..."
                        value={currentFeedbacks[employeeToRate.id] || ''}
                        onChange={(e) => submitFeedback(e.target.value)}
                    />
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-[#CFE9F3] w-full">
                    <button
                        onClick={goToNextEmployee}
                        className={`w-full ${THEME.colors.primary} ${THEME.shapes.full} py-4 text-lg font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3`}
                    >
                        {isLastEmployee ? 'Submit Reviews' : 'Next Employee'}
                        {!isLastEmployee ? <ArrowLeft className="w-5 h-5 rotate-180" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={onExit}
                        className={`w-full mt-4 text-[#0277BD] font-medium py-2.5 hover:bg-[#CFE9F3] ${THEME.shapes.full} transition-colors text-sm uppercase tracking-wide`}
                    >
                        Cancel Session
                    </button>
                </div>
            </div>
        </div>
    );
};
