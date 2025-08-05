import { forwardRef } from 'react';
import SearchBar from '@/Components/SearchBar';

interface ServiceSearchBarProps extends Omit<React.ComponentProps<typeof SearchBar>, 'initialSearch'> {
  value: string;
  className?: string;
}

export const ServiceSearchBar = forwardRef<HTMLInputElement, ServiceSearchBarProps>(
  ({ value, handleSearch, className, ...props }, ref) => {
    return (
      <div className={className}>
        <SearchBar
          {...props}
          ref={ref}
          initialSearch={value}
          handleSearch={handleSearch}
        />
      </div>
    );
  }
);
