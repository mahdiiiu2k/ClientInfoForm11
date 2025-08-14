# Professional Client Information Form

## Overview

This is a modern, responsive web application that provides a comprehensive client information collection form for professional service providers. The application features dynamic form fields with smooth animations, allowing businesses to gather detailed information about their services, projects, and capabilities. Built with React, TypeScript, and modern UI components, it provides an intuitive interface for collecting everything from basic business details to complex service portfolios and project galleries.

## User Preferences

Preferred communication style: Simple, everyday language.
Form styling preference: Avoid rectangular card designs for form sections - prefer clean, minimal appearance with subtle visual separation.
Email functionality: Send emails from chouikimahdiabderrahmane@gmail.com to mahdiabd731@gmail.com when form is submitted, starting with years of experience field.
Deployment preference: Netlify deployment with full email functionality maintained in serverless environment.
Email debugging: Enhanced Netlify function with comprehensive logging for troubleshooting email delivery issues.
Function dependencies: Added package.json to netlify/functions directory with nodemailer and SendGrid fallback support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable interface elements
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Forms**: React Hook Form with Zod validation for robust form handling and data validation
- **Animations**: Framer Motion for smooth transitions and dynamic field animations
- **State Management**: TanStack Query for server state management and data fetching

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for development; Netlify Functions for production deployment
- **Language**: TypeScript for development, JavaScript for Netlify Functions
- **Data Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Storage**: In-memory storage implementation with interface for easy database integration
- **Email Service**: Nodemailer with Gmail integration for automated form submission emails
- **Build System**: Vite for fast development and optimized production builds
- **Deployment**: Netlify serverless functions with CORS configuration and environment variable handling

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Schema**: Comprehensive client submission schema supporting complex nested data structures
- **Tables**: 
  - `users` - Basic user authentication
  - `client_submissions` - Main form data with JSON fields for services, projects, and service areas
- **Data Types**: Mix of scalar fields and JSON columns for flexible data storage

### API Structure
- **REST Endpoints**: 
  - `POST /api/client-submissions` - Create new submission and send email notification
  - `GET /api/client-submissions` - Retrieve all submissions
  - `GET /api/client-submissions/:id` - Retrieve specific submission
- **Email Integration**: Automatic email sending on form submission with years of experience data
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request tracking and performance monitoring

### Form Architecture
The form is designed with progressive disclosure, showing additional fields based on user selections:
- **Dynamic Fields**: Conditional rendering based on checkbox/radio selections
- **Repeatable Sections**: Plus-button functionality for adding multiple services, projects, and service areas
- **File Uploads**: Support for single and multiple file uploads with before/after project galleries
- **Validation**: Real-time validation with clear error messaging

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Connection**: Environment variable-based configuration with connection pooling

### UI Components
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for building the interface
- **Lucide React**: Modern icon library for consistent iconography throughout the application
- **Framer Motion**: Animation library for smooth, performant transitions and micro-interactions

### Development Tools
- **TypeScript**: Static type checking across the entire application stack
- **Vite**: Fast build tool with hot module replacement for development
- **ESBuild**: Fast JavaScript bundler for production builds
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for runtime type checking
- **@hookform/resolvers**: Zod integration for React Hook Form validation

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for better debugging
- **@replit/vite-plugin-cartographer**: Development environment integration (development only)

The application follows a monorepo structure with shared TypeScript schemas between client and server, ensuring type safety across the entire stack. The architecture supports easy scaling with the database abstraction layer and modular component design.