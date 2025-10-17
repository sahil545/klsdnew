# Builder.io Dynamic Components Guide

This guide shows you how to use all the dynamic components I've registered in Builder.io for your homepage rebuild.

## 🚀 **Quick Start**

1. **Go to Builder.io**: Visit [builder.io](https://builder.io) and sign in
2. **Open Your Page**: Navigate to your homepage with URL path "/"
3. **Start Building**: Drag and drop components from the left panel
4. **Configure**: Use the right panel to customize component settings

## 📦 **Available Dynamic Components**

### **🏆 Booking & Reservation Components**

#### **1. ComprehensiveBooking**
- **What it does**: Full-featured booking system with packages, pricing, and WooCommerce integration
- **Best for**: Main booking sections, product pages
- **Key features**: Package selection, date/time picker, guest count, live pricing

**Configuration Options:**
- `productId`: WooCommerce Product ID (default: 34450)
- `title`: Section title (default: "Book Your Adventure")
- `subtitle`: Section subtitle
- `showConnectionStatus`: Show/hide WooCommerce connection status

#### **2. Booking**
- **What it does**: Standard booking system with date/time selection
- **Best for**: Secondary booking sections, sidebar bookings
- **Key features**: Date picker, time slots, guest selection

**Configuration Options:**
- `productId`: WooCommerce Product ID
- `title`: Section title (default: "Reserve Your Spot")
- `showConnectionStatus`: Show/hide connection status

#### **3. SimpleBooking**
- **What it does**: Minimal booking component for quick reservations
- **Best for**: CTAs, header buttons, mobile-friendly bookings
- **Key features**: One-click booking, minimal UI

**Configuration Options:**
- `productId`: WooCommerce Product ID
- `buttonText`: Button text (default: "Book Now")

#### **4. BookingCalendar**
- **What it does**: Interactive calendar for date/time selection
- **Best for**: Standalone date selection, embedded calendars
- **Key features**: Calendar view, time slot selection, availability checking

**Configuration Options:**
- `productId`: WooCommerce Product ID
- `mode`: Calendar mode (date, time, date-time)
- `lazyLoad`: Load data on demand
- `showManualTimeInput`: Show manual time input option

#### **5. SimpleDatePicker**
- **What it does**: Simple date picker for booking
- **Best for**: Quick date selection, form integrations
- **Key features**: Date selection, time slots, validation

**Configuration Options:**
- `productId`: WooCommerce Product ID
- `title`: Picker title (default: "Select Date")
- `showTimeSlots`: Show time slot selection
- `minDate`: Minimum selectable date
- `maxDate`: Maximum selectable date

#### **6. BookNowButton**
- **What it does**: Reusable booking button with modal integration
- **Best for**: CTAs, hero sections, product cards, anywhere you need a booking button
- **Key features**: Customizable text, size, styling, integrated booking modal

**Configuration Options:**
- `buttonName`: Button display text (default: "Book Now") - **Primary text input**
- `text`: Button text (legacy - use buttonName instead)
- `size`: Button size (sm, lg, default)
- `variant`: Button variant (default, outline, ghost, link)
- `className`: Custom CSS classes (default: "bg-coral hover:bg-coral/90 text-white")
- `showIcon`: Show calendar icon (default: false)
- `productId`: WooCommerce Product ID (default: 34450)
- `fullWidth`: Make button full width (default: false)

### **🎨 Hero & Display Components**

#### **6. WooCommerceHero**
- **What it does**: Dynamic hero section with live product data
- **Best for**: Product page headers, main hero sections
- **Key features**: Live product data, dynamic pricing, booking integration

**Configuration Options:**
- `productId`: WooCommerce Product ID
- `backgroundImage`: Hero background image
- `showBookingButton`: Show/hide booking CTA
- `bookingButtonText`: Booking button text

#### **7. WooCommerceHeroNoBooking**
- **What it does**: Hero section without booking functionality
- **Best for**: Informational pages, marketing sections
- **Key features**: Static content, customizable text, image backgrounds

**Configuration Options:**
- `title`: Hero title
- `subtitle`: Hero subtitle
- `backgroundImage`: Hero background image
- `duration`: Tour duration
- `groupSize`: Maximum group size
- `location`: Tour location

#### **8. WooCommerceHeroNoBookingWordPress**
- **What it does**: WordPress-integrated hero section
- **Best for**: WordPress content integration
- **Key features**: WordPress data fetching, trust badges

**Configuration Options:**
- `productId`: WordPress Product ID
- `backgroundImage`: Hero background image
- `showTrustBadges`: Show/hide trust badges

#### **9. WooCommerceHeroStatic**
- **What it does**: Static hero section with predefined content
- **Best for**: Landing pages, marketing campaigns
- **Key features**: Predefined content, easy customization

**Configuration Options:**
- `title`: Hero title
- `subtitle`: Hero subtitle
- `backgroundImage`: Hero background image
- `price`: Tour price
- `rating`: Tour rating
- `reviewCount`: Number of reviews

#### **10. WooCommerceHeroFullWidth**
- **What it does**: Full-width hero section with product data
- **Best for**: Full-width layouts, immersive experiences
- **Key features**: Full-width design, product data integration

**Configuration Options:**
- `productId`: WooCommerce Product ID
- `backgroundImage`: Hero background image
- `overlayOpacity`: Background overlay opacity (0-1)

### **📋 Product Information Components**

#### **11. WooCommerceDetails**
- **What it does**: Detailed product information section
- **Best for**: Product descriptions, feature lists, requirements
- **Key features**: Tour highlights, included items, requirements

**Configuration Options:**
- `productId`: WooCommerce Product ID
- `showHighlights`: Show/hide tour highlights
- `showIncludedItems`: Show/hide included items
- `showRequirements`: Show/hide requirements

### **🗺️ Interactive Components**

#### **12. DiveSitesMapWrapper**
- **What it does**: Interactive map showing dive sites
- **Best for**: Location pages, dive site information
- **Key features**: Interactive map, site information, location data

**Configuration Options:**
- `selectedSite`: Initially selected site ID
- `height`: Map height in pixels (default: 400)
- `showSiteInfo`: Show/hide site information popup

#### **13. WordPressImage**
- **What it does**: Optimized image from WordPress media library
- **Best for**: Dynamic images, WordPress integration
- **Key features**: WordPress integration, image optimization, fallbacks

**Configuration Options:**
- `imageId`: WordPress image ID
- `filename`: Image filename (alternative to ID)
- `searchTerm`: Search term for image (alternative to ID)
- `width`: Image width (default: 800)
- `height`: Image height (default: 600)
- `alt`: Image alt text
- `title`: Image title
- `priority`: High priority loading
- `fallbackSrc`: Fallback image source

### **🔧 Utility Components**

#### **14. ClientPageWrapper**
- **What it does**: Wrapper for client-side components
- **Best for**: Complex layouts, data fetching coordination
- **Key features**: Client-side rendering, data coordination

**Configuration Options:**
- `productId`: Product ID for data fetching
- `showLoading`: Show/hide loading state

## 🎯 **Recommended Homepage Layout**

Here's a suggested structure for your homepage rebuild:

### **1. Hero Section**
- **Component**: `WooCommerceHero` or `WooCommerceHeroNoBooking`
- **Purpose**: Main headline, key value proposition
- **Configuration**: Set productId to your main tour product

### **2. Trust Indicators**
- **Component**: Static Builder.io elements
- **Purpose**: Reviews, ratings, certifications
- **Content**: Use Builder.io's text and image elements

### **3. Featured Tours**
- **Component**: `WooCommerceDetails`
- **Purpose**: Highlight key tour features
- **Configuration**: Set productId and customize display options

### **4. Interactive Map**
- **Component**: `DiveSitesMapWrapper`
- **Purpose**: Show dive locations
- **Configuration**: Set height and selected site

### **5. Booking Section**
- **Component**: `ComprehensiveBooking` or `Booking`
- **Purpose**: Main conversion point
- **Configuration**: Set productId and customize titles

### **6. Additional Content**
- **Components**: Static Builder.io elements
- **Purpose**: About section, testimonials, FAQ
- **Content**: Use Builder.io's rich text and image elements

## ⚙️ **Configuration Tips**

### **Product IDs**
- **Main Tour**: 34450 (Christ of the Abyss)
- **Other Tours**: Check your WooCommerce for other product IDs
- **Test Mode**: Use 34450 for testing

### **Image Optimization**
- **WordPress Images**: Use `WordPressImage` component for dynamic images
- **Static Images**: Use Builder.io's file upload for static images
- **Backgrounds**: Use Builder.io's background image settings

### **Responsive Design**
- **Mobile First**: Configure components for mobile, then desktop
- **Breakpoints**: Use Builder.io's responsive settings
- **Testing**: Test on different screen sizes

## 🚨 **Troubleshooting**

### **Components Not Showing**
1. Check if the component is properly imported in `builder-registry.ts`
2. Verify the component name matches exactly
3. Check browser console for errors

### **API Data Not Loading**
1. Verify `productId` is correct
2. Check WooCommerce API is accessible
3. Look for network errors in browser console

### **Styling Issues**
1. Check if Tailwind classes are applied
2. Verify component CSS is loaded
3. Use Builder.io's style overrides if needed

## 📱 **Mobile Considerations**

- **Touch-Friendly**: All components are touch-optimized
- **Loading States**: Components show loading indicators
- **Responsive**: Components adapt to screen size
- **Performance**: Optimized for mobile networks

## 🔄 **Data Flow**

1. **Builder.io** → Renders component with props
2. **Component** → Fetches data from WooCommerce API
3. **API** → Returns product/booking data
4. **Component** → Renders with live data
5. **User** → Interacts with dynamic content

## 🎨 **Customization**

### **Styling**
- Use Builder.io's style panel for quick changes
- Modify component CSS for advanced styling
- Use Tailwind classes for utility styling

### **Content**
- Configure component inputs in Builder.io
- Use Builder.io's text editor for static content
- Mix static and dynamic content as needed

## 📊 **Performance**

- **Lazy Loading**: Components load data on demand
- **Caching**: WooCommerce data is cached appropriately
- **Optimization**: Images are optimized automatically
- **Bundle Size**: Components are code-split for performance

---

## 🚀 **Next Steps**

1. **Start Building**: Open Builder.io and begin dragging components
2. **Test Components**: Configure each component and test functionality
3. **Customize Content**: Add your static content using Builder.io elements
4. **Preview & Publish**: Use Builder.io's preview and publish features
5. **Monitor Performance**: Check loading times and user experience

**Need Help?** Check the browser console for errors or refer to the component source code in `client/components/` for advanced customization.
