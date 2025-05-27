# Dhaneja E-commerce Platform

A modern e-commerce platform built with Next.js, React, and MongoDB.

## Features

- User authentication (customer and admin)
- Product catalog with categories
- Admin dashboard with drag and drop functionality
- Shopping cart and checkout process
- Multiple product image support
- Responsive design for all devices

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin_email@example.com
ADMIN_PASSWORD=secure_admin_password
ADMIN_NAME=Admin User Name
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to access the site.

## Deployment on Vercel

### Option 1: Using the Deployment Script

1. Make sure you have installed the Vercel CLI:

```bash
npm install -g vercel
```

2. Run the deployment script:

```bash
./deploy-to-vercel.sh
```

3. Follow the prompts to complete the deployment.

### Option 2: Manual Deployment

1. Push your code to GitHub
2. Log in to [Vercel](https://vercel.com)
3. Create a new project and import your GitHub repository
4. Configure the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret for JWT token generation
   - `ADMIN_EMAIL`: Admin user email
   - `ADMIN_PASSWORD`: Admin user password
   - `ADMIN_NAME`: Admin user name
5. Deploy the project

## Database Setup

The application will use MongoDB for production. For development, a mock database is used if MongoDB connection fails.

### Creating Admin User

```bash
npm run create-admin
```

### Creating Test Users

```bash
npm run create-mock-users
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
