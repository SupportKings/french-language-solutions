# Detail View Template

A consistent, reusable template for all entity detail views in the application.

## Components

### Core Layout Components

#### `DetailViewLayout`
The main wrapper that provides the background and container for the entire detail view.

```tsx
<DetailViewLayout>
  {/* All content goes here */}
</DetailViewLayout>
```

#### `DetailViewHeader`
The header section with breadcrumb, title, avatar, badges, and actions.

```tsx
<DetailViewHeader
  backUrl="/admin/students"
  backLabel="Students"
  title="John Doe"
  subtitle="Optional subtitle"
  avatar={{ initials: "JD" }}
  badges={[
    { label: "Active", variant: "success" },
    { label: "Premium", variant: "info" }
  ]}
  stats="3 enrollments • 2 assessments"
  actions={[
    {
      icon: Mail,
      label: "Send Email",
      onClick: () => handleEmail()
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => handleDelete(),
      destructive: true
    }
  ]}
  editUrl="/admin/students/123/edit"
/>
```

#### `DetailViewContent`
Container for the main content area with proper spacing.

```tsx
<DetailViewContent>
  {/* Cards and content go here */}
</DetailViewContent>
```

### Content Components

#### `RelatedDataCard`
Used for related data sections like enrollments, assessments, classes, etc.

```tsx
<RelatedDataCard
  title="Enrollments"
  subtitle="3 active enrollments"
  actionLabel="Add"
  actionIcon={Plus}
  actionHref="/enrollments/new"
>
  {/* Component content */}
</RelatedDataCard>
```

#### `InfoSection`
Groups related information fields with a section title.

```tsx
<InfoSection title="Contact Information" icon={Mail}>
  <InfoField label="Email" value={email} icon={Mail} />
  <InfoField label="Phone" value={phone} icon={Phone} />
</InfoSection>
```

#### `InfoField`
Individual information field with label and value.

```tsx
<InfoField 
  label="Email" 
  value="john@example.com" 
  icon={Mail}
/>
```

#### `OverviewCard`
Displays key metrics in the sidebar.

```tsx
<OverviewCard
  title="Overview"
  items={[
    {
      label: "Enrollments",
      value: 3,
      icon: BookOpen,
      badge: { label: "Active", variant: "success" }
    },
    {
      label: "Assessments",
      value: 2,
      icon: ClipboardCheck
    }
  ]}
/>
```

#### `SystemInfoCard`
Displays system information like IDs and timestamps.

```tsx
<SystemInfoCard
  id={entity.id}
  userId={entity.user_id}
  createdAt={format(new Date(entity.created_at), "MMM d, yyyy")}
  updatedAt={format(new Date(entity.updated_at), "MMM d, yyyy")}
  additionalFields={[
    { label: "Version", value: "1.0" }
  ]}
/>
```

## Layout Structure

The recommended structure for a detail view:

```tsx
<DetailViewLayout>
  <DetailViewHeader {...headerProps} />
  
  <DetailViewContent>
    {/* Related data cards at the top (2 columns) */}
    <div className="grid gap-4 lg:grid-cols-2">
      <RelatedDataCard>...</RelatedDataCard>
      <RelatedDataCard>...</RelatedDataCard>
    </div>

    {/* Main content and sidebar (2/3 + 1/3 split) */}
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Main content - 2 columns */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>...</CardHeader>
          <CardContent>
            <InfoSection>...</InfoSection>
            <InfoSection>...</InfoSection>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - 1 column */}
      <div className="space-y-4">
        <OverviewCard {...} />
        <SystemInfoCard {...} />
      </div>
    </div>
  </DetailViewContent>
</DetailViewLayout>
```

## Usage Example

```tsx
import {
  DetailViewLayout,
  DetailViewHeader,
  DetailViewContent,
  RelatedDataCard,
  InfoSection,
  InfoField,
  OverviewCard,
  SystemInfoCard
} from "@/components/detail-view/DetailViewLayout";

export default async function EntityDetailPage({ params }) {
  const entity = await getEntity(params.id);
  
  return (
    <DetailViewLayout>
      <DetailViewHeader
        backUrl="/admin/entities"
        title={entity.name}
        // ... other props
      />
      
      <DetailViewContent>
        {/* Your content here */}
      </DetailViewContent>
    </DetailViewLayout>
  );
}
```

## Design Principles

1. **Consistency**: Use the same layout structure across all detail views
2. **Hierarchy**: Related data cards at top, main info + sidebar below
3. **Compactness**: Tight spacing with py-3 headers, minimal padding
4. **Responsiveness**: Stacks properly on mobile devices
5. **Actions**: Dropdown menu for secondary actions, primary Edit button
6. **Empty States**: Clear messaging when no data is available
7. **Visual Feedback**: Hover states, transitions, proper loading states

## Color Variants for Badges

- `default` - Primary brand color
- `secondary` - Neutral gray
- `destructive` - Red for errors/warnings
- `outline` - Border only
- `success` - Green for positive states
- `warning` - Amber for attention states
- `info` - Blue for informational states