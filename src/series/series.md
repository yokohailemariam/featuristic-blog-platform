Basic Information:
# Series Metadata

## Core Information
- **title, slug, description**: Core information about the series.
- **status**: Enum to track the progress of the series.
- **coverImage**: For visual representation of the series.

## Progress Tracking
- **expectedParts and completedParts**: To track series completion.
- **startDate and endDate**: To set and track series duration.

## Engagement Metrics
- **views, likes, averageRating, ratingCount**: To measure user engagement.
- **likedBy and savedBy**: To track user interactions.

## SEO and Discoverability
- **metaDescription and seoMetadata**: For search engine optimization.
- **isFeatured**: To highlight important series.
- **excerpt**: For short summaries or teasers.

## Content Management
- **isPublished**: To control visibility.
- **scheduledPublishDate**: For scheduling series launch.

## Relationships
- **author**: ManyToOne relationship with User.
- **posts**: OneToMany relationship with Post.
- **category**: ManyToOne relationship with Category.
- **tags**: ManyToMany relationship with Tag.

## Internationalization and Accessibility
- **translations**: For multi-language support.
- **accessibility**: For storing accessibility information.

## Advanced Features
- **customFields**: Flexible JSON field for additional metadata.
- **relatedSeriesIds**: To link related series.
- **totalReadingTime**: Aggregated reading time of all posts.
- **contributors**: To credit multiple authors or contributors.
- **seriesOutline**: To plan and track individual parts of the series.

## Timestamps and Versioning
- **createdAt, updatedAt, deletedAt**: For tracking the series lifecycle.
- **version**: To track the number of updates to the series.

## Performance Optimizations
- **Indexes on title and slug**: For faster lookups.
- **Full-text search index on title and description**: For improved search performance.
