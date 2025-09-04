# Inline Editing Guide

This guide explains how to properly implement inline editing functionality using `EditableSection` and `InlineEditField` components, following the established cohort pattern.

## Overview

The inline editing system allows users to edit fields directly in the UI with proper state management. Changes are stored locally until the user explicitly saves them, preventing accidental data loss and providing a better user experience.

## Core Components

### EditableSection
A wrapper component that provides edit/save/cancel functionality for a group of related fields.

### InlineEditField
Individual field component that handles different input types (text, select, date, textarea) with inline editing capabilities.

## Implementation Pattern

Follow this exact pattern for consistent inline editing behavior across the application:

### 1. State Management

```typescript
const [data, setData] = useState(initialData);
const [editedData, setEditedData] = useState<any>(initialData);

// Update state when data changes
useEffect(() => {
  if (initialData) {
    setData(initialData);
    setEditedData(initialData);
  }
}, [initialData]);
```

### 2. Local Update Function

```typescript
// Update edited data field locally (no API call)
const updateEditedField = async (field: string, value: any) => {
  setEditedData({
    ...editedData,
    [field]: value
  });
  // Return resolved promise to match expected type
  return Promise.resolve();
};
```

### 3. Save All Changes Function

```typescript
// Save all changes to the API
const saveAllChanges = async () => {
  try {
    // Collect only changed fields
    const changes: any = {};
    
    if (editedData.field1 !== data.field1) {
      changes.field1 = editedData.field1;
    }
    if (editedData.field2 !== data.field2) {
      changes.field2 = editedData.field2;
    }
    // ... check all fields
    
    // If no changes, return early
    if (Object.keys(changes).length === 0) {
      return;
    }
    
    const response = await fetch(`/api/endpoint/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });

    if (!response.ok) throw new Error("Failed to update");

    const updated = await response.json();
    setData(updated);
    setEditedData(updated);
    toast.success("Changes saved successfully");
  } catch (error) {
    toast.error("Failed to save changes");
    throw error;
  }
};
```

### 4. EditableSection Usage

```tsx
<EditableSection 
  title="Section Title"
  onEditStart={() => setEditedData(data)}
  onSave={saveAllChanges}
  onCancel={() => setEditedData(data)}
>
  {(editing) => (
    <div className="space-y-4">
      {/* Your fields here */}
    </div>
  )}
</EditableSection>
```

### 5. InlineEditField Usage

```tsx
{editing ? (
  <InlineEditField
    value={editedData.fieldName}
    onSave={(value) => updateEditedField("fieldName", value)}
    editing={editing}
    type="text" // or "select", "date", "textarea"
    placeholder="Enter value"
    options={[]} // for select type
  />
) : (
  <p className="text-sm">{data.fieldName || "Not set"}</p>
)}
```

## Field Types

### Text Field
```tsx
<InlineEditField
  value={editedData.name}
  onSave={(value) => updateEditedField("name", value)}
  editing={editing}
  type="text"
  placeholder="Enter name"
/>
```

### Select Field
```tsx
<InlineEditField
  value={editedData.status}
  onSave={(value) => updateEditedField("status", value)}
  editing={editing}
  type="select"
  options={[
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" }
  ]}
/>
```

### Date Field
```tsx
<InlineEditField
  value={editedData.startDate || ""}
  onSave={(value) => updateEditedField("startDate", value || null)}
  editing={editing}
  type="date"
  placeholder="Select date"
/>
```

### Textarea Field
```tsx
<InlineEditField
  value={editedData.notes || ""}
  onSave={(value) => updateEditedField("notes", value || null)}
  editing={editing}
  type="textarea"
  placeholder="Enter notes"
/>
```

### Boolean Field (as Select)
```tsx
<InlineEditField
  value={editedData.isActive ? "true" : "false"}
  onSave={(value) => updateEditedField("isActive", value === "true")}
  editing={editing}
  type="select"
  options={[
    { label: "Yes", value: "true" },
    { label: "No", value: "false" }
  ]}
/>
```

## Complete Example

Here's a complete example following the pattern:

```tsx
"use client";

import { useEffect, useState } from "react";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { toast } from "sonner";

