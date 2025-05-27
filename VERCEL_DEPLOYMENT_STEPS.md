# Vercel Deployment Steps for Dhaneja E-commerce

This guide walks you through deploying the Dhaneja e-commerce platform to Vercel step by step.

## Step 1: Prerequisites

Ensure you have the following before beginning:

- A [Vercel](https://vercel.com) account
- [Git](https://git-scm.com/downloads) installed
- [Node.js](https://nodejs.org/) installed

## Step 2: Local Preparation

1. Make sure your code is free of errors:
   ```bash
   npm run lint
   npm run build
   ```

2. Initialize Git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   ```

3. Create a new GitHub repository (optional but recommended):
   - Go to [GitHub](https://github.com/new)
   - Create a new repository
   - Push your code to GitHub:
     ```bash
     git remote add origin https://github.com/yourusername/dhaneja.git
     git branch -M main
     git push -u origin main
     ```

## Step 3: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 4: Log in to Vercel

```bash
vercel login
```

## Step 5: Deploy to Vercel

### Option 1: Using the Deployment Script

```bash
./deploy-to-vercel.sh
```

### Option 2: Manual Deployment

```bash
vercel
```

Follow the interactive prompts:
- Set up and deploy "~/Documents/devansh/dhaneja"? **Yes**
- Link to an existing project? **No**
- Project name: **dhaneja**
- In which directory is your code located? **./** (press Enter)
- Want to override the settings? **No**

## Step 6: Configure Environment Variables

After the initial deployment, you need to set up environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" → "Environment Variables"
3. Add the following variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `ADMIN_EMAIL`: Admin user email
   - `ADMIN_PASSWORD`: Admin user password
   - `ADMIN_NAME`: Admin user name
4. Click "Save" to apply the changes

## Step 7: Set Up a Custom Domain (Optional)

1. In the Vercel dashboard, go to your project
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Follow the instructions to configure your DNS

## Step 8: Deploy Production Build

If you made changes to environment variables:

```bash
vercel --prod
```

## Step 9: Verify Deployment

1. Visit your deployed site at `https://dhaneja-[username].vercel.app`
2. Test all functionality:
   - User authentication (login/register)
   - Admin dashboard
   - Product browsing and search
   - Shopping cart and checkout
   - Image uploads

## Troubleshooting Common Issues

### Issue: Build fails with module not found errors
- Solution: Check your package.json for missing dependencies
- Run `npm install` locally to update your package-lock.json

### Issue: Environment variable errors
- Solution: Ensure all required environment variables are set in Vercel
- Check for typos in variable names

### Issue: API endpoints returning 404/500 errors
- Solution: Check API routes implementation
- Verify MongoDB connection is working
- Check Vercel Functions logs for detailed errors

### Issue: Images not displaying
- Solution: Ensure your image paths are correct
- Consider using Cloudinary or similar service for production image hosting

## Updating Your Deployment

When you make changes to your code:

1. Commit your changes locally
2. Push to GitHub (if using GitHub integration)
3. Vercel will automatically deploy the changes
4. Or manually deploy with: `vercel --prod`
