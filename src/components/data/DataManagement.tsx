import React, { useState, useRef } from 'react';
import { ArrowLeft, Download, Database, Upload, X, Calendar } from 'lucide-react';
import { THEME } from '../../theme';

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

interface DataManagementProps {
    onExport: (dateRange?: DateRange) => void;
    onBackup: () => void;
    onRestore: (data: string) => void;
    onBack: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
    onExport,
    onBackup,
    onRestore,
    onBack
}) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dateRange = (startDate || endDate)
            ? { startDate: startDate || null, endDate: endDate || null }
            : undefined;
        onExport(dateRange);
        setShowExportModal(false);
        setStartDate('');
        setEndDate('');
    };

    const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            try {
                JSON.parse(content); // Validate JSON
                if (confirm('Are you sure you want to restore from this backup? This will overwrite all current data.')) {
                    onRestore(content);
                    alert('Data restored successfully!');
                }
            } catch {
                alert('Invalid backup file. Please select a valid JSON backup.');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F1F8FB] to-[#B3E5FC] p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center gap-4 mb-10">
                    <button
                        onClick={onBack}
                        className={`p-3 hover:bg-white ${THEME.shapes.full} ${THEME.animation.spring} ${THEME.elevation.low}`}
                    >
                        <ArrowLeft className="w-6 h-6 text-[#37474F]" />
                    </button>
                    <div className="flex items-center gap-4">
                        <img src="./janhavi-logo.jpg" alt="Janhavi Medicals" className="w-16 h-16 object-contain" />
                        <div>
                            <h1 className={`${THEME.typography.displayMedium} text-[#263238]`}>Data Management</h1>
                            <p className={`${THEME.typography.bodyLarge} text-[#37474F] mt-1`}>Export, backup, and restore your data</p>
                        </div>
                    </div>
                </header>

                {/* Action Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Export to Excel */}
                    <button
                        onClick={() => setShowExportModal(true)}
                        className={`bg-white/95 backdrop-blur-sm p-8 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-16 h-16 bg-gradient-to-br from-[#00897B] to-[#4DB6AC] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-5 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <Download className="w-8 h-8 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>Export to Excel</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F]`}>
                            Download all data as an Excel spreadsheet with optional date filtering
                        </p>
                    </button>

                    {/* Backup Data */}
                    <button
                        onClick={onBackup}
                        className={`bg-white/95 backdrop-blur-sm p-8 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                    >
                        <div className={`w-16 h-16 bg-gradient-to-br from-[#1565C0] to-[#42A5F5] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-5 group-hover:scale-110 ${THEME.animation.spring}`}>
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <h2 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>Backup Data</h2>
                        <p className={`${THEME.typography.bodyMedium} text-[#37474F]`}>
                            Download a complete JSON backup of all your data
                        </p>
                    </button>

                    {/* Restore Data */}
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".json"
                            onChange={handleRestoreFile}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full bg-white/95 backdrop-blur-sm p-8 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50 hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] text-left group`}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br from-[#F57C00] to-[#FFB74D] ${THEME.shapes.asymmetric2} flex items-center justify-center mb-5 group-hover:scale-110 ${THEME.animation.spring}`}>
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <h2 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>Restore Data</h2>
                            <p className={`${THEME.typography.bodyMedium} text-[#37474F]`}>
                                Restore from a previously saved JSON backup file
                            </p>
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className={`mt-8 p-6 bg-[#E3F2FD] ${THEME.shapes.large} border border-[#90CAF9]`}>
                    <h3 className={`${THEME.typography.titleMedium} text-[#1565C0] mb-2`}>About Data Management</h3>
                    <ul className={`${THEME.typography.bodyMedium} text-[#37474F] space-y-2`}>
                        <li><strong>Export to Excel:</strong> Creates a formatted spreadsheet with summary and individual employee data sheets.</li>
                        <li><strong>Backup Data:</strong> Creates a complete JSON backup that can be restored later.</li>
                        <li><strong>Restore Data:</strong> Overwrites all current data with a backup file. Use with caution.</li>
                    </ul>
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={`bg-white ${THEME.shapes.extraLarge} ${THEME.elevation.high} max-w-md w-full p-6 animate-fade-in-up`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`${THEME.typography.headlineSmall} text-[#263238]`}>Export Data</h2>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-[#37474F]" />
                            </button>
                        </div>

                        <p className={`${THEME.typography.bodyMedium} text-[#37474F] mb-4`}>
                            Optionally select a date range to filter exported data. Leave empty to export all data.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block ${THEME.typography.labelLarge} text-[#37474F] mb-2`}>
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`w-full px-4 py-3 border border-gray-300 ${THEME.shapes.medium} focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-transparent`}
                                />
                            </div>
                            <div>
                                <label className={`block ${THEME.typography.labelLarge} text-[#37474F] mb-2`}>
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || undefined}
                                    className={`w-full px-4 py-3 border border-gray-300 ${THEME.shapes.medium} focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-transparent`}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className={`flex-1 px-4 py-3 border border-gray-300 text-[#37474F] hover:bg-gray-50 ${THEME.shapes.medium} ${THEME.animation.spring}`}
                            >
                                Clear Dates
                            </button>
                            <button
                                onClick={handleExport}
                                className={`flex-1 px-4 py-3 bg-[#00897B] text-white hover:bg-[#00796B] ${THEME.shapes.medium} ${THEME.animation.spring} flex items-center justify-center gap-2`}
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
