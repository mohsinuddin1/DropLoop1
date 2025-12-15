import { ShieldCheck } from 'lucide-react';

export default function VerifiedBadge({ size = 'md', showText = true, variant = 'default' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-7 w-7'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    // Default: Blue verified badge (Twitter/X style)
    if (variant === 'default' || !variant) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <svg
                    className={sizeClasses[size]}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Shield background */}
                    <path
                        d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z"
                        fill="#1D9BF0"
                    />
                    {/* White checkmark */}
                    <path
                        d="M9.5 14.5L7 12L6.3 12.7L9.5 15.9L17.2 8.2L16.5 7.5L9.5 14.5Z"
                        fill="white"
                        strokeWidth="1"
                    />
                </svg>
                {showText && (
                    <span className={`font-semibold text-blue-700 ${textSizeClasses[size]}`}>
                        Gov ID Verified
                    </span>
                )}
            </span>
        );
    }

    // Compact: Just icon with tooltip
    if (variant === 'compact') {
        return (
            <span
                className="inline-flex items-center"
                title="Government ID Verified"
            >
                <svg
                    className={sizeClasses[size]}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z"
                        fill="#1D9BF0"
                    />
                    <path
                        d="M9.5 14.5L7 12L6.3 12.7L9.5 15.9L17.2 8.2L16.5 7.5L9.5 14.5Z"
                        fill="white"
                        strokeWidth="1"
                    />
                </svg>
            </span>
        );
    }

    // Premium: Gold/Premium verified badge
    if (variant === 'premium') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-full">
                <svg
                    className={sizeClasses[size]}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z"
                        fill="url(#goldGradient)"
                    />
                    <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M9.5 14.5L7 12L6.3 12.7L9.5 15.9L17.2 8.2L16.5 7.5L9.5 14.5Z"
                        fill="white"
                        strokeWidth="1"
                    />
                </svg>
                {showText && (
                    <span className={`font-semibold text-amber-700 ${textSizeClasses[size]}`}>
                        Gov ID Verified
                    </span>
                )}
            </span>
        );
    }
}
