import Paragraph from '@/Components/atoms/Paragraph';
import Button from '@/Components/atoms/Button';
import { ChevronDown, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useLaravelReactI18n } from "laravel-react-i18n";

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
    label
}) => {
    const { t } = useLaravelReactI18n();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const defaultPlaceholder = placeholder || t('workflows.createService.step1.selectCategories');
    const defaultLabel = label || t('workflows.createService.step1.category');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Flatten categories to include only subcategories since parent categories are not selectable
    const allCategories = categories.reduce((acc, category) => {
        if (category.children) {
            acc.push(...category.children);
        }
        return acc;
    }, [] as Array<{ id: number; name: string; slug: string; parent_id: number }>);

    const getSelectedCategoryNames = () => {
        return selectedCategories.map(slug => {
            const category = allCategories.find(cat => cat.slug === slug);
            return { slug, name: category?.name || '' };
        }).filter(item => item.name);
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
        const updatedSelection = selectedCategories.filter(slug => slug !== categorySlug);
        onChange(updatedSelection);
    };

    return (
        <div className="relative z-10 bg-background">
            <label className="block font-medium text-content st mb-2">
                {defaultLabel}
            </label>
            <div className="relative" ref={dropdownRef}>
                {/* Dropdown Trigger */}
                <Button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full min-h-[42px] px-3 py-2 border border-gray-persist/[20%] rounded-lg bg-background text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1 flex-1">
                            {selectedCategories.length === 0 ? (
                                <Paragraph className="text-gray-persist/[0.7]">{defaultPlaceholder}</Paragraph>
                            ) : (
                                getSelectedCategoryNames().map((categoryItem) => (
                                    <div
                                        key={categoryItem.slug}
                                        className="inline-flex items-center p-2  text-xs  text-gray-persist rounded-md bg-gray-persist/[10%] "
                                    >
                                        {categoryItem.name}
                                    </div>
                                ))
                            )}
                        </div>
                        <ChevronDown 
                            className={`h-4 w-4 text-gray-persist transition-transform ${
                                isDropdownOpen ? 'rotate-180' : ''
                            }`} 
                        />
                    </div>
                </Button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                    <div className="absolute z-15 w-full bottom-full mb-1 bg-background border border-gray-persist/[20%] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {categories.map((category) => (
                            <div key={category.id}>
                                {/* Parent Category as Title (Non-selectable) */}
                                <div className="px-3 py-2 bg-background border-b border-gray-persist/[10%]">
                                    <Paragraph size='xs' className="font-bold text-content">
                                        {category.name}
                                    </Paragraph>
                                </div>
                                
                                {/* Subcategories (Selectable) */}
                                {category.children && category.children.map((subcategory) => (
                                    <label 
                                        key={subcategory.id} 
                                        className="flex items-center px-4 py-2 hover:bg-gray-persist/[20%] cursor-pointer select-none"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(subcategory.slug)}
                                            onChange={() => handleCategoryToggle(subcategory.slug)}
                                            className="mr-3 h-4 w-4 text-primary focus:ring-primary rounded"
                                        />
                                        <Paragraph size='sm'>
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
                <Paragraph className="text-xs text-gray-persist mt-2">
                    {t('workflows.createService.step1.selectedCategories', { count: selectedCategories.length })}
                </Paragraph>
            )}
        </div>
    );
};

export default CategoriesSelector;
