
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
          "h-14 px-4 w-full text-base rounded-2xl bg-[#13151a] border-none text-white placeholder:text-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
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
          (isFocused || hasValue || value) ? "opacity-0" : "text-base top-4"
        )}
      >
        {label}
      </label>
    </div>
  );
};
