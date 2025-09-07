# CatalystExplorer Internationalization (i18n)

This document provides comprehensive information about internationalization and translation management in CatalystExplorer.

## Supported Languages

CatalystExplorer supports the following languages:

| Language | Code | Native Name | Added |
|----------|------|-------------|-------|
| English | `en` | English | Core |
| Spanish | `es` | Español | Core |
| German | `de` | Deutsch | Core |
| French | `fr` | Français | Core |
| Portuguese | `pt` | Português | Core |
| Amharic | `am` | አማርኛ | Core |
| Arabic | `ar` | العربية | Core |
| Japanese | `ja` | 日本語 | Core |
| Korean | `ko` | 한국어 | Core |
| Chinese (Simplified) | `zh` | 简体中文 | Core |
| Swahili | `sw` | Kiswahili | 2024 |

## Architecture

### Backend (Laravel)
- **Translation files**: Located in `application/lang/`
- **Route configuration**: `config/localized-routes.php`
- **URL pattern**: `/{locale}/path` (e.g., `/sw/proposals`)
- **Fallback locale**: English (`en`)

### Frontend (React)
- **Language configuration**: `resources/js/constants/locales.ts`
- **Language switcher**: `resources/js/Components/LangSwitcher.tsx`
- **Translation integration**: Uses `laravel-react-i18n` package

## Adding a New Language

Follow these steps to add support for a new language:

### Step 1: Create Translation File

Create a new JSON file in `application/lang/{locale}.json`:

```json
{
    "welcome": "Your translated welcome message",
    "login": "Your translated login text",
    // ... more translations
}
```

**Tip**: Use the English file (`application/lang/en.json`) as a reference for all required translation keys.

### Step 2: Configure Laravel Routes

Add the locale to `config/localized-routes.php`:

```php
// Add to supported_locales array
'supported_locales' => ['en', 'am', 'ar', 'de', 'zh', 'ko', 'pt', 'ja', 'sw', 'es', 'fr', 'YOUR_NEW_LOCALE'],

// Add locale details
'YOUR_NEW_LOCALE' => [
    'key' => 'YOUR_NEW_LOCALE',
    'name' => 'Language Name in English',
    'script' => 'Script Code (e.g., Latn, Arab, Hani)',
    'native' => 'Language Name in Native Script',
    'regional' => 'LOCALE_COUNTRY_CODE',
],
```

### Step 3: Update Frontend Configuration

Update `resources/js/constants/locales.ts`:

```typescript
// Add to SUPPORTED_LOCALES array
export const SUPPORTED_LOCALES = [
    // ... existing locales
    'YOUR_NEW_LOCALE'
] as const;

// Add to LOCALE_MAPPING
export const LOCALE_MAPPING = {
    // ... existing mappings
    YOUR_NEW_LOCALE: { label: 'English Name', native: 'Native Name' },
} as const;
```

### Step 4: Update Language Switcher

Add the language option to `resources/js/Components/LangSwitcher.tsx`:

```typescript
const LANGS = [
    // ... existing languages
    { value: 'YOUR_NEW_LOCALE', label: 'Native Name' },
];
```

### Step 5: Test Integration

Use the provided test script to verify your changes:

```bash
node test-swahili-integration.cjs
```

Or manually test:
1. Start the development server: `make watch`
2. Visit `http://localhost/YOUR_NEW_LOCALE/`
3. Test the language selector in the UI
4. Verify translations appear correctly

## Translation Best Practices

### 1. Key Naming Convention
- Use dot notation for hierarchical organization
- Examples: 
  - `workflows.voterList.title`
  - `buttons.titles.share`
  - `error404.mainText`

### 2. Context Considerations
- Include context in translation keys when the same word might have different meanings
- Example: `charts.share` vs `buttons.share`

### 3. Placeholder Handling
- Use Laravel's interpolation syntax: `:variable`
- Example: `"Welcome :name to CatalystExplorer"`

### 4. Consistency
- Maintain consistent terminology across all translations
- Use the same translation for common UI elements like "Save", "Cancel", "Next"

### 5. Cultural Adaptation
- Consider cultural context, not just linguistic translation
- Adapt number formats, date formats, and cultural references where appropriate

## Translation Workflow

### For Contributors
1. **Identify missing translations**: Check the English reference file
2. **Create translations**: Focus on accuracy and natural language flow
3. **Test locally**: Verify translations appear correctly in the UI
4. **Submit for review**: Include native speakers in the review process

### For Developers
1. **Add new translation keys**: Always add new keys to the English file first
2. **Update all languages**: Ensure new keys exist in all translation files
3. **Test comprehensively**: Verify UI layout works with different text lengths
4. **Document changes**: Update this file when making structural changes

## Testing Translations

### Automated Testing
```bash
# Run backend tests
make test-backend

# Check TypeScript compilation
make tsc

# Test translation file validity
node -e "console.log('Valid JSON:', Object.keys(require('./application/lang/sw.json')).length + ' keys')"
```

### Manual Testing
1. **Language switching**: Verify the language selector shows all languages
2. **URL routing**: Test that URLs change correctly (e.g., `/en/` to `/sw/`)
3. **Text rendering**: Check that all text appears in the selected language
4. **Layout integrity**: Ensure longer/shorter translations don't break the UI

### Integration Test Script
A comprehensive integration test is provided in `test-swahili-integration.cjs`. Modify this script to test other languages by changing the locale references.

## RTL Language Support

For right-to-left languages like Arabic:

### Backend Configuration
RTL languages are configured in the `RTL_LANGS` array in `LangSwitcher.tsx`:

```typescript
const RTL_LANGS = ['ar']; // Add new RTL language codes here
```

### CSS Considerations
- Use logical properties where possible (`margin-inline-start` vs `margin-left`)
- Test UI components with RTL languages
- Consider text alignment and icon positioning

## Common Issues and Solutions

### Issue 1: Missing Translation Keys
**Symptom**: Some text appears in English even when another language is selected
**Solution**: Check that all keys exist in the target language file

### Issue 2: URL Not Changing
**Symptom**: Language changes but URL stays the same
**Solution**: Verify the locale is properly configured in `localized-routes.php`

### Issue 3: Frontend Not Loading
**Symptom**: Language selector doesn't show new language
**Solution**: Check the frontend configuration files and rebuild the frontend

### Issue 4: Route Not Found
**Symptom**: 404 error when accessing localized route
**Solution**: Clear Laravel config cache: `make artisan config:cache`

## Maintenance

### Regular Tasks
- **Update translations**: When new features are added, update all language files
- **Review accuracy**: Periodically review translations with native speakers  
- **Check completeness**: Ensure all languages have the same keys
- **Performance monitoring**: Monitor page load times for different locales

### Release Checklist
- [ ] All language files have same keys
- [ ] New translations tested in browser
- [ ] URL routing works for all locales
- [ ] Language selector displays correctly
- [ ] No console errors related to missing translations

## Resources

### Tools
- **Translation management**: Consider tools like Crowdin or Lokalise for larger teams
- **Validation**: Use JSON validators to check file syntax
- **Testing**: Browser dev tools for testing different locales

### Reference Files
- Main English translations: `application/lang/en.json`
- Route configuration: `config/localized-routes.php`
- Frontend configuration: `resources/js/constants/locales.ts`
- Language switcher: `resources/js/Components/LangSwitcher.tsx`

For questions or issues related to translations, consult the development team or create an issue in the project repository.
