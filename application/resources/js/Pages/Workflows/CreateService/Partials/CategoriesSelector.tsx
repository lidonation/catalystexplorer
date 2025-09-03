import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Array<{
        id: number;
        name: string;
        slug: string;
        parent_id: number;
    }>;
}

interface CategoriesSelectorProps {
    categories: Category[];
    selectedCategories: string[];
    onChange: (selectedCategories: string[]) => void;
    placeholder?: string;
    label?: string;
}

const CategoriesSelector: React.FC<CategoriesSelectorProps> = ({
    categories,
    selectedCategories,
    onChange,
    placeholder,
    label,
}) => {
    const { t } = useLaravelReactI18n();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const defaultPlaceholder =
        placeholder || t('workflows.createService.step1.selectCategories');
    const defaultLabel = label || t('workflows.createService.step1.category');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Flatten categories to include only subcategories since parent categories are not selectable
    const allCategories = categories.reduce(
        (acc, category) => {
            if (category.children) {
                acc.push(...category.children);
            }
            return acc;
        },
        [] as Array<{
            id: number;
            name: string;
            slug: string;
            parent_id: number;
        }>,
    );

    const getSelectedCategoryNames = () => {
        return selectedCategories
            .map((slug) => {
                const category = allCategories.find((cat) => cat.slug === slug);
                return { slug, name: category?.name || '' };
            })
            .filter((item) => item.name);
    };

    const handleCategoryToggle = (categorySlug: string) => {
        const currentSelection = [...selectedCategories];
        const categoryIndex = currentSelection.indexOf(categorySlug);

        if (categoryIndex > -1) {
            // Category is selected, remove it
            currentSelection.splice(categoryIndex, 1);
        } else {
            // Category is not selected, add it
            currentSelection.push(categorySlug);
        }

        onChange(currentSelection);
    };

    const removeCategoryFromSelection = (categorySlug: string) => {
        const updatedSelection = selectedCategories.filter(
            (slug) => slug !== categorySlug,
        );
        onChange(updatedSelection);
    };

    return (
        <div
            className="bg-background relative z-10"
            data-testid="service-categories-selector"
        >
            <label className="text-content st mb-2 block font-medium">
                {defaultLabel}
            </label>
            <div className="relative" ref={dropdownRef}>
                {/* Dropdown Trigger */}
                <Button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="border-gray-persist/[20%] bg-background focus:ring-primary focus:border-primary min-h-[42px] w-full rounded-lg border px-3 py-2 text-left focus:ring-2 focus:outline-none"
                    dataTestId="service-categories-dropdown-trigger"
                >
                    <div className="flex items-center justify-between">
                        <div
                            className="flex flex-1 flex-wrap gap-1"
                            data-testid="service-categories-selected-display"
                        >
                            {selectedCategories.length === 0 ? (
                                <Paragraph
                                    className="text-gray-persist/[0.7]"
                                    data-testid="service-categories-placeholder"
                                >
                                    {defaultPlaceholder}
                                </Paragraph>
                            ) : (
                                getSelectedCategoryNames().map(
                                    (categoryItem) => (
                                        <div
                                            key={categoryItem.slug}
                                            className="text-gray-persist bg-gray-persist/[10%] inline-flex items-center rounded-md p-2 text-xs"
                                            data-testid={`service-category-selected-${categoryItem.slug}`}
                                        >
                                            {categoryItem.name}
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                        <ChevronDown
                            className={`text-gray-persist h-4 w-4 transition-transform ${
                                isDropdownOpen ? 'rotate-180' : ''
                            }`}
                            data-testid="service-categories-dropdown-arrow"
                        />
                    </div>
                </Button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                    <div
                        className="bg-background border-gray-persist/[50%] absolute bottom-full z-15 mb-1 max-h-60 w-full overflow-y-auto rounded-lg border shadow-xl"
                        data-testid="service-categories-dropdown-content"
                    >
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                data-testid={`service-category-group-${category.slug}`}
                            >
                                {/* Parent Category as Title (Non-selectable) */}
                                <div
                                    className="bg-background border-gray-persist/[10%] border-b px-3 py-2"
                                    data-testid={`service-category-parent-${category.slug}`}
                                >
                                    <Paragraph
                                        size="xs"
                                        className="text-content font-bold"
                                    >
                                        {category.name}
                                    </Paragraph>
                                </div>

                                {/* Subcategories (Selectable) */}
                                {category.children &&
                                    category.children.map((subcategory) => (
                                        <label
                                            key={subcategory.slug}
                                            className="hover:bg-gray-persist/[20%] flex cursor-pointer items-center px-4 py-2 select-none"
                                            data-testid={`service-category-option-${subcategory.slug}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(
                                                    subcategory.slug,
                                                )}
                                                onChange={() =>
                                                    handleCategoryToggle(
                                                        subcategory.slug,
                                                    )
                                                }
                                                className="text-primary focus:ring-primary mr-3 h-4 w-4 rounded"
                                                data-testid={`service-category-checkbox-${subcategory.slug}`}
                                            />
                                            <Paragraph size="sm">
                                                {subcategory.name}
                                            </Paragraph>
                                        </label>
                                    ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedCategories.length > 0 && (
                <Paragraph
                    className="text-gray-persist mt-2 text-xs"
                    data-testid="service-categories-count"
                >
                    {t('workflows.createService.step1.selectedCategories', {
                        count: selectedCategories.length,
                    })}
                </Paragraph>
            )}
        </div>
    );
};

export default CategoriesSelector;
