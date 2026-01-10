import React, { useState } from 'react';
import { History, X } from 'lucide-react';
import type { Rating, Employee } from '../../types';
import { THEME } from '../../theme';

interface GivenRatingsViewProps {
    raterId: number;
    ratings: Rating[];
    employees: Employee[];
    onClose: () => void;
}

export const GivenRatingsView: React.FC<GivenRatingsViewProps> = ({ raterId, ratings, employees, onClose }) => {
    const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
    const givenRatings = ratings.filter(r => r.raterId === raterId);
    // Sort by newest first
    givenRatings.sort((a, b) => {
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tB - tA;
    });

    // Get unique employees rated by this person for the filter
    const ratedEmployeeIds = Array.from(new Set(givenRatings.map(r => r.ratedEmployeeId)));
    const ratedEmployeesList = ratedEmployeeIds.map(id => employees.find(e => e.id === id)).filter(Boolean) as Employee[];

    const filteredRatings = filterEmployeeId === 'all'
        ? givenRatings
        : givenRatings.filter(r => r.ratedEmployeeId.toString() === filterEmployeeId);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white ${THEME.shapes.extraLarge} w-full max-w-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className={`${THEME.typography.headlineMedium} text-[#263238] flex items-center gap-3`}>
                        <div className="bg-[#B3E5FC] p-2 rounded-full"><History className="w-6 h-6 text-[#01579B]" /></div>
                        Given Ratings History <span className="text-sm text-gray-500">({filteredRatings.length})</span>
                    </h2>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={filterEmployeeId}
                            onChange={(e) => setFilterEmployeeId(e.target.value)}
                            className="bg-[#CFE9F3] border-none rounded-[8px] px-4 py-2 text-[#37474F] font-medium focus:ring-2 focus:ring-[#0277BD] outline-none cursor-pointer flex-1 sm:flex-none"
                        >
                            <option value="all">All Employees</option>
                            {ratedEmployeesList.map(emp => (
                                <option key={emp.id} value={emp.id.toString()}>{emp.name}</option>
                            ))}
                        </select>
                        <button onClick={onClose} className="hover:bg-[#CFE9F3] p-2 rounded-full transition-colors shrink-0"><X className="w-6 h-6" /></button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                    {Object.values(filteredRatings.reduce((acc, r) => {
                        const key = `${r.ratedEmployeeId}-${r.timestamp}`;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(r);
                        return acc;
                    }, {} as Record<string, Rating[]>)).length > 0 ? (
                        Object.values(filteredRatings.reduce((acc, r) => {
                            const key = `${r.ratedEmployeeId}-${r.timestamp}`;
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(r);
                            return acc;
                        }, {} as Record<string, Rating[]>))
                            .sort((a, b) => new Date(b[0].timestamp).getTime() - new Date(a[0].timestamp).getTime())
                            .map((sessionRatings, idx) => {
                                const firstRating = sessionRatings[0];
                                const ratedEmployee = employees.find(e => e.id === firstRating.ratedEmployeeId);
                                const feedback = sessionRatings.find(r => r.feedback)?.feedback;

                                return (
                                    <div key={idx} className="border border-[#CFE9F3] p-4 rounded-[12px] hover:bg-[#F9F9FC] transition-colors">
                                        <div className="flex items-center justify-between mb-3 border-b border-[#CFE9F3] pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${ratedEmployee?.avatar || 'bg-gray-400'}`}>
                                                    {ratedEmployee?.name.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[#263238] text-sm">{ratedEmployee?.name || 'Unknown'}</div>
                                                    <div className="text-[10px] text-[#37474F]">
                                                        {new Date(firstRating.timestamp).toLocaleDateString()} • {new Date(firstRating.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                            {sessionRatings.map(r => (
                                                <div key={r.id} className="bg-[#CFE9F3] p-2 rounded-[8px]">
                                                    <div className="text-[10px] text-[#37474F] mb-0.5 truncate" title={r.category}>{r.category}</div>
                                                    <div className={`text-xs font-bold ${r.rating === 'Excellent' ? 'text-[#01579B]' : r.rating === 'Good' ? 'text-[#0277BD]' : 'text-[#D32F2F]'}`}>
                                                        {r.rating}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {feedback && (
                                            <div className="bg-[#B3E5FC]/20 p-3 rounded-[8px] border border-[#B3E5FC]">
                                                <div className="text-[10px] text-[#0277BD] font-semibold mb-1 uppercase tracking-wide">Feedback</div>
                                                <div className="text-sm text-[#263238] whitespace-pre-wrap">{feedback}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                    ) : (
                        <div className="text-center py-10 text-[#37474F]">No ratings given by this employee yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
