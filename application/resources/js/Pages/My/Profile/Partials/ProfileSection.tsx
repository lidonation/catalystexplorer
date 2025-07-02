import Title from '@/Components/atoms/Title';
import { ReactNode } from 'react';

interface ProfileSectionProps {
  title: string;
  className?: string;
  rightElement?: ReactNode;
  children: ReactNode;
}

export default function ProfileSection({ 
  title, 
  className = '', 
  rightElement,
  children 
}: ProfileSectionProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <Title level="4" className="text-content font-bold">
          {title}
        </Title>
        {rightElement}
      </div>
      <div className="border-t border-gray-200">
        {children}
      </div>
    </div>
  );
}