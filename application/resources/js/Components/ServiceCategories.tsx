import React from 'react';
import Checkbox from '@/Components/atoms/Checkbox';
import Divider from '@/Components/Divider';
import CategoryData = App.DataTransferObjects.CategoryData;

interface ServiceCategoriesProps {
  categories: CategoryData[];
  selectedCategories: string[];
  onCategoryToggle: (categoryHash: string) => void;
  filterable?: boolean;
}

interface CategoryChild {
  id: number;
  hash: string;
  name: string;
  slug: string;
}

export default function ServiceCategories({
  categories,
  selectedCategories,
  onCategoryToggle,
  filterable = true
}: ServiceCategoriesProps) {
  return (
    <div className="inline-flex flex-col justify-center items-start gap-5">
      {categories.map((category, index) => {
        const isLast = index === categories.length - 1;
        return (
          <React.Fragment key={category.hash}>
            <div className="w-full">
              <div className="flex flex-col justify-start items-start gap-3.5">
                <div className="self-stretch justify-start text-content text-base text-slate-900 font-semibold leading-none">
                  {category.name}
                </div>
                <div className="flex flex-col justify-start items-start gap-[5px]">
                  {(category.children as CategoryChild[])?.map((subCategory: CategoryChild) => (
                    <div key={subCategory.hash} className="self-stretch py-[5px] inline-flex justify-start items-center gap-2.5">
                      {filterable && (
                        <Checkbox
                          checked={selectedCategories.includes(String(subCategory.hash))}
                          onChange={() => onCategoryToggle(String(subCategory.hash))}
                          className="bg-card"
                        />
                      )}
                      <div className="flex justify-start items-center gap-3">
                        <div className="inline-flex flex-col justify-center items-start">
                          <div className="justify-start font-medium text-content-lighter leading-tight">
                            {subCategory.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {!isLast && (
              <Divider className="self-stretch h-px bg-gray-100 my-2" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
