#!/bin/bash

echo "🚀 Running comprehensive system tests..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Build the project
echo -e "${YELLOW}Test 1: Building the project...${NC}"
npm run build > /dev/null 2>&1
print_result $? "Project build"

# Test 2: Start development server in background
echo -e "${YELLOW}Test 2: Starting development server...${NC}"
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 5

# Test 3: Check if server is running
echo -e "${YELLOW}Test 3: Checking server health...${NC}"
curl -f http://localhost:3001/ > /dev/null 2>&1
print_result $? "Server health check"

# Test 4: Test API endpoints
echo -e "${YELLOW}Test 4: Testing API endpoints...${NC}"

# Test auth endpoint
curl -f http://localhost:3001/api/auth/check-admin > /dev/null 2>&1
print_result $? "Auth check-admin endpoint"

# Test products endpoint
curl -f http://localhost:3001/api/products > /dev/null 2>&1
print_result $? "Products GET endpoint"

# Test login endpoint
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_result 0 "Admin login endpoint"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    print_result 1 "Admin login endpoint"
fi

# Test 5: Test authenticated endpoints (if token exists)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}Test 5: Testing authenticated endpoints...${NC}"
    
    # Test image upload endpoint
    curl -f -X POST http://localhost:3001/api/upload \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@public/sample1.jpg" > /dev/null 2>&1
    print_result $? "Image upload endpoint"
    
    # Test product creation
    curl -f -X POST http://localhost:3001/api/products \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "name": "Test Product",
            "description": "Test Description",
            "price": 99.99,
            "category": "test",
            "images": ["/uploads/sample1.jpg"],
            "stock": 10
        }' > /dev/null 2>&1
    print_result $? "Product creation endpoint"
else
    echo -e "${YELLOW}Test 5: Skipping authenticated tests (no token)${NC}"
    ((TESTS_FAILED++))
fi

# Test 6: Check static pages
echo -e "${YELLOW}Test 6: Testing static pages...${NC}"

curl -f http://localhost:3001/login > /dev/null 2>&1
print_result $? "Login page"

curl -f http://localhost:3001/register > /dev/null 2>&1
print_result $? "Register page"

curl -f http://localhost:3001/products > /dev/null 2>&1
print_result $? "Products page"

curl -f http://localhost:3001/cart > /dev/null 2>&1
print_result $? "Cart page"

# Test 7: Check admin page (protected)
echo -e "${YELLOW}Test 7: Testing admin page...${NC}"
curl -f http://localhost:3001/admin > /dev/null 2>&1
print_result $? "Admin page accessibility"

# Test 8: Check data persistence
echo -e "${YELLOW}Test 8: Checking data persistence...${NC}"
if [ -f "data/products.json" ] && [ -s "data/products.json" ]; then
    print_result 0 "Products data file exists and not empty"
else
    print_result 1 "Products data file exists and not empty"
fi

if [ -f "data/users.json" ] && [ -s "data/users.json" ]; then
    print_result 0 "Users data file exists and not empty"
else
    print_result 1 "Users data file exists and not empty"
fi

# Test 9: Check uploads directory
echo -e "${YELLOW}Test 9: Checking uploads functionality...${NC}"
if [ -d "public/uploads" ]; then
    UPLOAD_COUNT=$(ls -1 public/uploads | wc -l)
    if [ $UPLOAD_COUNT -gt 0 ]; then
        print_result 0 "Upload directory has files ($UPLOAD_COUNT files)"
    else
        print_result 1 "Upload directory has files"
    fi
else
    print_result 1 "Upload directory exists"
fi

# Cleanup: Stop the server
echo -e "${YELLOW}Cleaning up...${NC}"
kill $SERVER_PID 2>/dev/null

# Summary
echo ""
echo "======================================"
echo "📊 Test Summary:"
echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! System is working perfectly.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the issues above.${NC}"
    exit 1
fi
