# Da Vinki PDF

A comprehensive online PDF toolkit built with Next.js 16, featuring 14 powerful tools for editing, converting, and managing PDF documents entirely in the browser.

## Features

### Edit Tools
- **PDF Editor**: Edit text, add annotations, draw, and insert images
- **Add Watermark**: Add text or image watermarks
- **Add Page Numbers**: Customize page numbering with various styles
- **Add Signature**: Draw or upload signatures

### Organize Tools
- **Split PDF**: Split documents into separate pages or ranges
- **Merge PDFs**: Combine multiple PDF files into one
- **Rotate Pages**: Adjust page orientation
- **Remove Pages**: Delete specific pages
- **Reorder Pages**: Drag-and-drop page reordering

### Convert Tools
- **Extract Images**: Extract all images from PDFs
- **Extract Text**: Export all text content
- **Convert PDF**: Convert pages to PNG/JPG images
- **Compress PDF**: Reduce file size while maintaining quality

### Secure Tools
- **Protect PDF**: Add password protection

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **PDF Processing**: pdf-lib, pdfjs-dist
- **TypeScript**: Full type safety
- **Deployment**: Vercel

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── (tools)/           # Individual tool pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── pdf/               # PDF-specific components
│   ├── tools/             # Tool implementation components
│   ├── ui/                # shadcn/ui components
│   ├── header.tsx         # App header
│   └── download-modal.tsx # Download confirmation modal
├── lib/
│   ├── constants/         # App-wide constants
│   ├── utils/             # Utility functions
│   ├── pdf-types.ts       # PDF type definitions
│   ├── pdf-utils.ts       # PDF operation utilities
│   └── pdf-worker.ts      # PDF.js worker configuration
└── hooks/                 # Custom React hooks
```

## Key Features

- **100% Client-Side**: All PDF processing happens in the browser
- **No Server Required**: Privacy-focused - files never leave your device
- **Modern UI**: Clean, minimalist design with smooth animations
- **Responsive**: Works seamlessly on desktop and mobile
- **Type-Safe**: Full TypeScript coverage
- **Accessible**: WCAG compliant with proper ARIA labels

## Development

Built with modern web technologies and best practices:

- Modular architecture with clear separation of concerns
- Shared utilities for common operations
- Comprehensive type definitions
- Error handling and validation utilities
- Reusable hooks for state management
- Consistent UI components using shadcn/ui

## Performance

- Dynamic imports for PDF tools to optimize bundle size
- Client-side only rendering for tools (prevents SSR issues)
- Font caching for improved PDF generation
- Lazy loading of heavy dependencies

## Browser Compatibility

Requires modern browsers with support for:
- ES2020+ features
- Web Workers
- Canvas API
- File API

Tested on Chrome, Firefox, Safari, and Edge.
