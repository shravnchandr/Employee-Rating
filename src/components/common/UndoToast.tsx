import React from 'react';
import { X } from 'lucide-react';

interface UndoToastProps {
    message: string;
    onUndo: () => void;
    onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ message, onUndo, onDismiss }) => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
            <div className="bg-[#263238] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-[480px]">
                <span className="text-sm font-medium flex-1">{message}</span>
                <button
                    onClick={onUndo}
                    className="text-[#00ACC1] text-sm font-bold hover:text-[#B3E5FC] transition-colors whitespace-nowrap"
                >
                    Undo
                </button>
                <button
                    onClick={onDismiss}
                    className="text-gray-400 hover:text-white transition-colors shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
