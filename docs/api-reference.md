# API Reference

This document provides comprehensive API documentation for the Expense Buddy AI server actions and services.

## Table of Contents

- [AI Service](#ai-service)
- [Transaction Service](#transaction-service)
- [User Service](#user-service)
- [Category Service](#category-service)
- [Payment Method Service](#payment-method-service)
- [Tag Service](#tag-service)
- [Friend Service](#friend-service)

## AI Service

### `generateTransactionSuggestion()`

Generates intelligent transaction descriptions and category suggestions using OpenAI.

```typescript
async function generateTransactionSuggestion(
  merchantName: string,
  upiId: string, 
  amount: number
): Promise<TransactionSuggestion>
```

**Parameters:**
- `merchantName` - Name of the merchant/business
- `upiId` - UPI ID of the merchant
- `amount` - Transaction amount

**Returns:**
```typescript
interface TransactionSuggestion {
  description: string;        // AI-generated description
  categoryId: string | null;  // Matched category ID
  categoryName: string | null; // Category name
  confidence: number;         // Confidence score (0-1)
}
```

**Example:**
```typescript
const suggestion = await generateTransactionSuggestion(
  "Starbucks Coffee",
  "starbucks@icici",
  250
);
// Returns: {
//   description: "Coffee at Starbucks",
//   categoryId: "food-dining-id",
//   categoryName: "Food & Dining", 
//   confidence: 0.92
// }
```

### `enhanceTransactionDescription()`

Improves existing transaction descriptions using AI.

```typescript
async function enhanceTransactionDescription(
  originalDescription: string,
  merchantName: string,
  amount: number
): Promise<string>
```

**Parameters:**
- `originalDescription` - Original transaction description
- `merchantName` - Merchant name for context
- `amount` - Transaction amount

**Returns:** Enhanced description string

## Transaction Service

### `createTransaction()`

Creates a new transaction with full validation.

```typescript
async function createTransaction(
  data: CreateTransactionData
): Promise<TransactionResult>
```

**Parameters:**
```typescript
interface CreateTransactionData {
  description: string;
  totalAmount: number | string;
  date: Date | string;
  referenceNumber?: string;
  notes?: string;
  participants: {
    userId: string;
    amount: number | string;
    type: TransactionType;
    categoryId: string;
    paymentMethodId: string;
    description?: string;
    tagIds?: string[];
  }[];
  recurringExpenseId?: number;
}
```

**Returns:**
```typescript
interface TransactionResult {
  success: boolean;
  message: string;
  transaction?: TransactionWithParticipants;
}
```

### `createScanTransaction()`

Specialized transaction creation for QR scan payments with automatic fallbacks.

```typescript
async function createScanTransaction(
  data: CreateTransactionData
): Promise<TransactionResult>
```

**Features:**
- Auto-creates UPI payment method if missing
- Auto-creates "General" expense category if needed
- Graceful handling of missing required fields

### `updateTransaction()`

Updates an existing transaction.

```typescript
async function updateTransaction(
  data: UpdateTransactionData
): Promise<TransactionResult>
```

### `listTransactions()`

Retrieves paginated transactions with filtering.

```typescript
async function listTransactions(
  options: PaginationOptions
): Promise<ListTransactionsResult>
```

**Parameters:**
```typescript
interface PaginationOptions {
  cursor?: string;
  pageSize: number;
  filters?: TransactionFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  categoryId?: string;
  paymentMethodId?: string;
  tagIds?: string[];
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
}
```

### `deleteTransaction()`

Soft deletes a transaction (sets `isDeleted` flag).

```typescript
async function deleteTransaction(id: string): Promise<TransactionResult>
```

## User Service

### `getCurrentUser()`

Gets the current authenticated user.

```typescript
async function getCurrentUser(): Promise<User | null>
```

**Returns:** Current user object or null if not authenticated

### `getUserById()`

Retrieves user by ID.

```typescript
async function getUserById(id: string): Promise<User | null>
```

## Category Service

### `listCategories()`

Retrieves user's categories with pagination.

```typescript
async function listCategories(
  options: PaginationOptions
): Promise<ListCategoriesResult>
```

### `createCategory()`

Creates a new category.

```typescript
async function createCategory(
  data: CreateCategoryData
): Promise<CategoryResult>
```

**Parameters:**
```typescript
interface CreateCategoryData {
  name: string;
  icon: string;
  type: TransactionType; // 'INCOME' | 'EXPENSE'
}
```

### `updateCategory()`

Updates an existing category.

```typescript
async function updateCategory(
  id: string,
  data: UpdateCategoryData
): Promise<CategoryResult>
```

### `deleteCategory()`

Deletes a category (only if no transactions reference it).

```typescript
async function deleteCategory(id: string): Promise<CategoryResult>
```

## Payment Method Service

### `listPaymentMethods()`

Retrieves user's payment methods.

```typescript
async function listPaymentMethods(
  options: PaginationOptions
): Promise<ListPaymentMethodsResult>
```

### `createPaymentMethod()`

Creates a new payment method.

```typescript
async function createPaymentMethod(
  data: CreatePaymentMethodData
): Promise<PaymentMethodResult>
```

**Parameters:**
```typescript
interface CreatePaymentMethodData {
  name: string;
  icon?: string;
}
```

### `updatePaymentMethod()`

Updates an existing payment method.

```typescript
async function updatePaymentMethod(
  id: string,
  data: UpdatePaymentMethodData
): Promise<PaymentMethodResult>
```

### `deletePaymentMethod()`

Deletes a payment method (only if no transactions reference it).

```typescript
async function deletePaymentMethod(id: string): Promise<PaymentMethodResult>
```

## Tag Service

### `listTags()`

Retrieves user's tags.

```typescript
async function listTags(
  options: PaginationOptions
): Promise<ListTagsResult>
```

### `createTag()`

Creates a new tag.

```typescript
async function createTag(
  data: CreateTagData
): Promise<TagResult>
```

**Parameters:**
```typescript
interface CreateTagData {
  name: string;
  color?: string;
  icon?: string;
}
```

### `updateTag()`

Updates an existing tag.

```typescript
async function updateTag(
  id: string,
  data: UpdateTagData
): Promise<TagResult>
```

### `deleteTag()`

Deletes a tag.

```typescript
async function deleteTag(id: string): Promise<TagResult>
```

## Friend Service

### `listFriendsAndRequests()`

Retrieves user's friends and pending friend requests.

```typescript
async function listFriendsAndRequests(): Promise<ListFriendsResult>
```

**Returns:**
```typescript
interface ListFriendsResult {
  success: boolean;
  message: string;
  friends?: Friend[];
  sentRequests?: FriendRequest[];
  receivedRequests?: FriendRequest[];
}
```

### `sendFriendRequest()`

Sends a friend request to another user.

```typescript
async function sendFriendRequest(
  receiverEmail: string
): Promise<FriendRequestResult>
```

### `respondToFriendRequest()`

Accepts or rejects a friend request.

```typescript
async function respondToFriendRequest(
  requestId: string,
  response: 'ACCEPTED' | 'REJECTED'
): Promise<FriendRequestResult>
```

### `removeFriend()`

Removes a friend relationship.

```typescript
async function removeFriend(friendId: string): Promise<FriendResult>
```

## Common Types

### Base Response Types

```typescript
interface BaseResult {
  success: boolean;
  message: string;
}

interface PaginatedResult<T> extends BaseResult {
  data?: T[];
  nextCursor?: string | null;
  totalCount?: number;
}
```

### Transaction Types

```typescript
enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

enum SplitType {
  EQUAL = 'EQUAL',
  AMOUNT = 'AMOUNT', 
  PERCENTAGE = 'PERCENTAGE',
  SHARES = 'SHARES'
}

interface TransactionWithParticipants extends Transaction {
  participants: (TransactionParticipant & {
    category: { name: string; icon: string };
    paymentMethod: { name: string; icon: string | null };
    tags: { id: string; name: string; color: string | null }[];
  })[];
}
```

### Error Handling

All service functions return a consistent response format:

```typescript
// Success response
{
  success: true,
  message: "Operation completed successfully",
  data: { /* result data */ }
}

// Error response  
{
  success: false,
  message: "Detailed error message",
  data: undefined
}
```

### Authentication

All service functions automatically check for user authentication using `getCurrentUser()`. If no authenticated user is found, they return:

```typescript
{
  success: false,
  message: "User not authenticated"
}
```

### Validation

- All monetary amounts are validated as positive numbers
- Required fields are validated for presence
- Foreign key relationships are validated (category, payment method, tags belong to user)
- Unique constraints are enforced (category names per user, etc.)

### Database Transactions

Critical operations use Prisma database transactions to ensure data consistency:

```typescript
const result = await db.$transaction(async (prisma) => {
  // Multiple related operations
  // All succeed or all fail together
});
```

This ensures data integrity across related table operations.