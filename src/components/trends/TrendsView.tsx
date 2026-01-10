import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, X } from 'lucide-react';
import type { Rating } from '../../types';
import { THEME } from '../../theme';

interface TrendsViewProps {
    employeeId: number;
    ratings: Rating[];
    onClose: () => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ employeeId, ratings, onClose }) => {
    const employeeRatings = ratings.filter(r => r.ratedEmployeeId === employeeId);
    const sortedRatings = [...employeeRatings].sort((a, b) => {
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tA - tB;
    });

    const dataPoints: any[] = [];
    const groupedByDate: Record<string, Rating[]> = {};

    sortedRatings.forEach(r => {
        const date = r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'Unknown Date';
        if (!groupedByDate[date]) groupedByDate[date] = [];
        groupedByDate[date].push(r);
    });

    Object.keys(groupedByDate).forEach(date => {
        const dayRatings = groupedByDate[date];
        const adminRatings = dayRatings.filter(r => r.isAdminRating);
        const peerRatings = dayRatings.filter(r => !r.isAdminRating);

        const values: Record<string, number> = { 'Needs Improvement': 1, 'Good': 2, 'Excellent': 3 };

        const calcScore = (rs: Rating[]) => rs.length ? rs.reduce((acc, r) => acc + (values[r.rating] || 0), 0) / rs.length : 0;

        const adminScore = calcScore(adminRatings);
        const peerScore = calcScore(peerRatings);

        let weighted = 0;
        if (adminRatings.length > 0 && peerRatings.length > 0) weighted = (adminScore * 0.6) + (peerScore * 0.4);
        else if (adminRatings.length > 0) weighted = adminScore;
        else if (peerRatings.length > 0) weighted = peerScore;

        dataPoints.push({
            date,
            weighted: Number(weighted.toFixed(2)),
            admin: adminRatings.length ? Number(adminScore.toFixed(2)) : null,
            peer: peerRatings.length ? Number(peerScore.toFixed(2)) : null
        });
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white ${THEME.shapes.extraLarge} w-full max-w-4xl p-8 shadow-2xl flex flex-col max-h-[90vh]`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`${THEME.typography.headlineMedium} text-[#263238] flex items-center gap-3`}>
                        <div className="bg-[#B3E5FC] p-2 rounded-full"><TrendingUp className="w-6 h-6 text-[#01579B]" /></div>
                        Performance Trend <span className="text-sm text-gray-500">({dataPoints.length} points)</span>
                    </h2>
                    <button onClick={onClose} className="hover:bg-[#CFE9F3] p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="w-full h-[350px] mb-8">
                    {dataPoints.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataPoints} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#CFE9F3" />
                                <XAxis dataKey="date" stroke="#37474F" />
                                <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(val) => val === 1 ? 'Needs work' : val === 2 ? 'Good' : 'Excellent'} stroke="#37474F" width={100} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [value, 'Score']}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="weighted" stroke="#0277BD" strokeWidth={3} name="Weighted Score" dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="admin" stroke="#D32F2F" strokeWidth={2} name="Admin Score" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="peer" stroke="#00897B" strokeWidth={2} name="Peer Score" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[#37474F]">No rating data available yet.</div>
                    )}
                </div>

                {/* Feedback List */}
                <div className="border-t border-[#CFE9F3] pt-6">
                    <h3 className={`${THEME.typography.titleMedium} text-[#263238] mb-4`}>Recent Feedback</h3>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                        {sortedRatings.filter(r => r.feedback).length > 0 ? (
                            Object.values(sortedRatings.filter(r => r.feedback).reduce((acc, r) => {
                                const key = `${r.raterId}-${r.timestamp}`; // Deduplicate same session
                                if (!acc[key]) acc[key] = r;
                                return acc;
                            }, {} as Record<string, Rating>))
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
