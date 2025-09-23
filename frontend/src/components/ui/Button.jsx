import { Loader2 } from "lucide-react";

const Button = ({
  varient = "primary",
  size = "medium",
  isLoading = false,
  icons: Icon,
  children,
  ...props
}) => {
  const baseClass = `inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 disable:opacity-50 disable:cursor-not-allowed `;

  const varientClass = {
    primary: `bg-blue-900 hover:bg-blue-800 text-white`,
    secondary: `bg-white hover:bg-slate-50 text-slate-700 border border-slate-200`,
    ghost: `bg-transparent hover:bg-slate-100 text-slate-700`,
  };

  const sizeClass = {
    small: `px-3 py-1 h-8 text-sm`,
    medium: `px-4 py-2 h-10 text-sm`,
    large: `px-6 py-3 h-12 text-base`,
  };

  return (
    <button
      {...props}
      className={`${baseClass} ${varientClass[varient]} ${sizeClass[size]}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : ""}
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;
