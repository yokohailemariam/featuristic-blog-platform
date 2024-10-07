# Category Entity

The `Category` entity represents a category within the application, containing information about the category itself, its subcategories, associated posts, and series.

## Fields

### id
- **Type**: `number`
- **Description**: The unique identifier for the category, automatically generated.
- **Generated**: Yes

### name
- **Type**: `string`
- **Description**: The name of the category.
- **Constraints**: 
  - Maximum length: 255 characters
  - Must be unique

### slug
- **Type**: `string`
- **Description**: A URL-friendly version of the category name, typically used in the category's URL.
- **Constraints**: 
  - Maximum length: 255 characters
  - Must be unique

### metaDescription
- **Type**: `string | null`
- **Description**: A brief description of the category, often used for SEO purposes. This field is optional.
- **Constraints**: Maximum length: 65535 characters (text)

### imageUrl
- **Type**: `string | null`
- **Description**: URL of an image representing the category. This field is optional.

### parent
- **Type**: `Category | null`
- **Description**: A reference to the parent category, allowing for hierarchical category structures. This field is optional.

### subcategories
- **Type**: `Category[]`
- **Description**: A list of subcategories belonging to this category. This field establishes a one-to-many relationship with the `Category` entity.

### posts
- **Type**: `Post[]`
- **Description**: A list of posts associated with this category. This field establishes a one-to-many relationship with the `Post` entity.

### series
- **Type**: `Series[]`
- **Description**: A list of series associated with this category. This field establishes a one-to-many relationship with the `Series` entity.

### createdAt
- **Type**: `Date`
- **Description**: The timestamp when the category was created.
- **Generated**: Yes

### updatedAt
- **Type**: `Date`
- **Description**: The timestamp when the category was last updated.
- **Generated**: Yes

### deletedAt
- **Type**: `Date | null`
- **Description**: The timestamp when the category was soft-deleted. This field is optional and is used for soft deletion functionality.

### postCount
- **Type**: `number`
- **Description**: A count of the number of posts associated with this category.
- **Default**: `0`

### isVisible
- **Type**: `boolean`
- **Description**: A flag indicating whether the category is visible in the application.
- **Default**: `true`

### customMetadata
- **Type**: `Record<string, any> | null`
- **Description**: A field for storing custom metadata related to the category in a JSON format. This field is optional.

## Relationships

- **Parent Category**: A category can have a parent, allowing for a nested structure of categories.
- **Subcategories**: Each category can have multiple subcategories.
- **Posts**: Each category can be associated with multiple posts.
- **Series**: Each category can be associated with multiple series.

## Usage

This entity is typically used to organize content within the application, making it easier for users to navigate through related items.

## Example

```typescript
const category = new Category();
category.name = "Technology";
category.slug = "technology";
category.metaDescription = "Latest trends in technology.";
category.imageUrl = "http://example.com/image.jpg";
category.postCount = 10;
category.isVisible = true;
