import { expect, test } from '@playwright/test';

async function completeStep1(page) {
    const step1Active = page.locator('[data-testid="step-number-1"]');
    await expect(step1Active).toBeVisible();
    await expect(step1Active).toHaveClass(/border-primary/);
    await expect(step1Active).toHaveClass(/text-primary/);

    const fundSelector = page.locator('[data-testid="tinder-fund-selector"]');
    await fundSelector.click();
    await page.locator('[data-testid="selector-option-f39vza7c05"]').click();

    const proposalCategoryCheckboxes = page.locator(
        '[data-testid="proposal-type-checkbox"]',
    );
    for (let i = 0; i < 4; i++) {
        const checkbox = proposalCategoryCheckboxes.nth(i);
        await checkbox.click();
        await expect(checkbox).toBeChecked();
    }

    const proposalSizeCheckbox = page
        .locator('[data-testid="proposal-size-checkbox"]')
        .first();
    await proposalSizeCheckbox.click();
    await expect(proposalSizeCheckbox).toBeChecked();

    const impactTypeCheckbox = page
        .locator('[data-testid="impact-type-checkbox"]')
        .first();
    await impactTypeCheckbox.click();
    await expect(impactTypeCheckbox).toBeChecked();

    const beginButton = page.locator('[data-testid="tinder-begin-button"]');
    await beginButton.click();

    await page.goto('/workflows/tinder-proposal/steps/2', {
        waitUntil: 'domcontentloaded',
    });
}

async function step1WithNoCategories(page) {
    const step1Active = page.locator('[data-testid="step-number-1"]');
    await expect(step1Active).toBeVisible();
    await expect(step1Active).toHaveClass(/border-primary/);
    await expect(step1Active).toHaveClass(/text-primary/);

    const fundSelector = page.locator('[data-testid="tinder-fund-selector"]');
    await fundSelector.click();
    await page.locator('[data-testid="selector-option-vd8fn02sxi"]').click();

    const proposalSizeCheckbox = page
        .locator('[data-testid="proposal-size-checkbox"]')
        .first();
    await proposalSizeCheckbox.click();
    await expect(proposalSizeCheckbox).toBeChecked();

    const impactTypeCheckbox = page
        .locator('[data-testid="impact-type-checkbox"]')
        .first();
    await impactTypeCheckbox.click();
    await expect(impactTypeCheckbox).toBeChecked();

    const beginButton = page.locator('[data-testid="tinder-begin-button"]');
    await beginButton.click();

    await page.goto('/workflows/tinder-proposal/steps/2', {
        waitUntil: 'domcontentloaded',
    });
}

async function completeStep2(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step2Active = page.locator('[data-testid="step-number-2"]');
    await expect(step2Active).toBeVisible();
    await expect(step2Active).toHaveClass(/border-primary/);
    await expect(step2Active).toHaveClass(/text-primary/);

    await page
        .locator('[data-testid="tinder-proposal-title-input"]')
        .fill('Test Proposal Title');
    await page
        .locator('[data-testid="tinder-proposal-content-textarea"]')
        .fill(
            'This is a test for the tinder proposal workflow. Writing a test to see if it works as it should.',
        );

    const visibilityRadioGroup = page
        .locator('[data-testid="tinder-visibility-radio-group"]')
        .first();
    await expect(visibilityRadioGroup).toBeVisible();

    const commentsSwitch = page.locator(
        '[data-testid="tinder-comments-switch"]',
    );
    await commentsSwitch.click();
    await expect(commentsSwitch).toBeChecked();

    await page.locator('[data-testid="color-text-input"]').fill('#ff0000');
    await page.locator('[data-testid="color-picker-input"]').click();

    const statusRadioGroup = page
        .locator('[data-testid="tinder-status-radio-group"]')
        .first();
    await expect(statusRadioGroup).toBeVisible();

    const saveButton = page.locator('[data-testid="tinder-save-button"]');
    await saveButton.click();

    await page.goto('/workflows/tinder-proposal/steps/3', {
        waitUntil: 'domcontentloaded',
    });
}

