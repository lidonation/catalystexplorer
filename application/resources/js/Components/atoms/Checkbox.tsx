import { InputHTMLAttributes, ReactNode } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}
export default function Checkbox({
  className = '',
  label,
  id,
  ...props
}: CheckboxProps) {
    
  return (
    <label
      htmlFor={id}
      className="flex w-full items-center justify-between gap-2 cursor-pointer select-none px-3 py-2 hover:rounded-lg hover:bg-background-lighter"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-m text-content">{label}</span>
      <input
        {...props}
        id={id}
        type="checkbox"
        className={
          'border-light-gray-persist hover:cursor-pointer checked:border-primary text-primary focus:ring-primary rounded-sm shadow-xs ' +
          className
        }
        onClick={(e) => e.stopPropagation()} 
      />
    </label>
  );
}
