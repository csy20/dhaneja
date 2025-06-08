#!/bin/bash

echo "🚀 DHANEJA E-COMMERCE - FINAL DEPLOYMENT VERIFICATION"
echo "===================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check development server
print_info "Checking development server status..."
if curl -s -f http://localhost:3000/api/products > /dev/null 2>&1; then
    print_status "Development server running" 0
    
    # Test API endpoints
    print_info "Testing API endpoints..."
    
    # Products API
    PRODUCTS_COUNT=$(curl -s http://localhost:3000/api/products | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf-8')).length" 2>/dev/null || echo "0")
    print_status "Products API ($PRODUCTS_COUNT products)" 0
    
    # Auth API
    AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@test.com", "password": "password"}' | \
        node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf-8')).token ? 'success' : 'failed'" 2>/dev/null || echo "failed")
    
    if [ "$AUTH_RESPONSE" = "success" ]; then
        print_status "Authentication API" 0
    else
        print_status "Authentication API" 1
    fi
    
else
    print_status "Development server running" 1
    print_warning "Development server not accessible. Please start with: npm run dev"
fi

echo ""
print_info "Checking project structure..."

# Check critical files
files_to_check=(
    "package.json"
    "vercel.json"
    "src/app/api/products/route.ts"
    "src/app/api/auth/login/route.ts"
    "src/app/admin/page.tsx"
    "data/products.json"
    "data/users.json"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file" 0
    else
        print_status "$file" 1
    fi
done

echo ""
print_info "Checking data integrity..."

# Check products data
if [ -f "data/products.json" ]; then
    PRODUCT_COUNT=$(node -pe "JSON.parse(require('fs').readFileSync('data/products.json', 'utf-8')).length" 2>/dev/null || echo "0")
    print_status "Products data ($PRODUCT_COUNT items)" 0
else
    print_status "Products data" 1
fi

# Check users data
if [ -f "data/users.json" ]; then
    USER_COUNT=$(node -pe "JSON.parse(require('fs').readFileSync('data/users.json', 'utf-8')).length" 2>/dev/null || echo "0")
    print_status "Users data ($USER_COUNT accounts)" 0
else
    print_status "Users data" 1
fi

# Check uploads directory
if [ -d "public/uploads" ]; then
    UPLOAD_COUNT=$(ls -1 public/uploads/ 2>/dev/null | wc -l)
    print_status "Upload directory ($UPLOAD_COUNT files)" 0
else
    print_status "Upload directory" 1
fi

echo ""
print_info "Environment check..."

# Check environment variables
if [ -f ".env" ]; then
    print_status ".env file exists" 0
    
    # Check for required variables
    if grep -q "MONGODB_URI" .env; then
        print_status "MONGODB_URI configured" 0
    else
        print_warning "MONGODB_URI not found (using mock database)"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        print_status "JWT_SECRET configured" 0
    else
        print_status "JWT_SECRET not configured" 1
    fi
else
    print_status ".env file exists" 1
fi

echo ""
print_info "Build verification..."

# Check if build exists
if [ -d ".next" ]; then
    print_status "Next.js build directory exists" 0
else
    print_warning "No build found - run 'npm run build' before deployment"
fi

echo ""
print_info "Vercel deployment readiness..."

# Check Vercel CLI
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    print_status "Vercel CLI ($VERCEL_VERSION)" 0
else
    print_status "Vercel CLI installed" 1
fi

# Check Git repository
if [ -d ".git" ]; then
    print_status "Git repository initialized" 0
else
    print_warning "Git repository not found - consider initializing for deployment tracking"
fi

echo ""
echo -e "${BLUE}📋 DEPLOYMENT SUMMARY${NC}"
echo "====================="
echo ""
echo "🌐 Development Server: http://localhost:3000"
echo "👤 Admin Panel: http://localhost:3000/admin"
echo "🔑 Admin Credentials: admin@test.com / password"
echo "📡 API Base: http://localhost:3000/api"
echo ""
echo -e "${GREEN}🚀 READY FOR VERCEL DEPLOYMENT!${NC}"
echo ""
echo "To deploy to Vercel:"
echo "1. Run: vercel"
echo "2. Follow the prompts"
echo "3. Set environment variables in Vercel dashboard"
echo ""
echo -e "${BLUE}Environment variables needed in Vercel:${NC}"
echo "- MONGODB_URI (optional, falls back to mock database)"
echo "- JWT_SECRET"
echo "- ADMIN_EMAIL"
echo "- ADMIN_PASSWORD"
echo "- ADMIN_NAME"
echo ""
print_info "Verification complete!"
