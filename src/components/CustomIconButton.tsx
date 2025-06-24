import React from "react";

interface CustomIconButtonProps {
  onClick: () => void;
  Icon: React.ElementType;
  isActive: boolean;
  disabled: boolean;
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({
  onClick,
  Icon,
  isActive,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Toggle Multi Map Window"
      className={`w-10 h-10 rounded-full ${
        isActive ? "bg-black text-white" : "bg-white hover:bg-gray-100"
      } border border-gray-300 shadow-md flex items-center justify-center transition`}
    >
      <Icon />
    </button>
  );
};

export default CustomIconButton;
