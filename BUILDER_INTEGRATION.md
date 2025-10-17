# Builder.io Integration

This project now includes Builder.io integration for the homepage, allowing you to manage content through Builder.io's visual editor.

## 🚀 **What's Been Implemented**

### **1. Dependencies Installed**
- `@builder.io/react` - React components for Builder.io
- `@builder.io/sdk` - Builder.io SDK
- `@builder.io/dev-tools` - Development tools

### **2. Core Files Created**

#### **Configuration Files:**
- `lib/builder-registry.ts` - Builder.io configuration and component registry
- `lib/constants.ts` - Constants for models and query parameters
- `lib/interfaces.ts` - TypeScript interfaces for type safety
- `lib/fetchRequest.ts` - API client for fetching Builder.io content

#### **Components:**
- `app/components/BuilderComponent.tsx` - Wrapper component for rendering Builder.io content
- `app/components/BuilderFallback.tsx` - Fallback component when no Builder.io content is found

#### **Pages:**
- `app/page-builder.tsx` - New homepage that uses Builder.io content
- `app/page.tsx` - Updated to use the Builder.io version

### **3. Environment Configuration**
- `.env.local` - Contains your Builder.io API key: `9812127712ac4442ab80f6c2fd972a3f`

## 🎯 **How It Works**

### **Content Fetching Flow:**
1. **URL Request** → Next.js Route
2. **FetchRequest.getData()** → Builder.io API
3. **Content Rendering** → BuilderComponent

### **Homepage Logic:**
```typescript
// 1. Fetch content by URL path "/"
const content = await FetchRequest.getData({
  model: "page",
  query: [{ key: "userAttributes.urlPath", value: "/" }]
});

// 2. Render Builder.io content or fallback
if (content?.results[0]) {
  return <RenderBuilderContent content={content.results[0]} model="page" />;
} else {
  return <BuilderFallback />;
}
```

## 🛠 **Usage**

### **1. Access Builder.io Editor**
- Go to [builder.io](https://builder.io)
- Sign in with your account
- Create a new page with URL path "/"
- Design your homepage using the visual editor

### **2. Content Management**
- All content is managed through Builder.io's visual editor
- Changes are reflected immediately on your site
- SEO metadata can be managed in Builder.io

### **3. Fallback Behavior**
- If no Builder.io content is found, the site shows a simple fallback page
- This ensures your site never breaks even if Builder.io is unavailable

## 🔧 **Configuration**

### **API Key**
The Builder.io API key is set in `.env.local`:
```
NEXT_PUBLIC_BUILDER_API_KEY=9812127712ac4442ab80f6c2fd972a3f
```

### **Models**
Currently configured for:
- `page` model - For homepage content

### **Query Parameters**
- `userAttributes.urlPath` - Match content by URL path
- `query.data.slug` - Match content by slug

## 🎨 **Design System**

The integration includes basic design tokens:
- **Colors**: Primary, Secondary, Accent, Dark, Light
- **Fonts**: Inter, Arial
- **Font Sizes**: xs (0.75rem) to 6xl (3.75rem)

## 🚀 **Next Steps**

1. **Create Homepage Content**: Go to Builder.io and create your homepage
2. **Add Custom Components**: Register any custom React components you need
3. **Extend to Other Pages**: Use the same pattern for other pages
4. **Customize Design Tokens**: Update colors and fonts in `builder-registry.ts`

## 📝 **File Structure**

```
lib/
├── builder-registry.ts    # Builder.io configuration
├── constants.ts           # Constants and enums
├── interfaces.ts          # TypeScript interfaces
└── fetchRequest.ts        # API client

app/
├── components/
│   ├── BuilderComponent.tsx    # Builder.io wrapper
│   └── BuilderFallback.tsx     # Fallback component
├── page-builder.tsx            # Builder.io homepage
└── page.tsx                    # Updated to use Builder.io
```

## 🔍 **Testing**

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. If Builder.io content exists, it will render
4. If no content, you'll see the fallback page

## 🆘 **Troubleshooting**

- **No content showing**: Check if you've created a page in Builder.io with URL path "/"
- **API errors**: Verify your API key in `.env.local`
- **Build errors**: Ensure all dependencies are installed with `npm install`
