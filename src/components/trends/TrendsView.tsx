import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, X } from 'lucide-react';
import type { Employee, Rating } from '../../types';
import { THEME } from '../../theme';

interface TrendsViewProps {
    employeeId: number;
    employees: Employee[];
    ratings: Rating[];
    onClose: () => void;
}

function buildDataPoints(employeeId: number, ratings: Rating[]) {
    const employeeRatings = ratings.filter(r => r.ratedEmployeeId === employeeId);
    const sortedRatings = [...employeeRatings].sort((a, b) => {
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tA - tB;
    });

    const groupedByDate: Record<string, Rating[]> = {};
    sortedRatings.forEach(r => {
        const date = r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'Unknown Date';
        if (!groupedByDate[date]) groupedByDate[date] = [];
        groupedByDate[date].push(r);
    });

    const values: Record<string, number> = { 'Needs Improvement': 1, 'Good': 2, 'Excellent': 3 };
    const calcScore = (rs: Rating[]) => rs.length ? rs.reduce((acc, r) => acc + (values[r.rating] || 0), 0) / rs.length : 0;

    return Object.keys(groupedByDate).map(date => {
        const dayRatings = groupedByDate[date];
        const adminRatings = dayRatings.filter(r => r.isAdminRating);
        const peerRatings = dayRatings.filter(r => !r.isAdminRating);
        const adminScore = calcScore(adminRatings);
        const peerScore = calcScore(peerRatings);

        let weighted = 0;
        if (adminRatings.length > 0 && peerRatings.length > 0) weighted = (adminScore * 0.6) + (peerScore * 0.4);
        else if (adminRatings.length > 0) weighted = adminScore;
        else if (peerRatings.length > 0) weighted = peerScore;

        return {
            date,
            weighted: Number(weighted.toFixed(2)),
            admin: adminRatings.length ? Number(adminScore.toFixed(2)) : null,
            peer: peerRatings.length ? Number(peerScore.toFixed(2)) : null
        };
    });
}

export const TrendsView: React.FC<TrendsViewProps> = ({ employeeId, employees, ratings, onClose }) => {
    const [compareWithId, setCompareWithId] = React.useState<number | ''>('');

    const dataPoints = React.useMemo(() => buildDataPoints(employeeId, ratings), [employeeId, ratings]);
    const compareDataPoints = React.useMemo(() =>
        compareWithId ? buildDataPoints(compareWithId as number, ratings) : [],
        [compareWithId, ratings]
    );

    const employee = employees.find(e => e.id === employeeId);
    const compareEmployee = compareWithId ? employees.find(e => e.id === compareWithId) : null;
    const availableForCompare = employees.filter(e => e.id !== employeeId);

    // Merge dataPoints + compareDataPoints by date for combined chart
    const allDates = Array.from(new Set([
        ...dataPoints.map(d => d.date),
        ...compareDataPoints.map(d => d.date)
    ])).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const mergedData = allDates.map(date => {
        const primary = dataPoints.find(d => d.date === date);
        const compare = compareDataPoints.find(d => d.date === date);
        return {
            date,
            weighted: primary?.weighted ?? null,
            admin: primary?.admin ?? null,
            peer: primary?.peer ?? null,
            compareWeighted: compare?.weighted ?? null,
        };
    });

    const chartData = compareWithId ? mergedData : dataPoints;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white ${THEME.shapes.extraLarge} w-full max-w-4xl p-8 shadow-2xl flex flex-col max-h-[90vh]`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`${THEME.typography.headlineMedium} text-[#263238] flex items-center gap-3`}>
                        <div className="bg-[#B3E5FC] p-2 rounded-full"><TrendingUp className="w-6 h-6 text-[#01579B]" /></div>
                        Performance Trend
                        <span className="text-sm text-gray-500">({dataPoints.length} points)</span>
                    </h2>
                    <button onClick={onClose} className="hover:bg-[#CFE9F3] p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>

                {/* Compare selector */}
                {availableForCompare.length > 0 && (
                    <div className="flex items-center gap-3 mb-5">
                        <span className={`${THEME.typography.labelLarge} text-[#37474F]`}>Compare with:</span>
                        <select
                            value={compareWithId}
                            onChange={(e) => setCompareWithId(e.target.value ? Number(e.target.value) : '')}
                            className={`px-4 py-2 border border-[#CFE9F3] ${THEME.shapes.medium} text-sm text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#0277BD] bg-white`}
                        >
                            <option value="">— No comparison —</option>
                            {availableForCompare.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                        {compareWithId && (
                            <button
                                onClick={() => setCompareWithId('')}
                                className="text-xs text-[#D32F2F] hover:underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}

                <div className="w-full h-[320px] mb-6">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#CFE9F3" />
                                <XAxis dataKey="date" stroke="#37474F" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(val) => val === 1 ? 'Needs work' : val === 2 ? 'Good' : 'Excellent'} stroke="#37474F" width={90} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [String(value), '']}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="weighted" stroke="#0277BD" strokeWidth={3} name={`${employee?.name || 'Employee'} (Weighted)`} dot={{ r: 4 }} activeDot={{ r: 8 }} connectNulls />
                                <Line type="monotone" dataKey="admin" stroke="#D32F2F" strokeWidth={2} name="Admin Score" strokeDasharray="5 5" connectNulls />
                                <Line type="monotone" dataKey="peer" stroke="#00897B" strokeWidth={2} name="Peer Score" strokeDasharray="3 3" connectNulls />
                                {compareWithId && (
                                    <Line type="monotone" dataKey="compareWeighted" stroke="#F57C00" strokeWidth={3} name={`${compareEmployee?.name || 'Compare'} (Weighted)`} dot={{ r: 4 }} activeDot={{ r: 8 }} strokeDasharray="8 3" connectNulls />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[#37474F]">No rating data available yet.</div>
                    )}
                </div>

                {/* Feedback List */}
                <div className="border-t border-[#CFE9F3] pt-5 overflow-y-auto">
                    <h3 className={`${THEME.typography.titleMedium} text-[#263238] mb-3`}>Recent Feedback</h3>
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
                        {ratings.filter(r => r.ratedEmployeeId === employeeId && r.feedback).length > 0 ? (
                            Object.values(
                                ratings
                                    .filter(r => r.ratedEmployeeId === employeeId && r.feedback)
                                    .reduce((acc, r) => {
                                        const key = `${r.raterId}-${r.timestamp}`;
                                        if (!acc[key]) acc[key] = r;
                                        return acc;
                                    }, {} as Record<string, Rating>)
                            )
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                .map((r, idx) => (
                                    <div key={idx} className="bg-[#F9F9FC] p-3 rounded-[8px] border border-[#CFE9F3]">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-[#0277BD]">{r.isAdminRating ? 'Admin' : r.raterName || 'Anonymous'}</span>
                                            <span className="text-[10px] text-[#37474F]">{new Date(r.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-[#263238]">{r.feedback}</p>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center text-[#37474F] py-4 text-sm">No written feedback available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
