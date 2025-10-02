import { Loader2 } from "lucide-react";

const Button = ({
  variant = "primary",
  varient,
  size = "medium",
  isLoading = false,
  icon: Icon,
  icons,
  children,
  className = "",
  ...props
}) => {
  // Support both 'variant' and 'varient' for backwards compatibility
  const buttonVariant = variant || varient || "primary";
  const IconComponent = Icon || icons;

  const baseClass = `inline-flex items-center justify-center cursor-pointer gap-2 border border-transparent font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all `;

  const variantClass = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white`,
    secondary: `bg-white hover:bg-slate-50 text-slate-700 border border-slate-300`,
    ghost: `bg-transparent hover:bg-slate-100 text-slate-700 border-none shadow-none`,
  };

  const sizeClass = {
    sm: `px-3 py-1.5 text-sm`,
    small: `px-3 py-1.5 text-sm`,
    medium: `px-4 py-2 text-sm`,
    large: `px-6 py-3 text-base`,
  };

  return (
    <button
      {...props}
      className={`${baseClass} ${variantClass[buttonVariant]} ${sizeClass[size]} ${className}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isLoading && IconComponent && <IconComponent className="h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;
