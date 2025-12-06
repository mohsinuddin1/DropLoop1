/**
 * Reusable Loading Component
 * Provides consistent loading states across the application
 */

export function Spinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4',
    };

    return (
        <div
            className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export function PageLoader({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
            <Spinner size="lg" />
            {message && (
                <p className="mt-4 text-gray-600 text-sm">{message}</p>
            )}
        </div>
    );
}

export function FullPageLoader({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <Spinner size="xl" />
                {message && (
                    <p className="mt-4 text-gray-700 font-medium">{message}</p>
                )}
            </div>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    );
}

export function SkeletonList({ count = 3 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}

export function ButtonLoader({ size = 'sm' }) {
    return (
        <Spinner size={size} className="inline-block" />
    );
}

export default {
    Spinner,
    PageLoader,
    FullPageLoader,
    SkeletonCard,
    SkeletonList,
    ButtonLoader,
};
