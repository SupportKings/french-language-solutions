# Detail Page Generation Guide


Complete implementation guide for generating detail pages following the Warrior Babe v2 architecture pattern, based on the client detail view implementation.


## Input Data Specification


**REPLACE THIS SECTION with your specific entity requirements when generating a detail page:**


### Entity Information
- **Entity Name**: [What are we viewing? e.g., Product, User, Order, etc.]
- **Display Name**: [What shows in browser/header? e.g., "Product Details"]
- **Main Field**: [Which field shows as the main title? e.g., "name", "title"]
- **Navigation**: [URL path, e.g., /dashboard/products]


### Basic Information Sections (Editable inline)


#### Section 1: [Section Name - e.g., "Basic Information"]
**Fields to show and edit:**
- [Field 1] (required/optional, field type - text/email/number/etc.)
- [Field 2] (required/optional, field type)
- [Status Field] (dropdown with options) - show as colored badge
- [Any other basic fields...]


#### Section 2: [Section Name - e.g., "Additional Details"] 
**Fields to show and edit:**
- [Field 1] (checkbox - true/false)
- [Field 2] (text area for longer text)
- [Field 3] (date picker)
- [Any other fields in this logical group...]


### Relationship Tabs (Tables with Add/Edit/Delete buttons)


#### Tab 1: [Relationship Name - e.g., "Associated Items"]
**What it shows:** [Description of what this relationship represents]
**Empty message:** [What to show when no items exist]
**Table columns:**
- [Column 1 Name] (from related table)
- [Column 2 Name]
- [Column 3 Name]
- [Date Column] (formatted date)
- [Status Column] (colored badge)


**Add/Edit Form fields:**
- [Field 1] (dropdown from [table name])
- [Field 2] (text field with example)
- [Field 3] (date picker, defaults to today)
- [Field 4] (optional date picker)


#### Tab 2: [Second Relationship - e.g., "History Records"]
**What it shows:** [Description]
**Empty message:** [Empty state message] 
**Table columns:**
- [List each column that should appear]
- [Include data types: text, number, date, status badge, etc.]


**Add/Edit Form fields:**
- [List each form field needed]
- [Specify field types: text, number, dropdown, date, checkbox, text area]
- [Note which are required vs optional]
- [Specify default values if any]


#### Tab 3: [Third Relationship if needed]
**What it shows:** [Description]
**Empty message:** [Empty state message]
**Table columns:**
- [Column details...]


**Add/Edit Form fields:**
- [Form field details...]


### System Information (Always at bottom, read-only)
- Created Date
- Last Updated Date


## Overview


This guide provides a comprehensive template for creating detail pages with full CRUD functionality, inline editing, tabbed relationship management, and proper error handling. The implementation follows established patterns from `apps/web/src/features/clients/components/client.detail.view.tsx`.


## Architecture Requirements


### File Structure


```
apps/web/src/features/[feature]/
├── components/
│   ├── [entity].detail.view.tsx           # Main detail view component
│   ├── [entity].detail.skeleton.tsx       # Loading skeleton
│   ├── detail-sections/
│   │   ├── [entity]-basic-info.tsx        # Basic information section
│   │   ├── [entity]-[section].tsx         # Other editable sections
│   │   ├── [entity]-[relation]-section.tsx # Relationship sections
│   │   └── [entity]-system-info.tsx       # System information
│   ├── shared/
│   │   └── delete-confirm-modal.tsx       # Shared delete confirmation
│   ├── empty-states/
│   │   └── no-[relations].tsx             # Empty state components
│   ├── table-columns/
│   │   └── [relation]-columns.tsx         # Table column definitions
│   └── manage-[relation]-modal.tsx        # Add/Edit modals for relations
├── actions/
│   ├── update[Entity].ts                  # Main update action
│   └── relations/
│       └── [relation-type].ts             # Relationship CRUD actions
├── queries/
│   └── use[Entities].ts                   # React Query hooks
└── layout/
   └── [entity].detail.header.tsx         # Page header component
```


### Page Structure & Rendering


The detail page is rendered through the Next.js app router pattern:


**File:** `apps/web/src/app/dashboard/[entities]/[id]/page.tsx`


```typescript
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { get[Entity] } from "@/features/[entities]/actions/get[Entity]";
import [Entity]DetailSkeleton from "@/features/[entities]/components/[entity].detail.skeleton";
import [Entity]DetailView from "@/features/[entities]/components/[entity].detail.view";
import [Entity]DetailHeader from "@/features/[entities]/layout/[entity].detail.header";
import { getUser } from "@/queries/getUser";
import {
   dehydrate,
   HydrationBoundary,
   QueryClient,
} from "@tanstack/react-query";


interface [Entity]DetailPageProps {
   params: Promise<{
       id: string;
   }>;
}


export default function [Entity]DetailPage({ params }: [Entity]DetailPageProps) {
   return (
       <Suspense fallback={<[Entity]DetailSkeleton [entity]Id="" />}>
           <[Entity]DetailPageAsync params={params} />
       </Suspense>
   );
}


async function [Entity]DetailPageAsync({ params }: [Entity]DetailPageProps) {
   const { id } = await params;


   // Validate that id is provided
   if (!id) {
       notFound();
   }


   const queryClient = new QueryClient();
   const session = await getUser();


   if (!session) {
       redirect("/");
   }


   // Prefetch the entity data
   await queryClient.prefetchQuery({
       queryKey: ["[entities]", "detail", id],
       queryFn: () => get[Entity](id),
   });


   return (
       <HydrationBoundary state={dehydrate(queryClient)}>
           <MainLayout
               headers={[
                   <[Entity]DetailHeader key="[entity]-detail-header" [entity]Id={id} />,
               ]}
           >
               <[Entity]DetailView [entity]Id={id} />
           </MainLayout>
       </HydrationBoundary>
   );
}
```


