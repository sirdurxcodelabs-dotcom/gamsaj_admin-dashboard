# Content Routes Structure

## Overview
Projects, Blogs, and Company Information now have their own unique routes while using the Starter page as a placeholder until the actual pages are built.

## Route Structure

### Content Routes (Using Starter Page as Placeholder)

| Menu Item | Route | Component | Status |
|-----------|-------|-----------|--------|
| Projects | `/content/projects` | StarterPage | Placeholder |
| Blogs | `/content/blogs` | StarterPage | Placeholder |
| Company Information | `/content/company-info` | StarterPage | Placeholder |

### Admin Routes (Using Starter Page as Placeholder)

| Menu Item | Route | Component | Status |
|-----------|-------|-----------|--------|
| Users | `/admin/users` | StarterPage | Placeholder |
| Roles & Permissions | `/admin/roles` | StarterPage | Placeholder |

### Other Routes

| Menu Item | Route | Component | Status |
|-----------|-------|-----------|--------|
| Dashboard | `/dashboard` | Dashboard | Built |
| Calendar | `/apps/calendar` | Calendar | Built |
| Email | `/apps/email` | StarterPage | Placeholder |
| Invoice Report | `/apps/invoices/report` | InvoiceReport | Built |
| Invoice List | `/apps/invoices` | StarterPage | Placeholder |
| Invoice Details | `/apps/invoices/:id` | InvoiceDetail | Built |
| Profile | `/pages/profile` | Profile | Built |
| Starter Page | `/pages/starter` | StarterPage | Built |
| Maintenance | `/maintenance` | Maintenance | Built |
| Error 404 | `/error-404` | Error404 | Built |
| Error 404 Alt | `/pages/error-404-alt` | Error404Alt | Built |

## Why Different Routes?

### Before (Problem)
```typescript
// All pointing to the same route
Projects → /pages/starter
Blogs → /pages/starter
Company Info → /pages/starter
```

**Issues:**
- ❌ All three menu items highlight when on `/pages/starter`
- ❌ Cannot distinguish which page user is on
- ❌ Browser history shows same URL for different pages
- ❌ Cannot bookmark specific pages
- ❌ Cannot implement page-specific logic later

### After (Solution)
```typescript
// Each has unique route
Projects → /content/projects
Blogs → /content/blogs
Company Info → /content/company-info
```

**Benefits:**
- ✅ Each menu item highlights correctly
- ✅ Clear URL structure
- ✅ Unique browser history entries
- ✅ Bookmarkable pages
- ✅ Easy to replace placeholder with actual page later

## How It Works

### 1. Menu Items (`menu-items.ts`)
```typescript
{
  key: 'projects',
  icon: 'ri:folder-line',
  label: 'Projects',
  url: '/content/projects',  // Unique route
  permission: PERMISSIONS.VIEW_PROJECTS,
}
```

### 2. Routes (`routes/index.tsx`)
```typescript
// Import placeholder
const ProjectsPage = lazy(() => import('@/app/(admin)/pages/starter/page'))

// Define route
const contentRoutes: RoutesProps[] = [
  {
    path: '/content/projects',
    name: 'Projects',
    element: <ProjectsPage />,  // Uses Starter page
  },
]
```

### 3. Route Registration
```typescript
export const appRoutes = [
  ...generalRoutes,
  ...customPagesRoutes,
  ...appsRoutes,
  ...contentRoutes,  // Content routes added
  ...adminRoutes,
]
```

## Building Actual Pages

When you're ready to build the actual pages, simply:

### 1. Create the Page Component
```bash
# Create Projects page
admin-dashboard/src/app/(admin)/content/projects/page.tsx
```

### 2. Update the Import
```typescript
// In routes/index.tsx
// Before
const ProjectsPage = lazy(() => import('@/app/(admin)/pages/starter/page'))

// After
const ProjectsPage = lazy(() => import('@/app/(admin)/content/projects/page'))
```

### 3. No Other Changes Needed!
- ✅ Route already defined
- ✅ Menu item already configured
- ✅ Permissions already set
- ✅ Sidebar already working

## URL Structure

### Content Section
```
/content/projects          → Projects management
/content/blogs             → Blog management
/content/company-info      → Company information
```

### Admin Section
```
/admin/users               → User management
/admin/roles               → Role & permission management
```

### Apps Section
```
/apps/calendar             → Calendar
/apps/email                → Email
/apps/invoices             → Invoice list
/apps/invoices/report      → Invoice report
/apps/invoices/:id         → Invoice details
```

### Pages Section
```
/pages/profile             → User profile
/pages/starter             → Starter page template
/pages/error-404-alt       → Error 404 alternative
```

### Public Routes
```
/dashboard                 → Main dashboard
/maintenance               → Maintenance page
/error-404                 → Error 404 page
```

## Testing

### 1. Login as Super Admin
```
Email: superadmin@gamsaj.com
Password: SuperAdmin@123
```

### 2. Check Sidebar
All items should be visible:
- ✅ Dashboard
- ✅ Calendar
- ✅ Email
- ✅ Invoice (dropdown)
- ✅ Projects
- ✅ Blogs
- ✅ Company Information
- ✅ Profile
- ✅ Starter Page
- ✅ Maintenance
- ✅ Error pages
- ✅ Users
- ✅ Roles & Permissions

### 3. Test Navigation
Click each menu item and verify:
- ✅ URL changes to correct route
- ✅ Only clicked item is highlighted
- ✅ Page renders (Starter page for placeholders)
- ✅ Browser back/forward works
- ✅ Can bookmark each page

### 4. Test Permissions
Login with different roles and verify:
- ✅ Only permitted items show in sidebar
- ✅ Direct URL access blocked if no permission
- ✅ Redirects to login if unauthorized

## Next Steps

### Priority 1: Build Core Content Pages
1. **Projects Page** (`/content/projects`)
   - List all projects
   - Create/edit/delete projects
   - Project details view
   - File uploads (images, documents)

2. **Blogs Page** (`/content/blogs`)
   - List all blog posts
   - Create/edit/delete posts
   - Rich text editor
   - Image uploads
   - Categories/tags

3. **Company Info Page** (`/content/company-info`)
   - Company profile
   - Contact information
   - Office locations
   - Team members
   - Certifications

### Priority 2: Build Admin Pages
1. **Users Page** (`/admin/users`)
   - List all users
   - Create/edit/delete users
   - Assign roles
   - Activate/deactivate users
   - User details

2. **Roles Page** (`/admin/roles`)
   - List all roles
   - Create/edit/delete roles
   - Assign permissions
   - Role templates
   - Permission matrix

### Priority 3: Build App Pages
1. **Email Page** (`/apps/email`)
   - Inbox/sent/drafts
   - Compose email
   - Email templates
   - Attachments

2. **Invoice List** (`/apps/invoices`)
   - List all invoices
   - Filter/search
   - Create invoice
   - Export to PDF

## Files Modified

- ✅ `admin-dashboard/src/assets/data/menu-items.ts` - Updated URLs
- ✅ `admin-dashboard/src/routes/index.tsx` - Added content routes

## Status

✅ **Routes Updated**
✅ **Menu Items Updated**
✅ **No Diagnostics Errors**
✅ **Hot Reload Working**
✅ **Ready for Testing**

---

**Updated**: January 14, 2026, 5:36 AM
**Status**: Complete