async function completeStep3(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step3Active = page.locator('[data-testid="step-number-3"]');
    await expect(step3Active).toBeVisible();
    await expect(step3Active).toHaveClass(/border-primary/);
    await expect(step3Active).toHaveClass(/text-primary/);

    const proposalsContainer = page.locator(
        '[data-testid="proposals-container"]',
    );
    await expect(proposalsContainer).toBeVisible();

    const proposalCards = page.locator(
        '[data-testid^="vertical-proposal-card-"]',
    );
    const totalProposals = await proposalCards.count();

    const totalRatioParts = 1 + 3;
    const noClicks = Math.floor((1 / totalRatioParts) * totalProposals);
    const yesClicks = totalProposals - noClicks;

    console.log(`Clicking NO ${noClicks} times, YES ${yesClicks} times.`);

    const initialNoCountElement = page.locator('[data-testid="no-count"]');
    const initialNoCountText =
        (await initialNoCountElement.textContent()) || '(0)';
    const matchNo = initialNoCountText.match(/\((\d+)\)/);
    const initialNoCount = matchNo ? parseInt(matchNo[1], 10) : 0;

    const initialYesCountElement = page.locator('[data-testid="yes-count"]');
    const initialYesCountText =
        (await initialYesCountElement.textContent()) || '(0)';
    const matchYes = initialYesCountText.match(/\((\d+)\)/);
    const initialYesCount = matchYes ? parseInt(matchYes[1], 10) : 0;

    const noButton = page.locator('[data-testid="no-button"]');
    const yesButton = page.locator('[data-testid="yes-button"]');

    for (let i = 0; i < noClicks; i++) {
        await expect(noButton).toBeVisible();
        await noButton.click();
    }

    for (let i = 0; i < yesClicks; i++) {
        await expect(yesButton).toBeVisible();
        await yesButton.click();
    }

    const newNoCountText = (await initialNoCountElement.textContent()) || '(0)';
    const matchNewNo = newNoCountText.match(/\((\d+)\)/);
    const newNoCount = matchNewNo ? parseInt(matchNewNo[1], 10) : 0;

    const newYesCountText =
        (await initialYesCountElement.textContent()) || '(0)';
    const matchNewYes = newYesCountText.match(/\((\d+)\)/);
    const newYesCount = matchNewYes ? parseInt(matchNewYes[1], 10) : 0;

    expect(newNoCount).toBeGreaterThanOrEqual(initialNoCount + noClicks);
    expect(newYesCount).toBeGreaterThanOrEqual(initialYesCount + yesClicks);

    const noMoreCards = page.locator('[data-testid="no-more-cards"]');
    await expect(noMoreCards).toBeVisible({ timeout: 10000 });

    const saveProgressButton = page.locator(
        '[data-testid="save-progress-button"]',
    );
    await expect(saveProgressButton).toBeVisible();
    await saveProgressButton.click();

    await page.goto('/workflows/tinder-proposal/steps/4', {
        waitUntil: 'domcontentloaded',
    });
}

async function step3WithNoRecords(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step3Active = page.locator('[data-testid="step-number-3"]');
    await expect(step3Active).toBeVisible();
    await expect(step3Active).toHaveClass(/border-primary/);
    await expect(step3Active).toHaveClass(/text-primary/);

    const proposalsContainer = page.locator(
        '[data-testid="no-proposals-found"]',
    );
    await expect(proposalsContainer).toBeVisible();
}

async function step3WithEditing(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step3Active = page.locator('[data-testid="step-number-3"]');
    await expect(step3Active).toBeVisible();
    await expect(step3Active).toHaveClass(/border-primary/);
    await expect(step3Active).toHaveClass(/text-primary/);

    const proposalsContainer = page.locator(
        '[data-testid="proposals-container"]',
    );
    await expect(proposalsContainer).toBeVisible();

    const proposalCards = page.locator(
        '[data-testid^="vertical-proposal-card-"]',
    );
    const totalProposals = await proposalCards.count();

    const totalRatioParts = 1 + 3;
    const noClicks = Math.floor((1 / totalRatioParts) * totalProposals);
    const yesClicks = totalProposals - noClicks;

    console.log(`Clicking NO ${noClicks} times, YES ${yesClicks} times.`);

    const initialNoCountElement = page.locator('[data-testid="no-count"]');
    const initialNoCountText =
        (await initialNoCountElement.textContent()) || '(0)';
    const matchNo = initialNoCountText.match(/\((\d+)\)/);
    const initialNoCount = matchNo ? parseInt(matchNo[1], 10) : 0;

    const initialYesCountElement = page.locator('[data-testid="yes-count"]');
    const initialYesCountText =
        (await initialYesCountElement.textContent()) || '(0)';
    const matchYes = initialYesCountText.match(/\((\d+)\)/);
    const initialYesCount = matchYes ? parseInt(matchYes[1], 10) : 0;

    const noButton = page.locator('[data-testid="no-button"]');
    const yesButton = page.locator('[data-testid="yes-button"]');

    for (let i = 0; i < noClicks; i++) {
        await expect(noButton).toBeVisible();
        await noButton.click();
    }

    for (let i = 0; i < yesClicks; i++) {
        await expect(yesButton).toBeVisible();
        await yesButton.click();
    }

    const newNoCountText = (await initialNoCountElement.textContent()) || '(0)';
    const matchNewNo = newNoCountText.match(/\((\d+)\)/);
    const newNoCount = matchNewNo ? parseInt(matchNewNo[1], 10) : 0;

    const newYesCountText =
        (await initialYesCountElement.textContent()) || '(0)';
    const matchNewYes = newYesCountText.match(/\((\d+)\)/);
    const newYesCount = matchNewYes ? parseInt(matchNewYes[1], 10) : 0;

    expect(newNoCount).toBeGreaterThanOrEqual(initialNoCount + noClicks);
    expect(newYesCount).toBeGreaterThanOrEqual(initialYesCount + yesClicks);

    const noMoreCards = page.locator('[data-testid="no-more-cards"]');
    await expect(noMoreCards).toBeVisible({ timeout: 10000 });

    const editSettingsButton = page.locator(
        '[data-testid="edit-settings-link"]',
    );
    await expect(editSettingsButton).toBeVisible();
    await editSettingsButton.click();

    await page.goto('/workflows/tinder-proposal/steps/1', {
        waitUntil: 'domcontentloaded',
    });
}