## Main Detail View Component


**File:** `apps/web/src/features/[feature]/components/[entity].detail.view.tsx`


```typescript
"use client";


import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


// Import update action
import { update[Entity]Action } from "../actions/update[Entity]";


// Import relation delete actions
import { delete[Entity][Relation1] } from "../actions/relations/[relation1]s";
import { delete[Entity][Relation2] } from "../actions/relations/[relation2]s";
// ... import all relation delete actions


// Import queries
import { [entity]Queries, use[Entity] } from "../queries/use[Entities]";


// Import section components
import { [Entity]BasicInfo } from "./detail-sections/[entity]-basic-info";
import { [Entity][Section] } from "./detail-sections/[entity]-[section]";
import { [Entity][Relation1]Section } from "./detail-sections/[entity]-[relation1]s-section";
import { [Entity][Relation2]Section } from "./detail-sections/[entity]-[relation2]s-section";
import { [Entity]SystemInfo } from "./detail-sections/[entity]-system-info";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";


interface [Entity]DetailViewProps {
   [entity]Id: string;
}


export default function [Entity]DetailView({ [entity]Id }: [Entity]DetailViewProps) {
   const { data: [entity], isLoading, error } = use[Entity]([entity]Id);
   const queryClient = useQueryClient();


   // Delete modal state
   const [deleteModal, setDeleteModal] = useState<{
       isOpen: boolean;
       type: string;
       id: string;
       title: string;
   }>({ isOpen: false, type: "", id: "", title: "" });


   // Edit state for basic info sections
   const [editState, setEditState] = useState<{
       isEditing: boolean;
       section: "basic" | "other_section" | null;
   }>({ isEditing: false, section: null });


   const handleEditToggle = (section: "basic" | "other_section") => {
       if (editState.isEditing && editState.section === section) {
           // Cancel edit
           setEditState({ isEditing: false, section: null });
       } else {
           // Start edit
           setEditState({ isEditing: true, section });
       }
   };


   const handleSave = async (data: any) => {
       try {
           // Transform form data to match the update[Entity]Schema format
           const updateData: any = {
               id: [entity]Id,
           };


           // Only include fields from the section being edited
           if (editState.section === "basic") {
               // Basic info fields
               updateData.name = data.name;
               updateData.email = data.email;
               updateData.phone = data.phone || null;
               updateData.statusField = data.status_field as "option1" | "option2" | null;
           } else if (editState.section === "other_section") {
               // Other section fields
               updateData.field1 = data.field1;
               updateData.field2 = data.field2 || null;
           }


           // Call the update action
           const result = await update[Entity]Action(updateData);


           if (result?.validationErrors) {
               // Handle validation errors
               const errorMessages: string[] = [];
              
               if (result.validationErrors._errors) {
                   errorMessages.push(...result.validationErrors._errors);
               }
              
               // Handle field-specific errors
               Object.entries(result.validationErrors).forEach(([field, errors]) => {
                   if (field !== "_errors" && errors) {
                       if (Array.isArray(errors)) {
                           errorMessages.push(...errors);
                       } else if (errors && typeof errors === "object" && "_errors" in errors && Array.isArray(errors._errors)) {
                           errorMessages.push(...errors._errors);
                       }
                   }
               });


               if (errorMessages.length > 0) {
                   errorMessages.forEach(error => toast.error(error));
               } else {
                   toast.error("Failed to update [entity]");
               }
               return;
           }


           if (result?.data?.success) {
               toast.success("[Entity] updated successfully");
               setEditState({ isEditing: false, section: null });
              
               // Invalidate queries to refresh data
               await queryClient.invalidateQueries({
                   queryKey: [entity]Queries.detail([entity]Id),
               });
           } else {
               toast.error("Failed to update [entity]");
           }


       } catch (error) {
           console.error("Error updating [entity]:", error);
           toast.error("Failed to update [entity]");
       }
   };


   const handleCancel = () => {
       setEditState({ isEditing: false, section: null });
   };


   const handleDelete = async () => {
       try {
           switch (deleteModal.type) {
               case "[relation1]":
                   await delete[Entity][Relation1](deleteModal.id);
                   toast.success("[Relation1] deleted successfully");
                   break;
               case "[relation2]":
                   await delete[Entity][Relation2](deleteModal.id);
                   toast.success("[Relation2] deleted successfully");
                   break;
               // Add case for each relationship type
               default:
                   throw new Error("Unknown delete type");
           }


           // Invalidate the [entity] query to refresh the data
           await queryClient.invalidateQueries({
               queryKey: [entity]Queries.detail([entity]Id),
           });
       } catch (error) {
           console.error("Error deleting record:", error);
           toast.error("Failed to delete record");
           throw error;
       }
   };


   if (isLoading) return <div>Loading...</div>;
   if (error || ![entity]) return <div>Error loading [entity]</div>;


   const fullName = [entity].name;
   const initials = [entity].name
       .split(" ")
       .map((n: string) => n[0])
       .join("")
       .toUpperCase()
       .slice(0, 2);


   return (
       <div className="space-y-6 p-6">
           {/* Header Section */}
           <div className="flex items-start justify-between">
               <div className="flex items-center space-x-4">
                   <Avatar className="h-16 w-16">
                       <AvatarFallback className="font-semibold text-lg">
                           {initials}
                       </AvatarFallback>
                   </Avatar>
                   <div>
                       <h1 className="font-bold text-2xl">{fullName}</h1>
                   </div>
               </div>
           </div>


           {/* Basic Information Grid */}
           <div className="grid gap-6 md:grid-cols-2">
               <[Entity]BasicInfo
                   [entity]={{
                       name: [entity].name,
                       email: [entity].email,
                       phone: [entity].phone,
                       status_field: [entity].status_field || "unknown",
                   }}
                   isEditing={editState.isEditing && editState.section === "basic"}
                   onEditToggle={() => handleEditToggle("basic")}
                   onSave={handleSave}
                   onCancel={handleCancel}
               />
               <[Entity][Section]
                   [entity]={[entity]}
                   isEditing={editState.isEditing && editState.section === "other_section"}
                   onEditToggle={() => handleEditToggle("other_section")}
                   onSave={handleSave}
                   onCancel={handleCancel}
               />
           </div>


           {/* Children Level Info Sections */}
           <Tabs defaultValue="[relation1]s" className="w-full">
               <TabsList className="grid w-full grid-cols-3">
                   <TabsTrigger value="[relation1]s">[Relation1]s</TabsTrigger>
                   <TabsTrigger value="[relation2]s">[Relation2]s</TabsTrigger>
                   <TabsTrigger value="[relation3]s">[Relation3]s</TabsTrigger>
               </TabsList>


               <TabsContent value="[relation1]s">
                   <[Entity][Relation1]Section
                       [entity]Id={[entity]Id}
                       [relation1]s={[entity].[entity]_[relation1]s}
                       setDeleteModal={setDeleteModal}
                   />
               </TabsContent>


               <TabsContent value="[relation2]s">
                   <[Entity][Relation2]Section
                       [entity]Id={[entity]Id}
                       [relation2]s={[entity].[entity]_[relation2]s}
                       setDeleteModal={setDeleteModal}
                   />
               </TabsContent>


               <TabsContent value="[relation3]s">
                   <[Entity][Relation3]Section
                       [entity]Id={[entity]Id}
                       [relation3]s={[entity].[entity]_[relation3]s}
                       setDeleteModal={setDeleteModal}
                   />
               </TabsContent>
           </Tabs>


           {/* System Information */}
           <[Entity]SystemInfo [entity]={[entity]} />


           {/* Delete Confirmation Modal */}
           <DeleteConfirmModal
               isOpen={deleteModal.isOpen}
               onOpenChange={(open) =>
                   setDeleteModal({ ...deleteModal, isOpen: open })
               }
               onConfirm={handleDelete}
               title={deleteModal.title}
               description="This action cannot be undone. This will permanently delete the record."
           />
       </div>
   );
}
```