interface ExampleDetailProps {
  initialItem: any;
}

export default function ExampleDetail({ initialItem }: ExampleDetailProps) {
  const [item, setItem] = useState(initialItem);
  const [editedItem, setEditedItem] = useState<any>(initialItem);

  // Update state when data changes
  useEffect(() => {
    if (initialItem) {
      setItem(initialItem);
      setEditedItem(initialItem);
    }
  }, [initialItem]);

  // Update edited item field locally
  const updateEditedField = async (field: string, value: any) => {
    setEditedItem({
      ...editedItem,
      [field]: value
    });
    return Promise.resolve();
  };

  // Save all changes to the API
  const saveAllChanges = async () => {
    try {
      const changes: any = {};
      
      // Check for changes in all fields
      if (editedItem.name !== item.name) {
        changes.name = editedItem.name;
      }
      if (editedItem.status !== item.status) {
        changes.status = editedItem.status;
      }
      if (editedItem.notes !== item.notes) {
        changes.notes = editedItem.notes;
      }
      
      // If no changes, return early
      if (Object.keys(changes).length === 0) {
        return;
      }
      
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      if (!response.ok) throw new Error("Failed to update");

      const updated = await response.json();
      setItem(updated);
      setEditedItem(updated);
      toast.success("Changes saved successfully");
    } catch (error) {
      toast.error("Failed to save changes");
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <EditableSection 
        title="Item Information"
        onEditStart={() => setEditedItem(item)}
        onSave={saveAllChanges}
        onCancel={() => setEditedItem(item)}
      >
        {(editing) => (
          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground text-xs">Name:</label>
              <InlineEditField
                value={editedItem.name}
                onSave={(value) => updateEditedField("name", value)}
                editing={editing}
                type="text"
                placeholder="Enter name"
              />
            </div>
            
            <div>
              <label className="text-muted-foreground text-xs">Status:</label>
              {editing ? (
                <InlineEditField
                  value={editedItem.status}
                  onSave={(value) => updateEditedField("status", value)}
                  editing={editing}
                  type="select"
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" }
                  ]}
                />
              ) : (
                <Badge variant="outline">{item.status}</Badge>
              )}
            </div>
            
            <div>
              <label className="text-muted-foreground text-xs">Notes:</label>
              <InlineEditField
                value={editedItem.notes || ""}
                onSave={(value) => updateEditedField("notes", value || null)}
                editing={editing}
                type="textarea"
                placeholder="Enter notes"
              />
            </div>
          </div>
        )}
      </EditableSection>
    </div>
  );
}
```

## Key Principles

1. **Always use local state**: Never update the API directly from InlineEditField onSave
2. **Batch changes**: Only send changed fields to the API when saving
3. **Proper handlers**: Always provide onEditStart, onSave, and onCancel to EditableSection
4. **Use edited values**: InlineEditField should always use `editedData` values, not original `data`
5. **Handle null values**: Use `value || ""` for nullable fields and `value || null` when saving
6. **Consistent error handling**: Always show success/error toasts
7. **Early return**: Return early if no changes are detected

## Common Mistakes to Avoid

❌ **Wrong**: Direct API calls from InlineEditField
```tsx
<InlineEditField
  onSave={(value) => updateApiField("name", value)} // Don't do this
/>
```

✅ **Correct**: Local state updates only
```tsx
<InlineEditField
  onSave={(value) => updateEditedField("name", value)} // Do this
/>
```

❌ **Wrong**: Using original data in editing mode
```tsx
<InlineEditField
  value={item.name} // Don't use original data
/>
```

✅ **Correct**: Using edited data in editing mode
```tsx
<InlineEditField
  value={editedItem.name} // Use edited data
/>
```

❌ **Wrong**: Missing EditableSection handlers
```tsx
<EditableSection title="Info">
  {/* Missing onEditStart, onSave, onCancel */}
</EditableSection>
```

✅ **Correct**: Complete EditableSection setup
```tsx
<EditableSection 
  title="Info"
  onEditStart={() => setEditedItem(item)}
  onSave={saveAllChanges}
  onCancel={() => setEditedItem(item)}
>
```

This pattern ensures consistent behavior across all inline editing implementations in the application.