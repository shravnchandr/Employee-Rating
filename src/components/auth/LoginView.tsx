import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { THEME } from '../../theme';

interface LoginViewProps {
    adminPassword: string;
    setAdminPassword: (password: string) => void;
    handleAdminLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ adminPassword, setAdminPassword, handleAdminLogin }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F1F8FB] to-[#B3E5FC] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#B3E5FC]/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00ACC1]/20 rounded-full blur-3xl"></div>

            <div className="max-w-md w-full animate-fade-in-up relative z-10">
                <div className="text-center mb-12 transform hover:scale-105 transition-transform duration-500">
                    {/* Janhavi Medicals Logo */}
                    <div className={`mx-auto w-40 h-40 bg-white ${THEME.shapes.asymmetric1} flex items-center justify-center mb-8 ${THEME.elevation.high} hover:shadow-2xl ${THEME.animation.spring} hover:scale-110 p-6`}>
                        <img src="./janhavi-logo.jpg" alt="Janhavi Medicals" className="w-full h-full object-contain" />
                    </div>
                    {/* Company branding */}
                    <h1 className={`${THEME.typography.headlineLarge} text-[#263238] mb-2`}>Janhavi Medicals</h1>
                    <p className={`${THEME.typography.titleMedium} text-[#0277BD] font-bold mb-3`}>Since 1984</p>
                    <p className={`${THEME.typography.bodyLarge} text-[#37474F] max-w-xs mx-auto`}>Employee Performance Evaluation Portal</p>
                </div>

                <div className={`bg-white/95 backdrop-blur-sm p-10 ${THEME.shapes.extraLarge} ${THEME.elevation.medium} border border-[#CFE9F3]/50`}>
                    <div className="space-y-8">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                                placeholder=" "
                                className={`peer w-full h-[64px] px-5 pt-6 pb-2 bg-[#CFE9F3] ${THEME.shapes.medium} border-2 border-transparent focus:border-[#0277BD] focus:bg-[#B3E5FC]/20 outline-none text-[#263238] text-lg placeholder-transparent ${THEME.animation.spring}`}
                            />
                            <label className={`absolute left-5 top-5 text-[#37474F] text-base ${THEME.animation.spring} pointer-events-none
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base
                peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[#0277BD] peer-focus:font-semibold
                ${adminPassword ? '-translate-y-4 scale-75 font-semibold' : ''}`}>
                                Admin Password
                            </label>
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#37474F] hover:bg-[#CFE9F3] p-3 ${THEME.shapes.full} ${THEME.animation.spring} hover:scale-110`}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* More prominent, expressive button */}
                        <button
                            onClick={handleAdminLogin}
                            className={`w-full ${THEME.colors.primary} ${THEME.shapes.full} py-5 px-8 ${THEME.typography.labelLarge} text-lg ${THEME.elevation.medium} hover:shadow-2xl ${THEME.animation.spring} hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group`}
                        >
                            <span>Access Dashboard</span>
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* <div className="text-center pt-2">
                            <p className={`${THEME.typography.bodyMedium} text-[#37474F]`}>Default password: <span className="font-semibold">admin123</span></p>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};
