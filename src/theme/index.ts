export const THEME = {
    colors: {
        primary: "bg-[#0277BD] text-white hover:bg-[#01579B]/90 hover:shadow-lg active:scale-[0.98]",
        primaryContainer: "bg-[#B3E5FC] text-[#01579B]",
        secondary: "bg-[#00897B] text-white",
        secondaryContainer: "bg-[#B2DFDB] text-[#004D40]",
        tertiary: "bg-[#00ACC1] text-white",
        tertiaryContainer: "bg-[#B2EBF2] text-[#006064]",
        error: "bg-[#D32F2F] text-white",
        errorContainer: "bg-[#FFCDD2] text-[#B71C1C]",
        surface: "bg-[#F1F8FB] text-[#263238]",
        surfaceVariant: "bg-[#CFE9F3] text-[#37474F]",
        background: "bg-[#F1F8FB]",
        outline: "border-[#546E7A]",
        outlineVariant: "border-[#B0BEC5]",
    },
    typography: {
        // Expressive typography with emphasis
        displayLarge: "text-[64px] leading-[72px] font-black tracking-[-1px]",
        displayMedium: "text-[52px] leading-[60px] font-black tracking-[-0.5px]",
        headlineLarge: "text-[36px] leading-[44px] font-bold tracking-tight",
        headlineMedium: "text-[32px] leading-[40px] font-bold tracking-tight",
        headlineSmall: "text-[28px] leading-[36px] font-bold",
        titleLarge: "text-[24px] leading-[32px] font-bold",
        titleMedium: "text-[18px] leading-[26px] font-bold tracking-[0.15px]",
        bodyLarge: "text-[16px] leading-[24px] font-normal tracking-[0.5px]",
        bodyMedium: "text-[14px] leading-[20px] font-normal tracking-[0.25px]",
        labelLarge: "text-[14px] leading-[20px] font-semibold tracking-[0.1px]",
    },
    shapes: {
        // Classic shapes
        extraSmall: "rounded-[4px]",
        small: "rounded-[8px]",
        medium: "rounded-[12px]",
        large: "rounded-[16px]",
        extraLarge: "rounded-[28px]",
        full: "rounded-full",
        // Expressive asymmetric shapes
        asymmetric1: "rounded-tl-[28px] rounded-br-[28px] rounded-tr-[8px] rounded-bl-[8px]",
        asymmetric2: "rounded-tl-[4px] rounded-br-[4px] rounded-tr-[24px] rounded-bl-[24px]",
        asymmetric3: "rounded-tl-[20px] rounded-br-[20px] rounded-tr-[4px] rounded-bl-[4px]",
        pill: "rounded-full",
        squircle: "rounded-[20px]",
    },
    animation: {
        // Standard animations
        base: "transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)]",
        // Expressive animations
        spring: "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        bounce: "transition-all duration-400 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
        smooth: "transition-all duration-600 ease-[cubic-bezier(0.4,0.0,0.2,1)]",
        snappy: "transition-all duration-200 ease-[cubic-bezier(0.4,0.0,1,1)]",
    },
    elevation: {
        low: "shadow-[0_1px_2px_0px_rgba(0,0,0,0.05)]",
        medium: "shadow-[0_4px_8px_0px_rgba(0,0,0,0.08)]",
        high: "shadow-[0_8px_16px_0px_rgba(0,0,0,0.12)]",
        highest: "shadow-[0_16px_32px_0px_rgba(0,0,0,0.16)]",
    }
};
