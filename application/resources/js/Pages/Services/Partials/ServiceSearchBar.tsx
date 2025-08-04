import { forwardRef } from 'react';
import SearchBar from '@/Components/SearchBar';

interface ServiceSearchBarProps extends Omit<React.ComponentProps<typeof SearchBar>, 'initialSearch'> {
  value: string;
}

export const ServiceSearchBar = forwardRef<HTMLInputElement, ServiceSearchBarProps>(
  ({ value, handleSearch, className, ...props }, ref) => {
    return (
      <SearchBar
        {...props}
        ref={ref}
        initialSearch={value}
        handleSearch={handleSearch}
        className={className}
      />
    );
  }
);

ServiceSearchBar.displayName = 'ServiceSearchBar';
