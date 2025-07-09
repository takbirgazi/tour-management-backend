# Tour Management System

This project is a simple Tour Management System Backend designed to help users manage tours, users, and bookings efficiently.

## Features

- Add, update, delete, and view tours
- User registration and authentication
- Book tours and manage bookings

## Technology Stack

- **Node.js** for server-side JavaScript runtime
- **Express.js** as the web application framework
- **Mongoose** for MongoDB object modeling

## API Endpoints and Routes

The following API endpoints are available for interacting with the Tour Management System:

Base URL: [https://tour-management-backend.vercel.app](https://tour-management-backend.vercel.app)

- `GET /api/tours` - Get all tours
- `POST /api/tours` - Create a new tour
- `GET /api/tours/:id` - Get a specific tour
- `PUT /api/tours/:id` - Update a tour
- `DELETE /api/tours/:id` - Delete a tour
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a new booking

## Getting Started

1. Clone the repository:
    ```bash
    git clone https://github.com/takbirgazi/tour-management-backend
    ```
2. Navigate to the project directory:
    ```bash
    cd tour-management-backend
    ```

3. Install the required dependencies:
    ```bash
    npm install
    ```

4. Set up the database credentials in a `.env` file

5. Run the application:
    ```bash
    npm run dev
    ```

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.