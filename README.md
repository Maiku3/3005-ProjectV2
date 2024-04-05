# Health and Fitness Club Management System

This repository contains the source code for the Health and Fitness Club Management System, designed to be a comprehensive platform for managing the diverse needs of club members, trainers, and administrative staff.

## Features

### Member Functions
- **User Registration**: Allows new members to register and create their accounts.
- **Profile Management**: Members can update personal information, set and track fitness goals, and input health metrics.
- **Dashboard Display**: A personalized space for members to view their exercise routines, fitness achievements, and health statistics.
- **Schedule Management**: Members can schedule, reschedule, or cancel personal training sessions and group fitness classes, ensuring the selected trainer's availability.

### Trainer Functions
- **Schedule Management**: Trainers can define their availability and manage their schedules.
- **Member Profile Viewing**: Trainers can access and view member profiles by searching for a member’s name.

### Administrative Staff Functions
- **Room Booking Management**: Oversee and schedule room bookings for various activities.
- **Equipment Maintenance Monitoring**: Keep track of the fitness equipment maintenance schedule.
- **Class Schedule Updating**: Update and manage group fitness class schedules.
- **Billing and Payment Processing**: Handle billing and process payments for services provided, assuming integration with a payment service.

## Installation and Setup

To get the Health and Fitness Club Management System running on your local machine, follow these steps:

### Prerequisites

You must have Node.js and npm installed on your system. If you do not have them, install them from the [Node.js official website](https://nodejs.org/en/download/).

### Installing

Clone the repository, install both backend & fronted dependencies:
```
git clone https://github.com/Maiku3/3005-ProjectV2.git
cd health-fitness-club-app
cd backend
npm install
cd ..
npm install
```

### Build the Frontend

Build the React application on your local machine:
```
npm run build
```

### Boot the server

Start the backend server from the /backend directory:
```
cd backend
node index.js
```

By default, the server will run on http://localhost:3001 and will serve both the API endpoints and the frontend application.

## SQL

The SQL directory in the repository contains the database schema (backend/SQL/ddl.sql) and initial data (backend/SQL/dml.sql). Import these files into your database system to create the necessary database structure and to populate it with sample data.