interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  styleType?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}
const Button: React.FC<ButtonProps> = ({ text, styleType = 'primary', isLoading = false, ...props }) => {
  const baseClasses = "px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50";
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseClasses} ${styles[styleType]}`} {...props} disabled={isLoading}>
      {isLoading ? 'Memuat...' : text}
    </button>
  );
};

export default Button;