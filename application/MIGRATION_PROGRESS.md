# UUID Migration Progress

## Summary

We have successfully implemented the foundation for migrating from hash-based IDs to UUID-based IDs while maintaining backward compatibility. The system now supports both identification methods during the transition period.

## Completed Work

### Backend Changes

1. **Updated HashIdService** (`app/Services/HashIdService.php`)
   - Added UUID detection and handling
   - UUID strings are passed through without encoding/decoding
   - Hash IDs continue to work as before for numeric IDs
   - Added `isUuid()` method for validation

2. **Updated Base Model** (`app/Models/Model.php`)
   - Added `uuid` to the appends array to make it available in API responses
   - Added `getUuidAttribute()` method that returns the primary key (which is now UUID)

3. **Updated Data Transfer Objects**
   - Added optional `uuid` fields to key DTOs:
     - `ProposalData`
     - `FundData`
     - `GroupData`
     - `IdeascaleProfileData`
     - `CampaignData`

### Frontend Changes

1. **TypeScript Definitions**
   - Generated updated TypeScript types that include UUID fields
   - All major entity types now have optional `uuid` properties

2. **Updated Components**
   - **ProposalCardHeader**: Now uses UUIDs when available, falling back to hashes
   - **CompareButton**: Updated to use UUID for IndexedDB operations
   - Created utility function `getPreferredId()` for consistent ID selection

3. **Utility Functions** (`resources/js/utils/getPreferredId.ts`)
   - `getPreferredId()`: Returns UUID if available, otherwise falls back to hash
   - `isUuid()`: Validates UUID format
   - `isHash()`: Checks if ID is hash format

## Current State

- Models use UUID primary keys
- Backend APIs can handle both UUID and hash identifiers
- Frontend components prioritize UUIDs but fall back to hashes
- URL routing continues to use slugs (SEO-friendly)
- Backward compatibility maintained throughout

## Migration Benefits

1. **Better Performance**: UUID lookups are direct primary key operations
2. **Improved Security**: UUIDs are not sequential and harder to enumerate
3. **Scalability**: UUIDs work better in distributed systems
4. **Future-Proofing**: Modern standard for entity identification

## Next Steps

### Phase 1: Complete Component Migration (Immediate)

1. **Update Additional Components**:
   ```bash
   # Priority components that use hash IDs frequently
   - ProposalVerticalCard.tsx
   - ProposalHorizontalCard.tsx
   - GroupCard.tsx
   - IdeascaleProfileCard.tsx
   - FundCard.tsx
   ```

2. **Update Context and Hooks**:
   ```bash
   - Context/ProposalComparisonContext.tsx
   - Context/BookmarkContext.tsx
   - Hooks/useBookmark.ts (ensure API calls work with UUIDs)
   ```

### Phase 2: Backend API Enhancement (Short-term)

1. **Update API Controllers**:
   - Ensure all route parameters can accept both UUIDs and hashes
   - Update search and filtering logic to prioritize UUID operations
   
2. **Database Optimization**:
   - Add UUID indexes where needed
   - Monitor query performance during transition

### Phase 3: Full Migration (Medium-term)

1. **Update All Frontend Components**:
   - Systematically update all components using `.hash` references
   - Replace with `getPreferredId()` utility calls

2. **API Response Optimization**:
   - Eventually remove hash fields from API responses
   - Update documentation to reflect UUID-first approach

### Phase 4: Cleanup (Long-term)

1. **Remove Hash Dependencies**:
   - Remove HashIdService for new entities
   - Keep only for legacy data compatibility if needed
   
2. **Remove Fallback Code**:
   - Remove hash fallback logic from frontend
   - Simplify DTOs to only include UUIDs

## Testing Recommendations

1. **Unit Tests**: Verify `getPreferredId()` utility function works correctly
2. **Integration Tests**: Test API endpoints with both UUID and hash parameters
3. **E2E Tests**: Verify bookmark and compare functionality works with both ID types
4. **Performance Tests**: Monitor query performance during migration

## Rollback Plan

If issues arise, the system can easily rollback by:
1. Reverting frontend components to use `proposal.hash` instead of `getPreferredId(proposal)`
2. The backend will continue to work with hash IDs as before
3. No database changes need to be reverted as UUIDs are the primary keys

## Code Examples

### Frontend Component Pattern (Before)
```typescript
{proposal.hash && (
    <BookmarkButton
        modelType="proposals"
        itemId={proposal.hash}
    />
)}
```

### Frontend Component Pattern (After)
```typescript
const proposalId = getPreferredId(proposal);
{proposalId && (
    <BookmarkButton
        modelType="proposals"
        itemId={proposalId}
    />
)}
```

This migration provides a solid foundation for transitioning to UUID-based identification while maintaining system stability and backward compatibility.