## Basic Information Section Pattern


**File:** `apps/web/src/features/[feature]/components/detail-sections/[entity]-basic-info.tsx`


```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";


import { useState } from "react";
import { Edit3, Save, X } from "lucide-react";
import { [Icon] } from "lucide-react";


interface [Entity]BasicInfoProps {
   [entity]: {
       name: string;
       email: string;
       phone?: string | null;
       status_field: string;
   };
   isEditing?: boolean;
   onEditToggle?: () => void;
   onSave?: (data: any) => void;
   onCancel?: () => void;
}


export function [Entity]BasicInfo({
   [entity],
   isEditing = false,
   onEditToggle,
   onSave,
   onCancel
}: [Entity]BasicInfoProps) {
   const [formData, setFormData] = useState({
       name: [entity].name,
       email: [entity].email,
       phone: [entity].phone || "",
       status_field: [entity].status_field,
   });


   const handleSave = () => {
       onSave?.(formData);
   };


   const handleCancel = () => {
       // Reset form data to original values
       setFormData({
           name: [entity].name,
           email: [entity].email,
           phone: [entity].phone || "",
           status_field: [entity].status_field,
       });
       onCancel?.();
   };


   return (
       <Card>
           <CardHeader>
               <CardTitle className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <[Icon] className="h-5 w-5" />
                       Basic Information
                   </div>
                   {!isEditing ? (
                       <Button
                           variant="ghost"
                           size="sm"
                           onClick={onEditToggle}
                           className="h-8 w-8 p-0"
                       >
                           <Edit3 className="h-4 w-4" />
                       </Button>
                   ) : (
                       <div className="flex gap-2">
                           <Button
                               variant="ghost"
                               size="sm"
                               onClick={handleSave}
                               className="h-8 w-8 p-0"
                           >
                               <Save className="h-4 w-4" />
                           </Button>
                           <Button
                               variant="ghost"
                               size="sm"
                               onClick={handleCancel}
                               className="h-8 w-8 p-0"
                           >
                               <X className="h-4 w-4" />
                           </Button>
                       </div>
                   )}
               </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
               <div>
                   <label className="font-medium text-muted-foreground text-sm">
                       Full Name
                   </label>
                   {isEditing ? (
                       <Input
                           value={formData.name}
                           onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                           className="mt-1"
                       />
                   ) : (
                       <p className="text-sm">{[entity].name}</p>
                   )}
               </div>
               <div>
                   <label className="font-medium text-muted-foreground text-sm">
                       Email
                   </label>
                   {isEditing ? (
                       <Input
                           type="email"
                           value={formData.email}
                           onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                           className="mt-1"
                       />
                   ) : (
                       <p className="text-sm">{[entity].email}</p>
                   )}
               </div>
               <div>
                   <label className="font-medium text-muted-foreground text-sm">
                       Phone
                   </label>
                   {isEditing ? (
                       <Input
                           value={formData.phone}
                           onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                           placeholder="Enter phone number"
                           className="mt-1"
                       />
                   ) : (
                       <p className="text-sm">{[entity].phone || "Not provided"}</p>
                   )}
               </div>
               <div>
                   <label className="font-medium text-muted-foreground text-sm">
                       Status
                   </label>
                   {isEditing ? (
                       <Select
                           value={formData.status_field}
                           onValueChange={(value) => setFormData(prev => ({ ...prev, status_field: value }))}
                       >
                           <SelectTrigger className="mt-1">
                               <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="option1">Option 1</SelectItem>
                               <SelectItem value="option2">Option 2</SelectItem>
                               <SelectItem value="option3">Option 3</SelectItem>
                           </SelectContent>
                       </Select>
                   ) : (
                       <p className="text-sm">
                           <StatusBadge>{[entity].status_field}</StatusBadge>
                       </p>
                   )}
               </div>
           </CardContent>
       </Card>
   );
}
```


