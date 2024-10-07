New fields:
```markdown
# Blog Post Metadata

## Fields

- **type**: Enum for different post types (article, news, tutorial, review)
- **featuredImage**: For storing the main image of the post
- **version**: To track the number of updates to the post
- **customFields**: A flexible JSON field for storing additional metadata
- **scheduledPublishDate**: For scheduling post publication
- **isFeatured**: To mark posts for featured sections
- **allowComments**: To control comment functionality per post
- **excerpt**: For storing a short summary of the post
- **lastCommentAt**: To track the most recent comment activity
- **commentCount**: To store the number of comments without querying the comments table
- **averageRating** and **ratingCount**: For implementing a rating system
- **parentPostId** and related fields: For creating hierarchical relationships between posts
- **relatedPostIds**: To manually specify related posts
- **seoMetadata**: For storing SEO-specific information
- **accessibility**: For storing accessibility-related information
- **translations**: For managing multilingual content

## New Relationships

- **Series**: To group posts into a series
- **Revision**: To track post revisions
- **parentPost** and **childPosts**: For hierarchical post structures

## Enhanced Existing Features

- Added 'REVIEW' and 'SCHEDULED' to **PostStatus** enum
- Added full-text search index on title and content
- Added index on slug for faster lookups

## New Imports

- **Series** and **Revision** entities
```