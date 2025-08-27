import React from 'react';
import ServiceData = App.DataTransferObjects.ServiceData;

export default function ServiceCard({ service }: { service: ServiceData }) {

  const statusBadgeClasses = {
    offered: 'bg-green-500',
    needed: 'bg-orange-400'
  };

  const badgeType = service.type.toLowerCase() === 'offered' ? 'offered' : 'needed';
  const visibleCategories = service.categories?.slice(0, 2) || [];
  const extraCategoriesCount = Math.max(0, (service.categories?.length || 0) - 2);

  const truncateText = (text: string, maxLength: number = 15) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="flex-1 rounded-xl shadow-xs bg-background border-gray-200 flex-col justify-start items-start overflow-hidden" data-testid="service-card">
      <div className="self-stretch h-40 relative overflow-hidden" data-testid="service-card-image-container">
        <img
          src={service.header_image_url || '/images/default-service-header.jpg'}
          alt={service.title}
          className="w-full h-full"
        />
        <div className="absolute inset-0 p-2.5 flex flex-col justify-start items-end">
          <div
            className={`p-2 rounded-[30px] ${statusBadgeClasses[badgeType]} inline-flex justify-center items-center`}
            data-property-1={service.type}
          >
            <div className="justify-start text-white text-xs font-medium leading-3" data-testid="service-card-status-badge">
              {service.type === 'offered' ? 'Offering Service' : 'Requesting Service'}
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch p-3.5 flex flex-col justify-start items-start gap-5" data-testid="service-card-content">
        <div className="self-stretch bg-card flex flex-col justify-center items-start gap-3">
          <div className="self-stretch text-content justify-start text-xl font-medium leading-normal" data-testid="service-card-title">
            {service.title}
          </div>
          <div className="justify-start text-slate-500 text-sm font-normal leading-none">
            {service.name || service.user?.name || 'Unknown Provider'}
          </div>
        </div>

        {service.categories && service.categories.length > 0 && (
          <div className="self-stretch flex flex-wrap justify-start items-start gap-1.5 min-h-[28px]">
            {visibleCategories.map((category: {name: string}, index: number) => (
              <div
                key={index}
                className="bg-background-lighter border-border-secondary inline-flex items-center rounded-lg border px-2.5 py-1 flex-shrink-0 max-w-full"
                title={category.name}
              >
                <div className="text-slate-500 text-xs font-medium leading-3 truncate">
                  {truncateText(category.name)}
                </div>
              </div>
            ))}
            {extraCategoriesCount > 0 && (
              <div className="bg-background-lighter border-border-secondary inline-flex items-center rounded-lg border px-2.5 py-1 flex-shrink-0">
                <div className="text-slate-500 text-xs font-medium leading-3">
                  +{extraCategoriesCount}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
