import React from 'react';

interface VoteHistoryTableLoaderProps {
  rowCount?: number;
  className?: string;
  message?: string;
  showMessage?: boolean;
}

const VoteHistoryTableLoader: React.FC<VoteHistoryTableLoaderProps> = ({ 
  rowCount = 8, 
  className = '',
}) => {
  const rows = Array(rowCount).fill(null);

  return (
    <div className="overflow-x-auto bg-background shadow-lg rounded-lg">
      <section className="container">
        <div className="border-b border-dark-light pt-4 pb-4">
          <div className="h-8 bg-background-light rounded animate-pulse w-36"></div>
        </div>
        
        <div className="flex justify-between items-center py-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="h-10 bg-background-light rounded animate-pulse w-full"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 bg-background-light rounded animate-pulse w-32"></div>
            <div className="h-10 bg-background-light rounded animate-pulse w-24"></div>
          </div>
        </div>
      </section>
      
      <div className="container mb-4">
        <div className="w-full bg-background shadow-sm overflow-hidden rounded-lg border border-dark-light">
          <div className="overflow-x-auto">
            <table className="min-w-full w-max">
              <thead className="bg-background-lighter whitespace-nowrap">
                <tr>
                  <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-16"></div>
                  </th>
                  <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-24"></div>
                  </th>
                  <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-20"></div>
                  </th>
                  <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-14"></div>
                  </th>
                  <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-20"></div>
                  </th>
                  <th className="py-3 px-4 border-b border-r border-dark-light text-center font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-14 mx-auto"></div>
                  </th>
                  <th className="py-3 px-4 border-b border-r border-dark-light text-left font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-22"></div>
                  </th>
                  <th className="py-3 px-4 border-b border-dark-light text-left font-medium text-content-gray-persist">
                    <div className="h-5 bg-background-light rounded animate-pulse w-24"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {rows.map((_, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-background-lighter' : 'bg-background'}>
                    <td className="py-4 px-4 border-b border-r border-dark-light">
                      <div className="h-5 bg-background-light rounded animate-pulse w-16"></div>
                    </td>
                    <td className="py-4 px-4 border-b border-r border-dark-light">
                      <div className="flex items-center">
                        <div className="h-5 bg-background-light rounded animate-pulse w-24"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-r border-dark-light">
                      <div className="flex items-center">
                        <div className="h-5 bg-background-light rounded animate-pulse w-20"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-r border-dark-light">
                      <div className="flex items-center">
                        <div className="h-5 bg-background-light rounded animate-pulse w-14"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-r border-dark-light">
                      <div className="flex flex-col">
                        <div className="h-5 bg-background-light rounded animate-pulse w-20 mb-1"></div>
                        <div className="h-3 bg-background-light rounded animate-pulse w-14"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-r border-dark-light text-center">
                      <div className="h-5 bg-background-light rounded animate-pulse w-5 mx-auto"></div>
                    </td>
                    <td className="py-4 px-4 border-b border-r border-dark-light">
                      <div className="flex items-center">
                        <div className="h-5 bg-background-light rounded animate-pulse w-16"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-dark-light">
                      <div className="flex items-center">
                        <div className="h-5 bg-background-light rounded animate-pulse w-24"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-background rounded-b-lg border-t border-dark-light p-2">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <div className="h-8 bg-background-light rounded animate-pulse w-24"></div>
              </div>
              <div className="flex space-x-1">
                <div className="h-8 bg-background-light rounded animate-pulse w-10"></div>
                <div className="h-8 bg-background-light rounded animate-pulse w-10"></div>
                <div className="h-8 bg-background-light rounded animate-pulse w-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteHistoryTableLoader;