async function completeStep4(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step3Active = page.locator('[data-testid="step-number-4"]');
    await expect(step3Active).toBeVisible();
    await expect(step3Active).toHaveClass(/border-primary/);
    await expect(step3Active).toHaveClass(/text-primary/);

    const step4Header = page.locator(
        '[data-testid="step-4-header"]',
    );
    await expect(step4Header).toBeVisible();

    const swipeCards = page.locator(
        '[data-testid^="swipe-cards-container"]',
    );
    await expect(swipeCards).toBeVisible();

    const rightSwipesCard = page.locator('[data-testid="right-swipes-card"]');
    await expect(rightSwipesCard).toBeVisible();
    const leftSwipesCard = page.locator('[data-testid="left-swipes-card"]');
    await expect(leftSwipesCard).toBeVisible();

    const manageButton = page.locator('[data-testid="manage-button"]').first();
    await expect(manageButton).toBeVisible();
    await manageButton.click();

    const slideover= page.locator('[data-testid="edit-voter-list"]');
    await expect(slideover).toBeVisible();

    const titleInput = page.locator('[data-testid="title-input"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Edited Proposal Title');

    const contentTextarea = page.locator('[data-testid="content-textarea"]');           
    await expect(contentTextarea).toBeVisible();
    await contentTextarea.fill(
        'This is an edited test for the tinder proposal workflow. Writing a test to see if it works as it should.',
    );
    
    const visibilityRadioGroup = page.locator('[data-testid="visibility-radio-group"]').first();
    await expect(visibilityRadioGroup).toBeVisible();
    await visibilityRadioGroup.click();

    const commentsSwitch = page.locator('[data-testid="comments-switch"]');
    await expect(commentsSwitch).toBeVisible();
    await commentsSwitch.click();
    await expect(commentsSwitch).toBeChecked();

    const colorInput = page.locator('[data-testid="color-input"]');
    await expect(colorInput).toBeVisible();
    await colorInput.fill('#00ff00');

    const statusRadioGroup = page.locator('[data-testid="status-radio-group"]').first();
    await expect(statusRadioGroup).toBeVisible();
    await statusRadioGroup.click();

    const saveButton = page.locator('[data-testid="save-button"]');
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    const deleteButton = page.locator('[data-testid="delete-button"]');
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const closeButton = page.locator('[data-testid="close-button"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await page.goto('/workflows/tinder-proposal/steps/1', {
        waitUntil: 'domcontentloaded',
    });
}

async function step4TillEditListButton(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step3Active = page.locator('[data-testid="step-number-4"]');
    await expect(step3Active).toBeVisible();
    await expect(step3Active).toHaveClass(/border-primary/);
    await expect(step3Active).toHaveClass(/text-primary/);

    const step4Header = page.locator(
        '[data-testid="step-4-header"]',
    );
    await expect(step4Header).toBeVisible();

    const swipeCards = page.locator(
        '[data-testid^="swipe-cards-container"]',
    );
    await expect(swipeCards).toBeVisible();

    const rightSwipesCard = page.locator('[data-testid="right-swipes-card"]');
    await expect(rightSwipesCard).toBeVisible();
    const leftSwipesCard = page.locator('[data-testid="left-swipes-card"]');
    await expect(leftSwipesCard).toBeVisible();

    const editListButton = page.locator('[data-testid="edit-button"]').first();
    await expect(editListButton).toBeVisible();
    await editListButton.click();

    await page.goto('/workflows/tinder-proposal/steps/1', {
        waitUntil: 'domcontentloaded',
    });
}

