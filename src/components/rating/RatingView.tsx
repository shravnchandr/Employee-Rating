import React from 'react';
import { Award, Shield, Check, ArrowLeft, X } from 'lucide-react';
import { THEME } from '../../theme';
import { RatingButton } from '../common/RatingButton';
import type { Employee } from '../../types';

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
    saveData,
    onExit
}) => {
    if (employeesToRate.length === 0) return null;
    const employeeToRate = employeesToRate[currentRatingIndex];
    const isLastEmployee = currentRatingIndex === employeesToRate.length - 1;
    const currentEmployeeRatings = currentRatings[employeeToRate.id] || {};

    return (
        <div className="min-h-screen bg-[#F1F8FB] flex flex-col items-center justify-center p-6">
            <div className={`max-w-xl w-full bg-white ${THEME.shapes.extraLarge} p-8 shadow-[0_4px_20px_0px_rgba(0,0,0,0.05)] border border-[#CFE9F3] transition-all duration-300 ${animating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={saveData} className="text-[#37474F] hover:bg-[#CFE9F3] p-2.5 rounded-full transition-colors">
                        <span className="font-semibold text-xs tracking-wider">EXIT</span>
                    </button>
                    <div className={`px-4 py-1.5 bg-[#B3E5FC]/50 border border-[#B3E5FC] rounded-full text-[#01579B] text-sm font-medium`}>
                        {currentRatingIndex + 1} of {employeesToRate.length}
                    </div>
                    <button onClick={onExit} className="text-[#37474F] hover:bg-[#FFCDD2] hover:text-[#D32F2F] p-2.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6 group">
                        {employeeToRate.photo ? (
                            <img src={employeeToRate.photo} alt={employeeToRate.name} className="w-32 h-32 rounded-full object-cover shadow-lg border-[6px] border-[#CFE9F3] aspect-square" />
                        ) : (
                            <div className={`w-32 h-32 rounded-full ${employeeToRate.avatar} flex items-center justify-center text-white text-5xl font-bold shadow-lg border-[6px] border-[#CFE9F3] aspect-square`}>
                                {employeeToRate.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {isAdminRating && (
                            <div className="absolute -bottom-1 -right-1 bg-[#0277BD] text-white p-2.5 rounded-[12px] shadow-md border-2 border-white" title="Admin Rating Session">
                                <Shield className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <h2 className={`${THEME.typography.headlineMedium} text-center flex items-center gap-2 text-[#263238]`}>
                        {employeeToRate.name}
                        <div className="bg-[#0277BD]/10 p-1.5 rounded-full">
                            {isAdminRating ? <Shield className="w-5 h-5 text-[#0277BD]" /> : <Award className="w-5 h-5 text-[#0277BD]" />}
                        </div>
                    </h2>
                    <p className={`${THEME.typography.bodyMedium} text-[#37474F] mt-2 max-w-xs text-center`}>Please provide an honest assessment across the following criteria.</p>
                </div>

                {/* Ratings */}
                <div className="space-y-8">
                    {categories.map((category, idx) => (
                        <div key={category} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className={`${THEME.typography.titleMedium} text-[#263238]`}>{category}</h3>
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

                {/* Feedback Box - Employees Only (Visible after all ratings) */}
                {!isAdminRating && categories.every(cat => currentEmployeeRatings[cat]) && (
                    <div className="mt-8 animate-fade-in">
                        <h3 className={`${THEME.typography.titleMedium} text-[#263238] mb-3`}>Additional Feedback (Optional)</h3>
                        <textarea
                            className={`w-full p-4 bg-white border border-[#CFE9F3] ${THEME.shapes.large} text-[#263238] placeholder-[#546E7A] focus:outline-none focus:border-[#0277BD] focus:ring-1 focus:ring-[#0277BD] transition-all min-h-[120px] resize-none hover:border-[#546E7A]`}
                            placeholder="Share your thoughts on their performance..."
                            value={currentFeedbacks[employeeToRate.id] || ''}
                            onChange={(e) => submitFeedback(e.target.value)}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-[#CFE9F3] w-full">
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
