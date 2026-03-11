interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

export default function LoadingSpinner({ size = 'md', color = 'primary' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-emerald-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function LoadingButton({ children, isLoading, ...props }: any) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${props.className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
    >
      {isLoading && <LoadingSpinner size="sm" color="white" />}
      <span>{children}</span>
    </button>
  );
}