## Children Relationship Section Pattern


**File:** `apps/web/src/features/[feature]/components/detail-sections/[entity]-[relations]-section.tsx`


```typescript
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import {
   getCoreRowModel,
   getSortedRowModel,
   useReactTable,
} from "@tanstack/react-table";
import { [Icon] } from "lucide-react";
import { No[Relations] } from "../empty-states/no-[relations]";
import { Manage[Relation]Modal } from "../manage-[relation]-modal";
import {
   create[Relation]Columns,
   create[Relation]RowActions,
} from "../table-columns/[relation]-columns";


interface [Entity][Relations]SectionProps {
   [entity]Id: string;
   [relations]: any[];
   setDeleteModal: (modal: any) => void;
}


export function [Entity][Relations]Section({
   [entity]Id,
   [relations],
   setDeleteModal,
}: [Entity][Relations]SectionProps) {
   const [editModal, setEditModal] = useState<{
       isOpen: boolean;
       type: string;
       data: any;
   }>({
       isOpen: false,
       type: "",
       data: null,
   });


   const [relation]Columns = create[Relation]Columns();
   const [relation]RowActions = create[Relation]RowActions(
       setDeleteModal,
       setEditModal,
   );


   const [relation]Table = useReactTable({
       data: [relations] || [],
       columns: [relation]Columns,
       getCoreRowModel: getCoreRowModel(),
       getSortedRowModel: getSortedRowModel(),
   });


   if (![relations] || [relations].length === 0) {
       return <No[Relations] [entity]Id={[entity]Id} />;
   }


   return (
       <Card>
           <CardHeader>
               <div className="flex items-center justify-between">
                   <CardTitle className="flex items-center gap-2">
                       <[Icon] className="h-5 w-5" />
                       [Relations Title]
                   </CardTitle>
                   <Manage[Relation]Modal [entity]Id={[entity]Id} mode="add" />
               </div>
           </CardHeader>
           <CardContent>
               <UniversalDataTable
                   table={[relation]Table}
                   rowActions={[relation]RowActions}
                   emptyStateMessage="No [relations] found for this [entity]"
               />
           </CardContent>


           <Manage[Relation]Modal
               [entity]Id={[entity]Id}
               [relation]={editModal.data}
               mode="edit"
               open={editModal.isOpen && editModal.type === "[relation]"}
               onOpenChange={(open: boolean) =>
                   setEditModal((prev) => ({ ...prev, isOpen: open }))
               }
           />
       </Card>
   );
}
```


## Modal Component Pattern


**File:** `apps/web/src/features/[feature]/components/manage-[relation]-modal.tsx`


