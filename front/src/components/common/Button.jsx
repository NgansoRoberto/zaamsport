function Button({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary',
  type = 'button',
}) {
  const base =
    'px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-800 focus:ring-red-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
