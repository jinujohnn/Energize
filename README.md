# Energize

Energize is a full-stack energy management application that helps users manage projects, monitor assets, record energy readings, and keep track of tasks in one place.

The application is built with a **Laravel REST API** on the backend and a **React + TypeScript** frontend.

---

## Features

### Authentication

* User registration and login
* Email verification
* Forgot password and password reset
* Google OAuth login
* Secure API authentication using Laravel Sanctum
* Automatic handling of expired authentication tokens
* Logout functionality

### Dashboard

The dashboard provides a quick overview of the user's projects, assets, and tasks.

### Project Management

Users can:

* Create projects
* View project details
* Update project information
* Delete projects
* Track project status and location

### Task Management

Tasks can be managed both within individual projects and from the global task dashboard.

Users can:

* Create tasks
* View task details
* Update tasks
* Delete tasks
* Search tasks
* Filter by status and priority

### Asset Management

Assets belong to projects and can be managed independently.

Users can:

* Create assets
* View asset details
* Update asset information
* Delete assets
* Search assets
* Filter by status and type
* Track asset capacity and maintenance information

### Energy Monitoring

The application supports energy monitoring for individual assets.

Users can:

* Record energy readings
* View energy readings
* Update readings
* Delete readings
* Track energy produced
* Track energy consumed
* Track power output
* View energy summaries for a project

### Profile Management

Users can:

* View their profile
* Update their name
* View account information
* Check email verification status
* Log out

### User Interface

* Responsive design
* Desktop sidebar navigation
* Mobile-friendly navigation
* Search and filtering
* Loading states
* Error handling
* Confirmation dialogs for destructive actions
* Route protection for authenticated pages
* Route-based code splitting for better frontend performance

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Laravel 13
* PHP
* Laravel Sanctum
* Laravel Socialite

### Database

* PostgreSQL

### Development Tools

* Composer
* npm
* Git
* Mailpit for local email testing

---

## Project Structure

The project uses a single repository containing both the backend and frontend.

```text
assignment/
│
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   └── ...
│   ├── database/
│   │   ├── migrations/
│   │   └── ...
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── config/
│   ├── .env.example
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## Requirements

Before running the project, make sure you have:

* PHP 8.2+
* Composer
* Node.js and npm
* PostgreSQL
* Git

Mailpit is recommended for testing email functionality locally.

---

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/jinujohnn/Energize.git
cd assignment
```

---

# Backend Setup

Move into the backend directory:

```bash
cd backend
```

Install PHP dependencies:

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

---

## Database Configuration

Create a PostgreSQL database for the application.

The local configuration uses:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=apollo_energy
DB_USERNAME=postgres
DB_PASSWORD=
```

Update the database values in `.env` according to your local PostgreSQL setup.

Then run the migrations:

```bash
php artisan migrate
```

---

## Email Configuration

The project uses **Mailpit** during local development for email testing.

The default development configuration uses:

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
```

Mailpit allows you to test emails such as:

* Email verification
* Password reset emails

without sending real emails.

---

## Google OAuth

Google login requires Google OAuth credentials.

Add the required values to your backend `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

The Google OAuth redirect URL must also be configured in your Google Cloud project.

---

## Start the Backend

From the `backend` directory:

```bash
php artisan serve
```

The API will normally be available at:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# Application Flow

The application follows a simple full-stack architecture:

```text
React + TypeScript
        │
        │ Axios
        ▼
Laravel REST API
        │
        │ Eloquent ORM
        ▼
PostgreSQL
```

Authentication uses:

```text
React
  │
  │ Login
  ▼
Laravel
  │
  │ Sanctum Token
  ▼
React
  │
  │ Bearer Token
  ▼
Protected API Routes
```

---

# Main API Areas

The backend provides API endpoints for:

* Authentication
* Users
* Projects
* Tasks
* Assets
* Energy readings
* Energy summaries
* Dashboard data

Protected resources require an authenticated Sanctum bearer token.

---

# Security

The application includes several security measures:

* Laravel Sanctum API authentication
* Protected backend routes
* Protected frontend routes
* Password hashing
* Email verification
* Password reset functionality
* Google OAuth authentication
* Token expiration
* Request validation
* User-based resource authorization
* Environment variables for sensitive configuration
* `.env` files excluded from Git

Sensitive credentials such as database passwords, Google OAuth secrets, and application keys should never be committed to the repository.

---

# Development Notes

The project is organized so that the frontend and backend can be developed independently while remaining in the same repository.

Frontend pages are loaded using route-based code splitting, which prevents every page from being downloaded as one large JavaScript bundle when the application initially loads.

The backend follows Laravel's standard structure using:

* Controllers
* Form Requests
* Models
* Migrations
* API Routes

---

# Production Deployment

For production deployment, the following configuration should be updated:

* Production database
* `APP_ENV=production`
* `APP_DEBUG=false`
* Production `APP_URL`
* Frontend API URL
* CORS configuration
* Production mail/SMTP provider
* Google OAuth production redirect URL
* HTTPS

The `.env` file should be created separately on the production server and should never be committed to Git.

---

# Project Status

The main application functionality is implemented, including authentication, project management, task management, asset management, energy monitoring, dashboard functionality, and profile management.

The project is structured as a full-stack application and can be extended with additional energy analytics, reporting, notifications, and other features in the future.

---

## Author

**Jinu John**

B.Tech Computer Science and Engineering

---

## License

This project was created as a software development assignment and portfolio project.