```typescript
"use client";


import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";


import {
   create[Entity][Relation],
   update[Entity][Relation],
} from "@/features/[entities]/actions/relations/[relations]";
import { [entity]Queries } from "@/features/[entities]/queries/use[Entities]";


// Import any data source queries (e.g., for dropdown options)
import { useActive[DataSource] } from "@/features/[datasource]/queries/use[DataSources]";


import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Plus, [Icon] } from "lucide-react";
import { toast } from "sonner";


interface Manage[Relation]ModalProps {
   [entity]Id: string;
   mode: "add" | "edit";
   [relation]?: any;
   children?: ReactNode;
   open?: boolean;
   onOpenChange?: (open: boolean) => void;
}


export function Manage[Relation]Modal({
   [entity]Id,
   mode,
   [relation],
   children,
   open: externalOpen,
   onOpenChange: externalOnOpenChange,
}: Manage[Relation]ModalProps) {
   const isEdit = mode === "edit";
   const [internalOpen, setInternalOpen] = useState(false);


   // Use external state if provided, otherwise use internal state
   const open = externalOpen !== undefined ? externalOpen : internalOpen;
   const setOpen = externalOnOpenChange || setInternalOpen;
   const [isLoading, setIsLoading] = useState(false);
   const queryClient = useQueryClient();


   // Data source queries (for dropdowns)
   const { data: [datasources] = [] } = useActive[DataSource]();


   const [formData, setFormData] = useState({
       // Initialize form fields based on ENTITY_CONFIG.relationshipTabs[].modalForm.fields
       field1: null as string | null,
       field2: "",
       field3: "",
       field4: false,
       // ... add all fields from your config
   });


   // Populate form data when editing
   useEffect(() => {
       if (isEdit && [relation]) {
           setFormData({
               field1: [relation].field1 || null,
               field2: [relation].field2 || "",
               field3: [relation].field3
                   ? format(new Date([relation].field3), "yyyy-MM-dd")
                   : "",
               field4: [relation].field4 || false,
               // ... map all fields from your relation data
           });
       } else if (!isEdit) {
           // Reset form for add mode
           setFormData({
               field1: null,
               field2: "",
               field3: format(new Date(), "yyyy-MM-dd"), // Default to today for date fields
               field4: false,
               // ... reset all fields
           });
       }
   }, [isEdit, [relation], open]);


   const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();


       // Validation based on required fields in ENTITY_CONFIG
       if (!formData.field1) {
           toast.error("Field1 is required");
           return;
       }


       if (!formData.field2.trim()) {
           toast.error("Field2 is required");
           return;
       }


       setIsLoading(true);


       try {
           if (isEdit && [relation]) {
               await update[Entity][Relation]([relation].id, formData);
               toast.success("[Relation] updated successfully!");
           } else {
               await create[Entity][Relation]([entity]Id, formData);
               toast.success("[Relation] added successfully!");
           }


           // Invalidate the [entity] query to refresh the data
           await queryClient.invalidateQueries({
               queryKey: [entity]Queries.detail([entity]Id),
           });


           setOpen(false);
       } catch (error) {
           console.error(
               `Error ${isEdit ? "updating" : "adding"} [relation]:`,
               error,
           );
           toast.error(`Failed to ${isEdit ? "update" : "add"} [relation]`);
       } finally {
           setIsLoading(false);
       }
   };


   return (
       <Dialog open={open} onOpenChange={setOpen}>
           {externalOpen === undefined && (
               <DialogTrigger>
                   {children || (
                       <Button variant="outline" size="sm" className="gap-2">
                           {isEdit ? (
                               <Edit className="h-4 w-4" />
                           ) : (
                               <Plus className="h-4 w-4" />
                           )}
                           {isEdit ? "Edit [Relation]" : "Add [Relation]"}
                       </Button>
                   )}
               </DialogTrigger>
           )}
           <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                   <DialogTitle className="flex items-center gap-2">
                       <[Icon] className="h-5 w-5" />
                       {isEdit ? "Edit [Relation]" : "Add New [Relation]"}
                   </DialogTitle>
                   <DialogDescription>
                       {isEdit
                           ? "Update the [relation] details."
                           : "Add a new [relation] for this [entity]."}
                   </DialogDescription>
               </DialogHeader>


               <form onSubmit={handleSubmit} className="space-y-4">
                   {/* Text Input Field */}
                   <div>
                       <Label htmlFor="field2">[Field Label] *</Label>
                       <Input
                           id="field2"
                           placeholder="e.g., Enter field value"
                           value={formData.field2}
                           onChange={(e) =>
                               setFormData({ ...formData, field2: e.target.value })
                           }
                           required
                       />
                   </div>


                   {/* Select from Table Field */}
                   <div>
                       <Label htmlFor="field1">[Field Label] *</Label>
                       <Select
                           value={formData.field1 || "none"}
                           onValueChange={(value) =>
                               setFormData({
                                   ...formData,
                                   field1: value === "none" ? null : value,
                               })
                           }
                       >
                           <SelectTrigger>
                               <SelectValue placeholder="Select an option" />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="none" disabled>
                                   Select an option
                               </SelectItem>
                               {[datasources].map((item: any) => (
                                   <SelectItem key={item.id} value={item.id.toString()}>
                                       {item.name} {item.additional_field && `(${item.additional_field})`}
                                   </SelectItem>
                               ))}
                           </SelectContent>
                       </Select>
                   </div>


                   {/* Date Field */}
                   <div>
                       <Label htmlFor="field3">[Field Label] *</Label>
                       <Input
                           id="field3"
                           type="date"
                           value={formData.field3}
                           onChange={(e) =>
                               setFormData({ ...formData, field3: e.target.value })
                           }
                           required
                       />
                   </div>


                   {/* Checkbox Field */}
                   <div className="flex items-center space-x-2">
                       <Checkbox
                           id="field4"
                           checked={formData.field4}
                           onCheckedChange={(checked) =>
                               setFormData({ ...formData, field4: !!checked })
                           }
                       />
                       <Label htmlFor="field4">[Field Label]</Label>
                   </div>


                   {/* Select Field with Options */}
                   <div>
                       <Label htmlFor="status">Status *</Label>
                       <Select
                           value={formData.status || "not_started"}
                           onValueChange={(value) =>
                               setFormData({ ...formData, status: value })
                           }
                       >
                           <SelectTrigger>
                               <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="not_started">Not Started</SelectItem>
                               <SelectItem value="in_progress">In Progress</SelectItem>
                               <SelectItem value="completed">Completed</SelectItem>
                               <SelectItem value="paused">Paused</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>


                   {/* Textarea Field */}
                   <div>
                       <Label htmlFor="notes">Notes</Label>
                       <Textarea
                           id="notes"
                           placeholder="Enter any additional notes"
                           value={formData.notes}
                           onChange={(e) =>
                               setFormData({ ...formData, notes: e.target.value })
                           }
                           rows={3}
                       />
                   </div>


                   <div className="flex justify-end gap-2 pt-4">
                       <Button
                           type="button"
                           variant="outline"
                           onClick={() => setOpen(false)}
                           disabled={isLoading}
                       >
                           Cancel
                       </Button>
                       <Button type="submit" disabled={isLoading}>
                           {isLoading
                               ? isEdit
                                   ? "Updating..."
                                   : "Adding..."
                               : isEdit
                                   ? "Update [Relation]"
                                   : "Add [Relation]"}
                       </Button>
                   </div>
               </form>
           </DialogContent>
       </Dialog>
   );
}
```


## Table Columns Pattern


**File:** `apps/web/src/features/[feature]/components/table-columns/[relation]-columns.tsx`


