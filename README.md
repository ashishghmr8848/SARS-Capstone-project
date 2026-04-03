# Appointment Booking Website

A full-stack appointment booking system built with modern web technologies, designed to manage appointments across multiple locations and appointment types with advanced features like waitlist management, automated email notifications, and real-time slot availability.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

This is a comprehensive appointment booking platform designed for businesses that need to manage appointments across multiple locations. The system provides a robust solution for scheduling, managing, and tracking appointments with features like:

- **Multi-location Support**: Manage appointments across different physical locations
- **Flexible Appointment Types**: Support various appointment types with configurable durations
- **Intelligent Slot Management**: Dynamic slot generation based on configurable parameters
- **Waitlist System**: Automated waitlist management with position tracking and notifications
- **Email Notifications**: Automated email system using BullMQ for reliable delivery
- **Admin Dashboard**: Comprehensive admin panel for managing all aspects of the system
- **Real-time Availability**: Live slot availability checking with booking conflict prevention

## ✨ Key Features

### For Users

- **Easy Booking Process**: Simple, intuitive booking flow with date/time selection
- **Appointment Management**: View and manage upcoming appointments
- **Cancellation**: Self-service cancellation with confirmation emails
- **Waitlist Registration**: Join waitlists for fully booked time slots
- **Email Confirmations**: Receive confirmation and reminder emails
- **Mobile Responsive**: Fully responsive design for all devices

### For Administrators

- **Dashboard**: Comprehensive overview of bookings, statistics, and system health
- **Booking Management**: View, modify, and cancel bookings
- **Location Management**: Add, edit, and manage multiple locations
- **Appointment Type Management**: Configure different appointment types and durations
- **Slot Configuration**: Flexible slot configuration with:
  - Configurable working hours
  - Available days selection
  - Slot duration and capacity settings
  - Buffer time between appointments
  - Advance booking windows
  - Same-day booking cutoff times
- **Special Dates**: Manage holidays, closures, and modified hours
- **Waitlist Management**: Monitor and notify waitlist registrants
- **Email Queue Monitoring**: Track email delivery status and retry failed emails
- **User Management**: Manage admin users and access control

### System Features

- **Authentication & Authorization**: JWT-based secure authentication with role-based access control
- **Rate Limiting**: Prevent API abuse with configurable rate limits
- **Email Queue System**: Reliable email delivery using BullMQ and Redis
- **Background Workers**: Separate email worker process for scalability
- **Cron Jobs**: Automated tasks for:
  - Booking reminders
  - Waitlist notifications
  - Expired booking cleanup
  - Slot availability updates
- **Database Migrations**: Version-controlled schema changes with Prisma
- **Error Handling**: Comprehensive error handling with detailed logging
- **Security**: Helmet.js for security headers, CORS protection, password hashing
- **Logging**: Winston logger for structured logging
- **Compression**: Response compression for better performance
- **Docker Support**: Containerized deployment with Docker Compose

## 🛠 Tech Stack

### Frontend

- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router v7** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **date-fns** - Date utility library
- **React Day Picker** - Date picker component

### Backend

- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Redis** - In-memory data store for queues
- **BullMQ** - Redis-based queue for email processing
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **PDFKit** - PDF generation
- **Winston** - Logging
- **Zod** - Schema validation
- **node-cron** - Task scheduling
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting
- **Morgan** - HTTP request logger

### DevOps & Tools

- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Git** - Version control
- **ESLint** - Code linting
- **Nodemon** - Auto-restart during development

## 🏗 System Architecture

