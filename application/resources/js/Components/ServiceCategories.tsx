import React from 'react';
import Checkbox from '@/Components/atoms/Checkbox';
import Divider from '@/Components/Divider';
interface CategoryData {
  id: number;
  hash: string;
  name: string;
  slug: string;
  children?: {
    id: number;
    hash: string;
    name: string;
    slug: string;
  }[];
}

interface ServiceCategoriesProps {
  categories: CategoryData[];
  selectedCategories: string[];
  onCategoryToggle: (categoryHash: string) => void;
  filterable?: boolean;
}

export default function ServiceCategories({
  categories,
  selectedCategories,
  onCategoryToggle,
  filterable = true
}: ServiceCategoriesProps) {
  return (
    <div className="inline-flex flex-col justify-center items-start gap-5">
      {categories.map((category, categoryIndex) => (
        <React.Fragment key={category.hash}>
          <div className="w-full">
            <div className="flex flex-col justify-start items-start gap-3.5">
              <div className="self-stretch justify-start text-content text-base text-slate-900 font-semibold leading-none">
                {category.name}
              </div>
              <div className="flex flex-col justify-start items-start gap-[5px]">
                {category.children?.map((subCategory) => (
                  <div key={subCategory.hash} className="self-stretch py-[5px] inline-flex justify-start items-center gap-2.5">
                    {filterable && (
                      <Checkbox
                        size="sm"
                        checked={selectedCategories.includes(subCategory.hash)}
                        onChange={() => onCategoryToggle(subCategory.hash)}
                        className="bg-card"
                      />
                    )}
                    <div className="flex justify-start items-center gap-3">
                      <div className="inline-flex flex-col justify-center items-start">
                        <div className="justify-start font-medium text-gray-900/80 leading-tight">
                          {subCategory.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {categoryIndex < categories.length - 1 && (
            <Divider className="self-stretch h-px bg-gray-100 my-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
