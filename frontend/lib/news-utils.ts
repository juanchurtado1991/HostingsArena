export const CATEGORY_COLORS: Record<string, { base: string, active: string }> = {
    // Standardizing all to Blue for simplicity and consistency
    "default": {
        base: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10",
        active: "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
    }
};

export const getCategoryColorClasses = (category: string, isActive: boolean = false) => {
    const config = CATEGORY_COLORS.default;
    
    if (isActive) {
        return config.active;
    }

    return config.base;
};
