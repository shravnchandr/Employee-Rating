import React from 'react';
import { THEME } from '../../theme';

interface RatingButtonProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    colorClass: string;
    shapeVariant?: 'needs' | 'good' | 'excellent';
}

export const RatingButton: React.FC<RatingButtonProps> = ({ label, isSelected, onClick, colorClass, shapeVariant = 'good' }) => {
    // Different shapes for visual variety
    const shapeClass = shapeVariant === 'needs'
        ? THEME.shapes.asymmetric2
        : shapeVariant === 'excellent'
            ? THEME.shapes.asymmetric1
            : THEME.shapes.squircle;

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden ${shapeClass} p-5 ${THEME.animation.bounce} flex-1 border-2 ${isSelected
                    ? `border-transparent transform scale-[1.05] ${THEME.elevation.high}`
                    : 'border-[#B0BEC5] hover:border-[#546E7A] bg-white hover:bg-[#CFE9F3] hover:scale-[1.02]'
                } ${isSelected ? colorClass : ''}`}
        >
            <div className={`text-center ${THEME.typography.labelLarge} relative z-10 ${isSelected ? 'text-white' : 'text-[#37474F] group-hover:text-[#263238]'}`}>
                {label}
            </div>
            {isSelected && (
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            )}
        </button>
    );
};