```typescript
import { createColumnHelper } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";


const formatDate = (dateString: string | null) => {
   if (!dateString) return "Not set";
   try {
       return format(new Date(dateString), "MMM dd, yyyy");
   } catch {
       return "Invalid date";
   }
};


export const create[Relation]Columns = () => {
   const [relation]ColumnHelper = createColumnHelper<any>();
   return [
       // Text field column
       [relation]ColumnHelper.accessor("field_name", {
           header: "Field Display Name",
           cell: (info) => info.getValue() || "Unknown",
       }),
      
       // Related entity field column
       [relation]ColumnHelper.accessor("related_entity.name", {
           header: "Related Entity Name",
           cell: (info) =>
               info.getValue() || info.row.original.related_entity?.name || "Unknown",
       }),
      
       // Email field from related entity
       [relation]ColumnHelper.accessor("related_entity.user.email", {
           header: "Email",
           cell: (info) => info.getValue() || "No email",
       }),
      
       // Status field with StatusBadge
       [relation]ColumnHelper.accessor("status", {
           header: "Status",
           cell: (info) => <StatusBadge>{info.getValue()}</StatusBadge>,
       }),
      
       // Date field
       [relation]ColumnHelper.accessor("start_date", {
           header: "Start Date",
           cell: (info) => formatDate(info.getValue()),
       }),
      
       // Optional date field
       [relation]ColumnHelper.accessor("end_date", {
           header: "End Date",
           cell: (info) => formatDate(info.getValue()),
       }),
      
       // Number field
       [relation]ColumnHelper.accessor("target_value", {
           header: "Target",
           cell: (info) => info.getValue() || "Not set",
       }),
   ];
};


export const create[Relation]RowActions = (
   setDeleteModal: any,
   setEditModal: any,
) => [
   {
       label: "Edit",
       icon: Edit,
       onClick: ([relation]: any) => {
           setEditModal({
               isOpen: true,
               type: "[relation]",
               data: [relation],
           });
       },
   },
   {
       label: "Delete",
       icon: Trash2,
       variant: "destructive" as const,
       onClick: ([relation]: any) => {
           setDeleteModal({
               isOpen: true,
               type: "[relation]",
               id: [relation].id,
               title: `Delete [relation] for ${[relation].related_entity?.name || "Unknown"}`,
           });
       },
   },
];
```


## Empty State Component Pattern


**File:** `apps/web/src/features/[feature]/components/empty-states/no-[relations].tsx`


```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { [Icon] } from "lucide-react";
import { Manage[Relation]Modal } from "../manage-[relation]-modal";


interface No[Relations]Props {
   [entity]Id: string;
}


export function No[Relations]({ [entity]Id }: No[Relations]Props) {
   return (
       <Card>
           <CardHeader>
               <div className="flex items-center justify-between">
                   <CardTitle className="flex items-center gap-2">
                       <[Icon] className="h-5 w-5" />
                       [Relations Title]
                   </CardTitle>
                   <Manage[Relation]Modal [entity]Id={[entity]Id} mode="add" />
               </div>
           </CardHeader>
           <CardContent>
               <div className="py-8 text-center text-muted-foreground">
                   <[Icon] className="mx-auto mb-4 h-12 w-12 opacity-50" />
                   <p className="text-sm">No [relations] yet</p>
                   <p className="mt-1 text-xs">
                       [Relations] will appear here once added to this [entity]
                   </p>
               </div>
           </CardContent>
       </Card>
   );
}
```


## System Info Component Pattern


**File:** `apps/web/src/features/[feature]/components/detail-sections/[entity]-system-info.tsx`


```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock } from "lucide-react";


const formatDate = (dateString: string | null) => {
   if (!dateString) return "Not set";
   try {
       return format(new Date(dateString), "MMM dd, yyyy");
   } catch {
       return "Invalid date";
   }
};


interface [Entity]SystemInfoProps {
   [entity]: {
       created_at: string;
       updated_at: string;
   };
}


export function [Entity]SystemInfo({ [entity] }: [Entity]SystemInfoProps) {
   return (
       <Card>
           <CardHeader>
               <CardTitle className="flex items-center gap-2">
                   <Clock className="h-5 w-5" />
                   System Information
               </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
               <div>
                   <label className="font-medium text-muted-foreground text-sm">
                       Created At
                   </label>
                   <p className="text-sm">{formatDate([entity].created_at)}</p>
               </div>
               <div>
                   <label className="font-medium text-muted-foreground text-sm">
                       Last Updated
                   </label>
                   <p className="text-sm">{formatDate([entity].updated_at)}</p>
               </div>
           </CardContent>
       </Card>
   );
}
```


## Detail Header Component


**File:** `apps/web/src/features/[feature]/layout/[entity].detail.header.tsx`


```typescript
"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { use[Entity] } from "@/features/[entities]/queries/use[Entities]";
import { delete[Entity] } from "@/features/[entities]/actions/delete[Entity]";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";


interface [Entity]DetailHeaderProps {
   [entity]Id: string;
}


export default function [Entity]DetailHeader({
   [entity]Id,
}: [Entity]DetailHeaderProps) {
   const { data: [entity] } = use[Entity]([entity]Id);
   const router = useRouter();
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
   const { execute: executeDelete[Entity], isExecuting } = useAction(delete[Entity], {
       onSuccess: () => {
           setIsDeleteDialogOpen(false);
           toast.success(`${[entity]?.name || '[Entity]'} has been deleted successfully`);
           router.push('/dashboard/[entities]');
       },
       onError: (error) => {
           console.error('Failed to delete [entity]:', error);
           toast.error('Failed to delete [entity]. Please try again.');
       },
   });


   const handleDelete[Entity] = () => {
       executeDelete[Entity]({ id: [entity]Id });
   };


   return (
       <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
           <div className="flex items-center gap-2">
               <SidebarTrigger />
               <BackButton />
               <h1 className="font-medium text-[13px]">
                   {[entity]?.name ? `${[entity].name} - Details` : "[Entity] Details"}
               </h1>
           </div>
           <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
               <Dialog.Trigger asChild>
                   <Button variant="destructive" className="flex items-center gap-2">
                       <Trash2Icon className="mr-[6px] h-4 w-4" />
                       Delete [Entity]
                   </Button>
               </Dialog.Trigger>
               <Dialog.Portal>
                   <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                   <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
                       <Dialog.Title className="text-lg font-semibold mb-4">
                           Delete [Entity]
                       </Dialog.Title>
                       <Dialog.Description className="text-gray-600 mb-6">
                           Are you sure you want to delete {[entity]?.name || 'this [entity]'}? This action cannot be undone.
                       </Dialog.Description>
                       <div className="flex justify-end gap-3">
                           <Dialog.Close asChild>
                               <Button variant="outline">Cancel</Button>
                           </Dialog.Close>
                           <Button
                               variant="destructive"
                               onClick={handleDelete[Entity]}
                               disabled={isExecuting}
                           >
                               {isExecuting ? 'Deleting...' : 'Delete'}
                           </Button>
                       </div>
                       <Dialog.Close asChild>
                           <Button variant="ghost" size="sm" className="absolute top-3 right-3 p-1">
                               <X className="h-4 w-4" />
                           </Button>
                       </Dialog.Close>
                   </Dialog.Content>
               </Dialog.Portal>
           </Dialog.Root>
       </div>
   );
}
```


