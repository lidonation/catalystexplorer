import { test, expect } from '@playwright/test';

test.describe('Services Page Tests', () => {
   test.beforeEach(async ({ page }) => {
       await page.goto('/en/services');
       await page.waitForLoadState('domcontentloaded');
   });

   test('should display services page with main elements', async ({ page }) => {
        await expect(page.locator('[data-testid="services-page"]')).toBeVisible();
        await expect(page.locator('[data-testid="services-page-title"]')).toContainText('Catalyst Services');
        await expect(page.locator('[data-testid="services-search-controls"]')).toBeVisible();
        await expect(page.locator('[data-testid="searchbar-input"]')).toBeVisible();
    });

   test('should display service cards', async ({ page }) => {
       await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();

       const serviceCards = page.locator('[data-testid="service-card"]');
       if (await serviceCards.count() > 0) {
           await expect(serviceCards.first()).toBeVisible();

           await expect(serviceCards.first().locator('[data-testid="service-card-title"]')).toBeVisible();
           await expect(serviceCards.first().locator('[data-testid="service-card-status-badge"]')).toBeVisible();
       }
   });

   test('should show mobile categories toggle on small screens', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        await expect(page.locator('[data-testid="mobile-categories-toggle"]')).toBeVisible();
        await expect(page.locator('[data-testid="mobile-categories"]')).not.toBeVisible();
        await page.locator('[data-testid="mobile-categories-toggle"]').click();

        await expect(page.locator('[data-testid="mobile-categories"]')).toBeVisible();
        await expect(page.locator('[data-testid="mobile-categories-toggle"]')).toContainText('Hide Categories');
        await page.locator('[data-testid="mobile-categories-toggle"]').click();
        await expect(page.locator('[data-testid="mobile-categories"]')).not.toBeVisible();
        await expect(page.locator('[data-testid="mobile-categories-toggle"]')).toContainText('Show Categories');
    });

   test('should display category filters in sidebar', async ({ page }) => {
       await expect(page.locator('[data-testid="categories-sidebar"]')).toBeVisible();
       await expect(page.locator('[data-testid="service-categories"]')).toBeVisible();

       const categoryCheckboxes = page.locator('[data-testid^="category-checkbox-"]');
       if (await categoryCheckboxes.count() > 0) {
           await expect(categoryCheckboxes.first()).toBeVisible();
       }
   });
   test('should show filters toggle button', async ({ page }) => {
       await expect(page.locator('[data-testid="filters-toggle-button"]')).toBeVisible();

       await page.locator('[data-testid="filters-toggle-button"]').click();

       await expect(page.locator('[data-testid="service-type-filter"]')).toBeVisible();
   });
});

test.describe('My Services Page Tests', () => {
   test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@catalystexplorer.com');
    await page.fill('input[name="password"]', 'ofnXIFbZ0JOuGBqx');

    const submitButton = page.locator('[data-testid="login-submit-button"]');

    await submitButton.click();
    await page.waitForTimeout(2000);

    await page.goto('/en/my/services');
    await page.waitForLoadState('domcontentloaded');

});

   test('should display my services page with add button', async ({ page }) => {
       await expect(page.locator('[data-testid="my-services-page"]')).toBeVisible();

       await expect(page.locator('[data-testid="my-services-page-title"]')).toContainText('My Services');

       await expect(page.locator('[data-testid="add-service-button"]')).toBeVisible();
       await expect(page.locator('[data-testid="add-service-button"]')).toHaveAttribute('href', /.*workflows\/create-service\/steps\/1.*/);
   });

    test('should display my service cards', async ({ page }) => {
       await expect(page.locator('[data-testid="my-services-grid"]')).toBeVisible();

       const myServiceCards = page.locator('[data-testid^="service-card"]');
       if (await myServiceCards.count() > 0) {
           await expect(myServiceCards.first()).toBeVisible();

           await expect(myServiceCards.first().locator('[data-testid="service-card-title"]')).toBeVisible();
           await expect(myServiceCards.first().locator('[data-testid="service-card-status-badge"]')).toBeVisible();
       }
   });
    test('should search my services', async ({ page }) => {
       await expect(page.locator('[data-testid="services-search-controls"]')).toBeVisible();

       await page.locator('[data-testid="searchbar-input"]').fill('my service');

       await page.waitForTimeout(400);

       await expect(page).toHaveURL(/.*\/my\/services\?.*search=my%20service.*/);
   });
});



