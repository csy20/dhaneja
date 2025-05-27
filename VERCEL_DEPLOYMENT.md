# Deploying Dhaneja E-commerce Website to Vercel

This document provides detailed instructions for deploying the Dhaneja e-commerce website to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Git](https://git-scm.com/) installed on your system
3. [Node.js](https://nodejs.org/) (v18 or newer) and npm installed
4. A MongoDB database (Atlas recommended)

## Step 1: Prepare Your Project

1. Make sure all your code changes are committed
2. Ensure your `.env.local` file is properly set up but not committed to Git
3. Verify that your project builds successfully locally with `npm run build`

## Step 2: Deploy with Vercel CLI (Recommended)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

Follow the prompts to login with your Vercel account.

### Deploy the Project

Navigate to your project directory and run:

```bash
vercel
```

You'll be asked a series of questions:
- Set up and deploy: **Yes**
- Which scope: Select your account or team
- Link to existing project: **No**
- Project name: **dhaneja** (or your preferred name)
- Root directory: **./**
- Build command: **npm run build**
- Output directory: **.next**
- Development command: **npm run dev**
- Override settings: **No**

### Set Environment Variables

After deploying, you need to set environment variables. Either:

1. Set them during the deployment process when prompted, or
2. Add them later in the Vercel dashboard under "Project Settings" > "Environment Variables".

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token generation
- `ADMIN_EMAIL`: Admin user email
- `ADMIN_PASSWORD`: Admin user password
- `ADMIN_NAME`: Admin user name

## Step 3: Deploy via Vercel Dashboard

Alternatively, you can deploy directly from the Vercel dashboard:

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: **Next.js**
   - Root Directory: **./**
   - Build Command: **npm run build**
   - Output Directory: **.next**
6. Add Environment Variables (same as above)
7. Click "Deploy"

## Step 4: Verify Your Deployment

1. Wait for the build to complete
2. Visit your deployed site at the URL provided by Vercel
3. Test all functionality, including:
   - Customer login/registration
   - Admin login and dashboard
   - Product browsing and cart functionality
   - Image uploads
   - Order processing

## Step 5: Set Up Custom Domain (Optional)

1. In the Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your domain and follow the instructions to configure DNS

## Troubleshooting

### Build Failures

If your build fails, check the error logs in the Vercel dashboard. Common issues include:

- Unresolved dependencies
- ESLint/TypeScript errors
- Missing environment variables

### Database Connection Issues

If the app can't connect to MongoDB:
- Verify your connection string is correct
- Ensure your IP whitelist in MongoDB Atlas includes 0.0.0.0/0 for Vercel deployments
- Check that the user credentials have the correct permissions

### Image Upload Problems

For image upload functionality to work properly:
- Ensure that the `/public/uploads` directory is writable
- Consider switching to cloud-based storage like AWS S3 or Cloudinary for production

## Maintenance

### Updating Your Deployment

After making changes to your code:

1. Commit your changes
2. Push to your repository
3. If using GitHub integration, Vercel will automatically redeploy
4. If using CLI, run `vercel --prod` to deploy to production

### Monitoring

Use Vercel's built-in analytics and logs to monitor your application's performance and troubleshoot issues.