```
┌─────────────────┐
│   React SPA     │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/REST API
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼─────────┐
│  Express API    │  │    Nginx     │
│   (Backend)     │  │ (Production) │
└────────┬────────┘  └──────────────┘
         │
         ├──────────────┬─────────────┬──────────────┐
         │              │             │              │
┌────────▼────────┐ ┌──▼──────┐ ┌───▼────┐  ┌──────▼──────┐
│   PostgreSQL    │ │  Redis  │ │ BullMQ │  │   Nodemailer │
│   (Database)    │ │ (Cache) │ │ (Queue)│  │   (Email)    │
└─────────────────┘ └─────────┘ └────────┘  └─────────────┘
                                     │
                              ┌──────▼──────┐
                              │Email Worker │
                              │  (Process)  │
                              └─────────────┘
```

### Request Flow

1. **User Request**: Client sends HTTP request to API
2. **Authentication**: JWT token validated by auth middleware
3. **Authorization**: Role-based access control checks
4. **Validation**: Request data validated using Zod schemas
5. **Business Logic**: Controllers process requests and call services
6. **Data Access**: Services interact with Prisma ORM
7. **Database**: PostgreSQL stores and retrieves data
8. **Queue Processing**: Background tasks added to BullMQ
9. **Worker Processing**: Separate worker process handles emails
10. **Response**: JSON response sent back to client

## 🗄 Database Schema

### Core Models

#### User

- Admin users with authentication credentials
- Role-based access control
- Password reset functionality
- Activity tracking

#### AppointmentType

- Different types of appointments (e.g., Consultation, Follow-up)
- Configurable descriptions and status
- Multiple bookings per type

#### Location

- Physical locations for appointments
- Full address details
- Contact information
- Active/inactive status

#### SlotConfiguration

- Flexible slot scheduling parameters:
  - Available days (0-6 for Sunday-Saturday)
  - Working hours (start/end time)
  - Slot duration and capacity
  - Buffer time between appointments
  - Advance booking window
  - Same-day booking rules
- Special date overrides

#### SpecialDate

- Holidays and closures
- Modified working hours
- Location/appointment type specific rules
- Types: HOLIDAY, CLOSURE, MODIFIED_HOURS

#### Booking

- Customer appointments with:
  - Reference number for tracking
  - Guest details (name, email, phone)
  - Date, time, and location
  - Status tracking (PENDING, CONFIRMED, CANCELLED, COMPLETED)
  - Cancellation tracking
  - Notes and metadata

#### Waitlist

- Waitlist registrations with:
  - Position tracking
  - Preferred date ranges
  - Notification history
  - Status tracking (WAITING, NOTIFIED, BOOKED, EXPIRED, CANCELLED)
  - Expiration management

#### EmailNotification

- Email tracking system:
  - Types: Confirmation, Cancellation, Reminder, Waitlist
  - Status tracking (PENDING, SENT, FAILED, BOUNCED)
  - Error logging
  - Retry capability

### Relationships

```
AppointmentType ──┬──< Booking
                  └──< Waitlist

Location ──┬──< Booking
           └──< Waitlist

SlotConfiguration ──< SpecialDate

Booking ──< EmailNotification

Waitlist ──< EmailNotification
```

## 📦 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** (v14 or higher)
- **Redis** (v7 or higher)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Git** for version control

## 🚀 Installation & Setup

### Option 1: Using Docker (Recommended)

1. **Clone the repository**

```bash
git clone <repository-url>
cd appointment-booking-website
```

2. **Create environment files**

```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Configure environment variables**
   Edit `.env` files with your configuration (see [Environment Variables](#environment-variables))

4. **Start the application**

```bash
docker-compose up -d
```

5. **Run database migrations**

```bash
docker-compose exec backend npm run prisma:migrate
```

6. **Seed the database** (optional)

```bash
docker-compose exec backend npm run seed
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Option 2: Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd appointment-booking-website
```

2. **Install PostgreSQL and Redis**
   Ensure PostgreSQL and Redis are running on your machine

3. **Setup Backend**

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate deploy
npx prisma generate

# Seed database (optional)
npm run seed
```

