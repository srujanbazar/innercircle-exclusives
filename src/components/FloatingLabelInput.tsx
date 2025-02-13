
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingLabelInput = ({ label, className, value, onChange, ...props }: FloatingLabelInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        value={value}
        onChange={(e) => {
          setHasValue(e.target.value.length > 0);
          onChange?.(e);
        }}
        className={cn(
          "h-12 px-4 pt-4 pb-2 w-full text-sm rounded-xl bg-gray-900/50 border-gray-800 text-white placeholder:text-transparent focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
          className
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value.length > 0);
        }}
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none text-gray-400",
          (isFocused || hasValue) ? "text-xs top-1" : "text-sm top-3"
        )}
      >
        {label}
      </label>
    </div>
  );
};
