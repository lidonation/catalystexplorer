import Checkbox from '@/Components/atoms/Checkbox';
import Divider from '@/Components/Divider';
import React from 'react';
import CategoryData = App.DataTransferObjects.CategoryData;

interface ServiceCategoriesProps {
    categories: CategoryData[];
    selectedCategories: string[];
    onCategoryToggle: (categoryHash: string) => void;
    filterable?: boolean;
}

interface CategoryChild {
    id: number;
    name: string;
    slug: string;
}

export default function ServiceCategories({
    categories,
    selectedCategories,
    onCategoryToggle,
    filterable = true,
}: ServiceCategoriesProps) {
    return (
        <div
            className="inline-flex flex-col items-start justify-center gap-5"
            data-testid="service-categories"
        >
            {categories.map((category, index) => {
                const isLast = index === categories.length - 1;
                return (
                    <React.Fragment key={category.id}>
                        <div
                            className="w-full"
                            data-testid={`category-group-${category.id}`}
                        >
                            <div className="flex flex-col items-start justify-start gap-3.5">
                                <div className="text-content justify-start self-stretch text-base leading-none font-semibold text-slate-900">
                                    {category.name}
                                </div>
                                <div className="flex flex-col items-start justify-start gap-[5px]">
                                    {(
                                        category.children as CategoryChild[]
                                    )?.map((subCategory: CategoryChild) => (
                                        <div
                                            key={subCategory.id}
                                            className="inline-flex items-center justify-start gap-2.5 self-stretch py-[5px]"
                                        >
                                            {filterable && (
                                                <Checkbox
                                                    checked={selectedCategories.includes(
                                                        String(subCategory.id),
                                                    )}
                                                    onChange={() =>
                                                        onCategoryToggle(
                                                            String(
                                                                subCategory.id,
                                                            ),
                                                        )
                                                    }
                                                    className="bg-card"
                                                />
                                            )}
                                            <div className="flex items-center justify-start gap-3">
                                                <div className="inline-flex flex-col items-start justify-center">
                                                    <div className="text-content-lighter justify-start leading-tight font-medium">
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
                            <Divider className="my-2 h-px self-stretch bg-gray-100" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