async function step4TillKeepSwipingButton(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step3Active = page.locator('[data-testid="step-number-4"]');
    await expect(step3Active).toBeVisible();
    await expect(step3Active).toHaveClass(/border-primary/);
    await expect(step3Active).toHaveClass(/text-primary/);

    const step4Header = page.locator(
        '[data-testid="step-4-header"]',
    );
    await expect(step4Header).toBeVisible();

    const swipeCards = page.locator(
        '[data-testid^="swipe-cards-container"]',
    );
    await expect(swipeCards).toBeVisible();

    const rightSwipesCard = page.locator('[data-testid="right-swipes-card"]');
    await expect(rightSwipesCard).toBeVisible();
    const leftSwipesCard = page.locator('[data-testid="left-swipes-card"]');
    await expect(leftSwipesCard).toBeVisible();

    const keepSwipingButton = page.locator('[data-testid="keep-swiping-button"]');
    await expect(keepSwipingButton).toBeVisible();
    await keepSwipingButton.click();

    await page.goto('/workflows/tinder-proposal/steps/2', {
        waitUntil: 'domcontentloaded',
    });
}

async function step4TillRefineInterestsButton(page) {
    await page.waitForSelector('[data-testid="workflow-nav"]', {
        timeout: 30000,
    });

    const step3Active = page.locator('[data-testid="step-number-4"]');
    await expect(step3Active).toBeVisible();
    await expect(step3Active).toHaveClass(/border-primary/);
    await expect(step3Active).toHaveClass(/text-primary/);

    const step4Header = page.locator(
        '[data-testid="step-4-header"]',
    );
    await expect(step4Header).toBeVisible();

    const swipeCards = page.locator(
        '[data-testid^="swipe-cards-container"]',
    );
    await expect(swipeCards).toBeVisible();

    const rightSwipesCard = page.locator('[data-testid="right-swipes-card"]');
    await expect(rightSwipesCard).toBeVisible();
    const leftSwipesCard = page.locator('[data-testid="left-swipes-card"]');
    await expect(leftSwipesCard).toBeVisible();

    const refineButton = page.locator('[data-testid="refine-interests-button"]');
    await expect(refineButton).toBeVisible();
    await refineButton.click();

    await page.goto('/workflows/tinder-proposal/steps/1', {
        waitUntil: 'domcontentloaded',
    });
}

test.describe('Proposal Tinder', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(
            'https://preview.catalystexplorer.com/en/workflows/tinder-proposal/steps/1',
        );
        await page.waitForLoadState('domcontentloaded');

        await page.fill(
            '[data-testid="login-email-input"]',
            'admin@catalystexplorer.com',
        );
        await page.fill(
            '[data-testid="login-password-input"]',
            'ofnXIFbZ0JOuGBqx',
        );

        const checkbox = page.locator(
            '[data-testid="login-remember-checkbox"]',
        );
        await checkbox.check();

        await page.locator('[data-testid="login-signin-button"]').click();

        await page.context().storageState({ path: 'storage/auth.json' });

        await page.goto('/workflows/tinder-proposal/steps/1', {
            waitUntil: 'domcontentloaded',
        });
    });

    test('Proposal tinder workflow till deleting a list', async ({ page }) => {
        await completeStep1(page);
        await completeStep2(page);
        await completeStep3(page);
        await completeStep4(page);
    });

    test('Proposal tinder workflow till editing a list', async ({ page }) => {
        await completeStep1(page);
        await completeStep2(page);
        await step3WithEditing(page);
    });

    test('Proposal tinder workflow till manage list button', async ({ page }) => {
        await completeStep1(page);
        await completeStep2(page);
        await completeStep3(page);
        await step4TillEditListButton(page);
    });

    test('Proposal tinder workflow till keep swiping button', async ({ page }) => {
        await completeStep1(page);
        await completeStep2(page);
        await completeStep3(page);
        await step4TillKeepSwipingButton(page);
    });

    test('Proposal tinder workflow till refine button', async ({ page }) => {
        await completeStep1(page);
        await completeStep2(page);
        await completeStep3(page);
        await step4TillRefineInterestsButton(page);
    });

    test('Proposal tinder workflow if no proposals match settings', async ({ page }) => {
        await step1WithNoCategories(page);
        await completeStep2(page);
        await step3WithNoRecords(page);
    });
});