## Loading Skeleton Component


**File:** `apps/web/src/features/[feature]/components/[entity].detail.skeleton.tsx`


```typescript
import MainLayout from "@/components/layout/main-layout";
import [Entity]DetailHeader from "../layout/[entity].detail.header";


interface [Entity]DetailSkeletonProps {
   [entity]Id: string;
}


export default function [Entity]DetailSkeleton({
   [entity]Id,
}: [Entity]DetailSkeletonProps) {
   return (
       <MainLayout
           headers={[
               <[Entity]DetailHeader key="[entity]-detail-header" [entity]Id={[entity]Id} />,
           ]}
       >
           <div className="animate-pulse space-y-6 p-6">
               {/* Header skeleton */}
               <div className="flex items-start justify-between">
                   <div className="flex items-start space-x-4">
                       <div className="h-16 w-16 rounded-full bg-muted" />
                       <div className="space-y-2">
                           <div className="h-8 w-48 rounded bg-muted" />
                           <div className="h-4 w-64 rounded bg-muted" />
                           <div className="h-4 w-40 rounded bg-muted" />
                           <div className="flex space-x-2">
                               <div className="h-6 w-16 rounded bg-muted" />
                               <div className="h-6 w-24 rounded bg-muted" />
                           </div>
                       </div>
                   </div>
                   <div className="h-10 w-32 rounded bg-muted" />
               </div>


               {/* Cards skeleton */}
               <div className="grid gap-6 md:grid-cols-2">
                   {[...Array(4)].map((_, i) => (
                       <div key={i} className="rounded-lg border p-6">
                           <div className="mb-4 h-6 w-32 rounded bg-muted" />
                           <div className="space-y-3">
                               <div className="h-4 w-full rounded bg-muted" />
                               <div className="h-4 w-3/4 rounded bg-muted" />
                               <div className="h-4 w-1/2 rounded bg-muted" />
                           </div>
                       </div>
                   ))}
               </div>


               {/* Additional content skeleton */}
               <div className="space-y-4">
                   {[...Array(2)].map((_, i) => (
                       <div key={i} className="rounded-lg border p-6">
                           <div className="mb-4 h-6 w-40 rounded bg-muted" />
                           <div className="space-y-3">
                               {[...Array(3)].map((_, j) => (
                                   <div
                                       key={j}
                                       className="flex items-center justify-between rounded-lg border p-3"
                                   >
                                       <div className="space-y-1">
                                           <div className="h-4 w-32 rounded bg-muted" />
                                           <div className="h-3 w-48 rounded bg-muted" />
                                       </div>
                                       <div className="h-3 w-24 rounded bg-muted" />
                                   </div>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </MainLayout>
   );
}
```


## Shared Delete Confirmation Modal


**File:** `apps/web/src/features/[feature]/components/shared/delete-confirm-modal.tsx`


```typescript
import { useState } from "react";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface DeleteConfirmModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   onConfirm: () => Promise<void>;
   title: string;
   description: string;
}


export function DeleteConfirmModal({
   isOpen,
   onOpenChange,
   onConfirm,
   title,
   description,
}: DeleteConfirmModalProps) {
   const [isDeleting, setIsDeleting] = useState(false);


   const handleConfirm = async () => {
       setIsDeleting(true);
       try {
           await onConfirm();
           onOpenChange(false);
       } catch (error) {
           console.error("Delete failed:", error);
       } finally {
           setIsDeleting(false);
       }
   };


   return (
       <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
           <AlertDialogContent>
               <AlertDialogHeader>
                   <AlertDialogTitle>{title}</AlertDialogTitle>
                   <AlertDialogDescription>{description}</AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                   <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                   <AlertDialogAction
                       onClick={handleConfirm}
                       disabled={isDeleting}
                       className="bg-red-600 hover:bg-red-700"
                   >
                       {isDeleting ? "Deleting..." : "Delete"}
                   </AlertDialogAction>
               </AlertDialogFooter>
           </AlertDialogContent>
       </AlertDialog>
   );
}
```


## Required Actions Structure


### Main Update Action


**File:** `apps/web/src/features/[feature]/actions/update[Entity].ts`


