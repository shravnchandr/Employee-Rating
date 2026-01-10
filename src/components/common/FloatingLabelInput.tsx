import React from 'react';

interface FloatingLabelInputProps {
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    icon?: React.ElementType;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
    type = "text",
    value,
    onChange,
    placeholder,
    onKeyPress,
    icon: Icon = null
}) => {
    return (
        <div className="relative group">
            <input
                type={type}
                value={value}
                onChange={onChange}
                onKeyPress={onKeyPress}
                placeholder=" "
                className={`peer w-full h-[56px] px-4 pt-5 pb-2 bg-[#CFE9F3] rounded-t-[4px] border-b border-[#37474F] focus:border-b-2 focus:border-[#0277BD] focus:bg-[#B3E5FC]/20 outline-none text-[#263238] text-base placeholder-transparent transition-all`}
            />
            <label className={`absolute left-4 top-4 text-[#37474F] text-base transition-all duration-200 pointer-events-none
        peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base
        peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-[#0277BD]
        ${value ? '-translate-y-3 scale-75' : ''}`}>
                {placeholder}
            </label>
            {Icon && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#37474F]">
                    <Icon className="w-6 h-6" />
                </div>
            )}
        </div>
    );
};
