import React, { ReactNode } from 'react';
import Paragraph from '@/Components/atoms/Paragraph';
import { CopyIcon } from 'lucide-react';
import { copyToClipboard } from '@/utils/copyClipboard';

interface DetailRowProps {
  label: string;
  value?: string | number | null;
  copyable?: boolean;
  background?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function DetailRow({
  label,
  value = '',
  copyable = false,
  background = false,
  className = '',
  children
}: DetailRowProps) {
  const displayValue = value !== null && value !== undefined ? String(value) : '';
  return (
    <div className={`flex items-start border-b border-background-lighter pb-4 ${className}`}>
      <Paragraph className='text-gray-persist w-36'>{label}</Paragraph>
      
      {children ? (
        children
      ) : (
        <div className='flex items-center flex-1'>
          <Paragraph 
            className={`text-content font-bold truncate mr-2 ${background ? 'bg-background-lighter px-2 py-1 rounded-sm' : ''}`}
          >
            {value}
          </Paragraph>
          
          {copyable && (
            <CopyIcon
              className='cursor-pointer text-gray-400 w-4 h-4'
              onClick={() => copyToClipboard(displayValue)}
            />
          )}
        </div>
      )}
    </div>
  );
}