test.describe('Create Service Workflow Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@catalystexplorer.com');
        await page.fill('input[name="password"]', 'ofnXIFbZ0JOuGBqx');
        await page.locator('[data-testid="login-submit-button"]').click();
        await page.waitForTimeout(2000);
    });

    test.describe('Step 1 - Service Details', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/en/workflows/create-service/steps/1');
            await page.waitForLoadState('domcontentloaded');
        });

        test('should display all form fields in step 1', async ({ page }) => {
            await expect(page.locator('[data-testid="service-type-selection"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-type-offered-radio"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-type-needed-radio"]')).toBeVisible();

            await expect(page.locator('[data-testid="service-title-field"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-title-input"]')).toBeVisible();

            await expect(page.locator('[data-testid="service-header-image-field"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-header-image-upload-area"]')).toBeVisible();

            await expect(page.locator('[data-testid="service-description-field"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-description-textarea"]')).toBeVisible();

            await expect(page.locator('[data-testid="service-categories-selector"]')).toBeVisible();

            await expect(page.locator('[data-testid="service-step1-previous-button"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-step1-next-button"]')).toBeVisible();
        });

        test('should select service type correctly', async ({ page }) => {
            await expect(page.locator('[data-testid="service-type-offered-radio"]')).toBeChecked();

            await page.locator('[data-testid="service-type-needed-radio"]').click();
            await expect(page.locator('[data-testid="service-type-needed-radio"]')).toBeChecked();
            await expect(page.locator('[data-testid="service-type-offered-radio"]')).not.toBeChecked();

            await page.locator('[data-testid="service-type-offered-radio"]').click();
            await expect(page.locator('[data-testid="service-type-offered-radio"]')).toBeChecked();
            await expect(page.locator('[data-testid="service-type-needed-radio"]')).not.toBeChecked();
        });

        test('should fill out service title and description', async ({ page }) => {
            const testTitle = 'Web Development Services';
            const testDescription = 'I provide full-stack web development services including React, Node.js, and database design.';

            await page.locator('[data-testid="service-title-input"]').fill(testTitle);
            await expect(page.locator('[data-testid="service-title-input"]')).toHaveValue(testTitle);

            await page.locator('[data-testid="service-description-textarea"]').fill(testDescription);
            await expect(page.locator('[data-testid="service-description-textarea"]')).toHaveValue(testDescription);
        });

        test('should handle image upload', async ({ page }) => {
            await expect(page.locator('[data-testid="service-header-image-placeholder"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-header-image-selected"]')).not.toBeVisible();

            const fileInput = page.locator('[data-testid="service-header-image-input"]');

            await expect(fileInput).toHaveAttribute('accept', 'image/*');
            await expect(fileInput).toHaveAttribute('type', 'file');
        });

        test('should select categories from dropdown', async ({ page }) => {
            await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();

            await expect(page.locator('[data-testid="service-categories-dropdown-content"]')).toBeVisible();

            const firstCategoryCheckbox = page.locator('[data-testid^="service-category-checkbox-"]').first();
            if (await firstCategoryCheckbox.isVisible()) {
                await firstCategoryCheckbox.click();
                await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();

                await expect(page.locator('[data-testid="service-categories-count"]')).toBeVisible();
            }
        });

        test('should validate required fields before allowing submission', async ({ page }) => {
            await expect(page.locator('[data-testid="service-step1-next-button"]')).toBeDisabled();

            await page.locator('[data-testid="service-title-input"]').fill('Test Service');
            await expect(page.locator('[data-testid="service-step1-next-button"]')).toBeDisabled();

            await page.locator('[data-testid="service-description-textarea"]').fill('Test description');
            await expect(page.locator('[data-testid="service-step1-next-button"]')).toBeDisabled();

            await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();
            const firstCategoryCheckbox = page.locator('[data-testid^="service-category-checkbox-"]').first();
            if (await firstCategoryCheckbox.isVisible()) {
                await firstCategoryCheckbox.click();
                await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();

                await expect(page.locator('[data-testid="service-step1-next-button"]')).not.toBeDisabled();
            }
        });

        test('should navigate to step 2 after successful submission', async ({ page }) => {
            await page.locator('[data-testid="service-title-input"]').fill('Complete Service');
            await page.locator('[data-testid="service-description-textarea"]').fill('Complete service description');

            await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();
            const firstCategoryCheckbox = page.locator('[data-testid^="service-category-checkbox-"]').first();
            if (await firstCategoryCheckbox.isVisible()) {
                await firstCategoryCheckbox.click();
                await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();
            }

            await page.locator('[data-testid="service-step1-next-button"]').click();

            await expect(page).toHaveURL(/.*workflows\/create-service\/steps\/2.*/);
        });
    });

    test.describe('Step 2 - Contact Information', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/en/workflows/create-service/steps/1');

            await page.locator('[data-testid="service-title-input"]').fill('Test Service for Step 2');
            await page.locator('[data-testid="service-description-textarea"]').fill('Test description');

            await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();
            const firstCategoryCheckbox = page.locator('[data-testid^="service-category-checkbox-"]').first();
            if (await firstCategoryCheckbox.isVisible()) {
                await firstCategoryCheckbox.click();
                await page.locator('[data-testid="service-categories-dropdown-trigger"]').click();
            }

            await page.locator('[data-testid="service-step1-next-button"]').click();
            await page.waitForLoadState('domcontentloaded');
        });

        test('should display all contact form fields', async ({ page }) => {
            await expect(page.locator('[data-testid="service-contact-information-form"]')).toBeVisible();

            await expect(page.locator('[data-testid="service-contact-name-input"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-contact-email-input"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-contact-website-input"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-contact-github-input"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-contact-linkedin-input"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-location-input"]')).toBeVisible();

            await expect(page.locator('[data-testid="service-step2-previous-button"]')).toBeVisible();
            await expect(page.locator('[data-testid="service-step2-submit-button"]')).toBeVisible();
        });

        test('should fill out contact information', async ({ page }) => {
            await page.locator('[data-testid="service-contact-name-input"]').fill('John Doe');
            await page.locator('[data-testid="service-contact-email-input"]').fill('john@example.com');
            await page.locator('[data-testid="service-contact-website-input"]').fill('https://johndoe.com');
            await page.locator('[data-testid="service-contact-github-input"]').fill('johndoe');
            await page.locator('[data-testid="service-contact-linkedin-input"]').fill('john-doe');
            await page.locator('[data-testid="service-location-input"]').fill('New York');

            await expect(page.locator('[data-testid="service-contact-name-input"]')).toHaveValue('John Doe');
            await expect(page.locator('[data-testid="service-contact-email-input"]')).toHaveValue('john@example.com');
            await expect(page.locator('[data-testid="service-contact-website-input"]')).toHaveValue('https://johndoe.com');
        });

        test('should validate email format', async ({ page }) => {
            await page.locator('[data-testid="service-contact-email-input"]').fill('invalid-email');

            await page.locator('[data-testid="service-contact-name-input"]').click();

            await expect(page.locator('[data-testid="service-contact-email-error"]')).toBeVisible();

            await page.locator('[data-testid="service-contact-email-input"]').fill('valid@example.com');

            await expect(page.locator('[data-testid="service-contact-email-error"]')).not.toBeVisible();
        });

        test('should validate website URL format', async ({ page }) => {
            await page.locator('[data-testid="service-contact-website-input"]').fill('not-a-url');
            await page.locator('[data-testid="service-contact-name-input"]').click();

            await expect(page.locator('[data-testid="service-contact-website-error"]')).toBeVisible();

            await page.locator('[data-testid="service-contact-website-input"]').fill('https://example.com');

            await expect(page.locator('[data-testid="service-contact-website-error"]')).not.toBeVisible();
        });

        test('should save contact info with save button', async ({ page }) => {
            await page.locator('[data-testid="service-contact-name-input"]').fill('Test User');
            await page.locator('[data-testid="service-contact-email-input"]').fill('test@example.com');

            await page.locator('[data-testid="service-contact-save-button"]').click();

            await expect(page.locator('[data-testid="service-contact-save-success-message"]')).toBeVisible();
        });

        test('should navigate back to step 1', async ({ page }) => {
            await page.locator('[data-testid="service-step2-previous-button"]').click();

            await expect(page).toHaveURL(/.*workflows\/create-service\/steps\/1.*/);
        });

        test('should validate required fields before final submission', async ({ page }) => {
            const submitButton = page.locator('[data-testid="service-step2-submit-button"]');

            await page.locator('[data-testid="service-contact-name-input"]').fill('Final Test');
            await page.locator('[data-testid="service-contact-email-input"]').fill('final@test.com');

            await expect(submitButton).not.toBeDisabled();
        });

        test('should complete service creation workflow', async ({ page }) => {
            await page.locator('[data-testid="service-contact-name-input"]').fill('Complete Test');
            await page.locator('[data-testid="service-contact-email-input"]').fill('complete@test.com');
            await page.locator('[data-testid="service-location-input"]').fill('Test City');

            await page.locator('[data-testid="service-step2-submit-button"]').click();

        });
    });
});