4. **Setup Frontend**

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL
```

5. **Start the services**

Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

Terminal 2 - Email Worker:

```bash
cd backend
npm run worker
```

Terminal 3 - Frontend:

```bash
cd frontend
npm run dev
```

## ⚙️ Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/appointment_booking"

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=your-session-secret

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_APP_ENV=development
```

### Docker Compose (.env)

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=appointment_booking
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=redis123
REDIS_PORT=6379

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3000
```

## 🏃 Running the Application

### Development Mode

**Using Docker:**

```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Local Development:**

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Email Worker
cd backend && npm run worker

# Terminal 3: Frontend
cd frontend && npm run dev
```

### Production Mode

1. **Build the application**

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

2. **Start production services**

```bash
# Backend
cd backend
npm start

# Email Worker
npm run worker:prod
```

3. **Serve frontend**
   Frontend build files in `frontend/dist` should be served by Nginx or another web server

### Database Management

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npm run seed

# Reset database (development only)
npx prisma migrate reset
```

## 📚 API Documentation

### Authentication

#### POST `/api/auth/register`

Register a new admin user

```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "name": "Admin User",
  "phoneNumber": "+1234567890"
}
```

#### POST `/api/auth/login`

Login and receive JWT token

```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/logout`

Logout (requires authentication)

### Bookings

#### GET `/api/bookings/available-slots`

Get available time slots

```
Query params: locationId, appointmentTypeId, date
```

#### POST `/api/bookings`

Create a new booking

```json
{
  "appointmentTypeId": "uuid",
  "locationId": "uuid",
  "appointmentDate": "2026-03-15",
  "appointmentTime": "10:00:00",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "notes": "First visit"
}
```

#### GET `/api/bookings/reference/:reference`

Get booking by reference number

#### PUT `/api/bookings/:id/cancel`

Cancel a booking

### Waitlist

#### POST `/api/waitlist`

Join waitlist

```json
{
  "appointmentTypeId": "uuid",
  "locationId": "uuid",
  "preferredDateStart": "2026-03-15",
  "preferredDateEnd": "2026-03-20",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890"
}
```

#### GET `/api/waitlist/:id`

Get waitlist entry by ID

### Admin Routes (Require Authentication)

#### Locations

- `GET /api/admin/locations` - List all locations
- `POST /api/admin/locations` - Create location
- `PUT /api/admin/locations/:id` - Update location
- `DELETE /api/admin/locations/:id` - Delete location

#### Appointment Types

- `GET /api/admin/appointment-types` - List all types
- `POST /api/admin/appointment-types` - Create type
- `PUT /api/admin/appointment-types/:id` - Update type
- `DELETE /api/admin/appointment-types/:id` - Delete type

#### Bookings Management

- `GET /api/admin/bookings` - List all bookings (with filters)
- `GET /api/admin/bookings/:id` - Get booking details
- `PUT /api/admin/bookings/:id` - Update booking
- `DELETE /api/admin/bookings/:id` - Cancel booking (admin)

#### Slot Configuration

- `GET /api/admin/slots/configuration` - Get slot config
- `POST /api/admin/slots/configuration` - Create config
- `PUT /api/admin/slots/configuration/:id` - Update config

#### Special Dates

- `GET /api/admin/special-dates` - List special dates
- `POST /api/admin/special-dates` - Create special date
- `PUT /api/admin/special-dates/:id` - Update special date
- `DELETE /api/admin/special-dates/:id` - Delete special date

## 📁 Project Structure

