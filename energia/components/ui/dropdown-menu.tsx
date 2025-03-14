import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <Button onClick={toggleDropdown} variant="ghost">
          {trigger}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownMenuItem: React.FC<{ onClick: () => void }> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<{ align?: "start" | "end" }> = ({ align = "start", children }) => {
  return <div className={`dropdown-menu-content ${align}`}>{children}</div>;
};

export const DropdownMenuTrigger: React.FC<{ asChild: boolean }> = ({ asChild, children }) => {
  return <>{children}</>;
};