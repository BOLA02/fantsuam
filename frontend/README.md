# Microfinance Loan Management System

A modern, enterprise-grade microfinance loan management system frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The system provides comprehensive functionality for both customers and administrators, featuring a beautiful financial SaaS interface inspired by Stripe, Ramp, and Mercury.

## Features

### Public Website
- **Landing Page**: Hero section with benefits, testimonials, FAQ, and CTA
- **Loan Products Page**: Display all available loan products with detailed specifications
- **Multi-Step Loan Application**: 5-step wizard form for loan applications
  - Step 1: Personal Information
  - Step 2: Loan Details
  - Step 3: Guarantor Information
  - Step 4: Document Upload
  - Step 5: Review & Submit
- **Update Documents Page**: Customers can update or resubmit documents for their applications

### Admin Dashboard

#### Core Dashboard
- Key metrics cards (Pending Applications, Approved Loans, Outstanding Balance, Collections, Revenue, Late Payments)
- Loan status distribution chart
- Monthly collections trend
- Recent applications table

#### Applications Management
- Complete list of all loan applications
- Search and filtering capabilities
- Application detail page with:
  - Customer profile
  - Loan request details
  - Guarantor information
  - Uploaded documents
  - Approval/Rejection actions

#### Customer Management
- Customer directory with search
- Personal and financial information
- Account creation dates
- Export capabilities

#### Loans Management
- Complete loan portfolio view
- Loan status tracking (Active, Completed, Suspended, Defaulted)
- Monthly installment information
- Disbursement dates

#### Repayments Management
- Payment history tracking
- Payment method recording
- Status management (Paid, Pending, Overdue, Partial)
- Record new payment functionality

#### Financial Ledger
- Complete transaction history
- Debit/Credit tracking
- Running balance calculation
- Transaction type classification
- Receipt number tracking
- Summary statistics

#### Loan Products Management
- CRUD interface for loan products
- Interest rate configuration
- Amount range settings
- Duration parameters
- Requirements management

#### SMS Center
- SMS communication logs
- Template-based messaging
- Delivery status tracking
- Statistics (Sent, Pending, Failed)

#### Reports & Analytics
- Comprehensive business metrics
- Loan portfolio analysis
- Collections trends
- Default rate tracking
- Interest and penalty revenue
- Product performance analysis

#### Settings & Configuration
- Organization profile management
- Interest rate configuration by product
- Penalty and repayment rules
- System roles and permissions

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Base UI
- **Icons**: Lucide React
- **Data**: Mock data with Faker.js
- **State**: Client-side with React hooks

## Design System

### Color Palette
- **Primary**: Navy Blue (#0B3D91)
- **Accent**: Teal (#14B8A6)
- **Background**: White (#FFFFFF)
- **Cards**: Light Gray (#F8F9FA)
- **Text**: Dark Navy (#0B3D91)
- **Muted**: Gray (#667085)

### Typography
- **Display Font**: Sora (headings)
- **Body Font**: Inter (content)

### Component Library
- Stat Cards with trend indicators
- Data tables with sorting
- Status badges with color coding
- Form components (Input, Select, Textarea)
- Dialog modals
- Navigation sidebars
- Timeline components
- Empty states
- Skeleton loaders

## Project Structure

```
/app
  /admin              # Admin dashboard pages
    /applications     # Loan applications
    /customers        # Customer management
    /loans            # Loans management
    /repayments       # Repayment tracking
    /ledger           # Financial ledger
    /products         # Loan products
    /sms              # SMS center
    /reports          # Reports & analytics
    /settings         # Settings configuration
  /(public)           # Public website pages
    /apply            # Loan application wizard
    /products         # Loan products display
    /update-documents # Document updates

/components
  /ui                 # shadcn/ui components
  - header.tsx        # Top navigation
  - sidebar.tsx       # Admin navigation
  - stat-card.tsx     # Statistics cards
  - data-table.tsx    # Data table component
  - status-badge.tsx  # Status indicators
  - form.tsx          # Form components
  - timeline.tsx      # Timeline component
  - dialog.tsx        # Modal dialogs
  - badge.tsx         # Badge component
  - empty-state.tsx   # Empty state display
  - skeleton.tsx      # Loading skeleton

/lib
  - mock-data.ts      # Comprehensive mock data
  - utils.ts          # Utility functions
```

## Mock Data

The system includes comprehensive mock data generation:
- **100 Customers**: Complete profiles with financial information
- **30 Loan Applications**: Various statuses and loan types
- **50 Active Loans**: With disbursement and repayment details
- **120 Repayments**: Payment history and status tracking
- **200 Ledger Entries**: Financial transactions with running balance
- **100 SMS Logs**: Communication history

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Access Points

- **Public Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Loan Application**: http://localhost:3000/apply
- **Loan Products**: http://localhost:3000/products
- **Update Documents**: http://localhost:3000/update-documents

## Key Features

### Frontend-Only Implementation
- No backend APIs required
- All data stored in mock objects
- Simulated application workflows
- Instant responses and feedback
- Ready for backend integration

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop-enhanced layouts
- Touch-friendly interfaces

### Professional UX/UI
- Smooth animations and transitions
- Loading states
- Success/error feedback
- Empty state handling
- Accessibility compliance

### Data Management
- Sorting and filtering tables
- Search functionality
- Export capabilities (UI ready)
- Real-time calculations

## Production Readiness

The system is designed as a complete frontend scaffold ready for:
- Backend API integration
- Real database connection
- Authentication implementation
- Payment processing
- Email/SMS integration
- Analytics tracking
- Deployment to Vercel

## Future Enhancements

- User authentication system
- Real backend API integration
- Payment gateway integration
- Advanced reporting and exports
- Mobile app development
- Real-time notifications
- Document management system
- Automated workflows

## License

Built with v0 by Vercel