```
appointment-booking-website/
│
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── database.ts   # Database connection
│   │   │   ├── email.ts      # Email configuration
│   │   │   ├── jwt.ts        # JWT settings
│   │   │   └── redis.ts      # Redis connection
│   │   │
│   │   ├── controllers/      # Request handlers
│   │   │   ├── admin.controller.ts
│   │   │   ├── appointments.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── bookings.controller.ts
│   │   │   ├── locations.controller.ts
│   │   │   ├── slot.controller.ts
│   │   │   └── waitlist.controller.ts
│   │   │
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.ts       # JWT authentication
│   │   │   ├── errorHandler.ts
│   │   │   ├── roleCheck.ts  # Authorization
│   │   │   └── validation.ts # Request validation
│   │   │
│   │   ├── routes/           # API routes
│   │   │   ├── admin.routes.ts
│   │   │   ├── appointments.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── bookings.routes.ts
│   │   │   ├── locations.routes.ts
│   │   │   ├── slots.routes.ts
│   │   │   └── waitlist.routes.ts
│   │   │
│   │   ├── services/         # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── cron.service.ts    # Scheduled tasks
│   │   │   ├── email.service.ts
│   │   │   ├── slot.service.ts    # Slot generation
│   │   │   └── waitlist.service.ts
│   │   │
│   │   ├── queues/           # Queue definitions
│   │   │   └── emailQueue.ts # BullMQ email queue
│   │   │
│   │   ├── workers/          # Queue workers
│   │   │   └── emailWorker.ts
│   │   │
│   │   ├── utils/            # Utility functions
│   │   │   ├── errors.ts     # Error classes
│   │   │   ├── pdf.ts        # PDF generation
│   │   │   └── validators.ts # Zod schemas
│   │   │
│   │   ├── app.ts            # Express app setup
│   │   └── index.ts          # Server entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Seed script
│   │   └── migrations/       # Migration files
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   │   ├── admin.api.ts
│   │   │   ├── appointments.api.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── bookings.api.ts
│   │   │   ├── locations.api.ts
│   │   │   ├── slots.api.ts
│   │   │   ├── waitlist.api.ts
│   │   │   └── axiosConfig.ts
│   │   │
│   │   ├── components/       # React components
│   │   │   └── common/       # Reusable components
│   │   │
│   │   ├── pages/            # Page components
│   │   │
│   │   ├── store/            # Zustand stores
│   │   │
│   │   ├── types/            # TypeScript types
│   │   │
│   │   ├── lib/              # Utilities
│   │   │
│   │   ├── providers/        # Context providers
│   │   │
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   │
│   ├── public/               # Static assets
│   ├── Dockerfile
│   ├── nginx.conf            # Nginx configuration
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # This file
```

## 💻 Development

### Code Style

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (if configured)
- Follow React/Node.js best practices

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Test cron service
npm run test:cron
```

### Database Operations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# View database
npx prisma studio
```

### Email Queue Management

The application uses BullMQ for reliable email delivery:

1. **Email Queue**: Handles email sending asynchronously
2. **Worker Process**: Separate process for processing emails
3. **Retry Logic**: Automatic retries for failed emails
4. **Monitoring**: Track email status in database

### Cron Jobs

Automated tasks run on schedule:

- **Booking Reminders**: Send reminders 24 hours before appointments
- **Waitlist Notifications**: Notify users when slots become available
- **Cleanup**: Remove expired bookings and waitlist entries
- **Slot Generation**: Pre-generate available slots

## 🚢 Deployment

### Docker Deployment

1. **Configure production environment**

```bash
# Set production environment variables
cp .env.example .env
# Edit .env with production values
```

2. **Build and start services**

```bash
docker-compose -f docker-compose.yml up -d --build
```

3. **Run migrations**

```bash
docker-compose exec backend npx prisma migrate deploy
```

4. **Setup SSL** (recommended)
   Use a reverse proxy like Nginx or Traefik with Let's Encrypt for SSL certificates

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**You are free to:**
- ✅ Use this project for commercial purposes
- ✅ Modify and distribute the code
- ✅ Use it for private projects

**You must:**
- ✅ Include the original license
- ✅ Provide attribution

## �🙏 Acknowledgments

- Built with React, Express, and Prisma
- UI components from Radix UI and Tailwind CSS
- Icons from Lucide React
- Email queue powered by BullMQ