```typescript
"use server";


import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { [entity]UpdateSchema } from "@/features/[entities]/types/[entity]";
import { returnValidationErrors } from "next-safe-action";


export const update[Entity]Action = actionClient
   .inputSchema([entity]UpdateSchema)
   .action(async ({ parsedInput }) => {
       const { id, ...updateData } = parsedInput;


       try {
           const supabase = await createClient();


           // 1. Check if [entity] exists
           const { data: existing[Entity], error: fetchError } = await supabase
               .from("[entities]")
               .select("id, email")
               .eq("id", id)
               .single();


           if (fetchError || !existing[Entity]) {
               return returnValidationErrors([entity]UpdateSchema, {
                   _errors: ["[Entity] not found"],
               });
           }


           // 2. If email is being updated, check for conflicts
           if (updateData.email && updateData.email !== existing[Entity].email) {
               const { data: emailConflict } = await supabase
                   .from("[entities]")
                   .select("id")
                   .eq("email", updateData.email)
                   .neq("id", id)
                   .single();


               if (emailConflict) {
                   return returnValidationErrors([entity]UpdateSchema, {
                       email: {
                           _errors: ["[Entity] with this email already exists"],
                       },
                   });
               }
           }


           // 3. Prepare update data (remove undefined values and map to database field names)
           const cleanUpdateData: any = {};


           // Map camelCase to snake_case and handle data transformations
           if (updateData.name !== undefined) cleanUpdateData.name = updateData.name;
           if (updateData.email !== undefined) cleanUpdateData.email = updateData.email;
           if (updateData.phone !== undefined) {
               cleanUpdateData.phone = updateData.phone;
           }
           if (updateData.statusField !== undefined) {
               cleanUpdateData.status_field = updateData.statusField;
           }


           // 4. Update the [entity] record
           const { data: updated[Entity], error: updateError } = await supabase
               .from("[entities]")
               .update({
                   ...cleanUpdateData,
                   updated_at: new Date().toISOString(),
               })
               .eq("id", id)
               .select()
               .single();


           if (updateError) {
               console.error("Error updating [entity]:", updateError);
               return returnValidationErrors([entity]UpdateSchema, {
                   _errors: ["Failed to update [entity]. Please try again."],
               });
           }


           if (!updated[Entity]) {
               return returnValidationErrors([entity]UpdateSchema, {
                   _errors: ["[Entity] update failed. Please try again."],
               });
           }


           // 5. Revalidate relevant paths
           revalidatePath("/dashboard/[entities]");
           revalidatePath(`/dashboard/[entities]/${id}`);
           revalidatePath("/dashboard");


           return {
               success: true,
               data: {
                   success: "[Entity] updated successfully",
                   [entity]: {
                       id: updated[Entity].id,
                       name: updated[Entity].name,
                       email: updated[Entity].email,
                       phone: updated[Entity].phone,
                       status_field: updated[Entity].status_field,
                   },
               },
           };
       } catch (error) {
           console.error("Unexpected error in update[Entity]:", error);


           return returnValidationErrors([entity]UpdateSchema, {
               _errors: ["Failed to update [entity]. Please try again."],
           });
       }
   });
```


### Relation Action Pattern


**File:** `apps/web/src/features/[feature]/actions/relations/[relation-type].ts`


```typescript
"use server";


import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";


export async function delete[Entity][Relation](relationId: string) {
   const supabase = await createClient();
   const user = await getUser();


   if (!user) {
       throw new Error("Authentication required");
   }


   const { error } = await supabase
       .from("[entity]_[relations]")
       .delete()
       .eq("id", relationId);


   if (error) {
       throw new Error(`Failed to delete [relation]: ${error.message}`);
   }


   return { success: true };
}


export async function create[Entity][Relation](
   [entity]Id: string,
   relationData: any,
) {
   const supabase = await createClient();
   const user = await getUser();


   if (!user) {
       throw new Error("Authentication required");
   }


   const { data, error } = await supabase
       .from("[entity]_[relations]")
       .insert({
           [entity]_id: [entity]Id,
           ...relationData,
           created_by: user.user.id,
       })
       .select()
       .single();


   if (error) {
       throw new Error(`Failed to create [relation]: ${error.message}`);
   }


   return { success: true, data };
}


export async function update[Entity][Relation](
   relationId: string,
   relationData: any,
) {
   const supabase = await createClient();
   const user = await getUser();


   if (!user) {
       throw new Error("Authentication required");
   }


   const { error } = await supabase
       .from("[entity]_[relations]")
       .update(relationData)
       .eq("id", relationId);


   if (error) {
       throw new Error(`Failed to update [relation]: ${error.message}`);
   }


   return { success: true };
}
```


## Implementation Checklist


- [ ] Replace ENTITY_CONFIG section with your specific entity configuration
- [ ] Create page route in `apps/web/src/app/dashboard/[entities]/[id]/page.tsx` if doesn't exist
- [ ] Implement main detail view component
- [ ] Create basic info section with inline editing
- [ ] Implement all relationship sections with UniversalDataTable
- [ ] Add empty state components for each relationship
- [ ] Create system info component
- [ ] Implement detail header with delete functionality
- [ ] Add loading skeleton component
- [ ] Create shared delete confirmation modal
- [ ] Create manage modal for each relationship type
- [ ] Create table column definitions for each relationship
- [ ] Implement update action with validation
- [ ] Create relation CRUD actions
- [ ] Set up proper React Query hooks
- [ ] Test inline editing functionality
- [ ] Test relationship CRUD operations
- [ ] Test modal add/edit functionality
- [ ] Test delete functionality
- [ ] Verify proper error handling and validation


## Key Features


- **Input Data Configuration**: Comprehensive config object to specify all aspects of the detail page
- **Inline Editing**: Click-to-edit functionality for basic information sections
- **Tabbed Interface**: Clean organization of relationship data
- **Modal Forms**: Full CRUD modals for relationship management with field validation
- **Universal Data Tables**: Consistent table experience with sorting, filtering
- **Empty States**: User-friendly empty states for relationships
- **Real-time Updates**: Optimistic updates with React Query
- **Error Handling**: Comprehensive validation and error display
- **Loading States**: Skeleton loading for better UX
- **Delete Confirmation**: Safe deletion with confirmation modals
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation


This guide provides everything needed to create consistent, feature-rich detail pages that follow the established Warrior Babe v2 architecture patterns. Replace the ENTITY_CONFIG section with your specific entity data to generate a complete detail page implementation.

