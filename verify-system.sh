#!/bin/bash

echo "🔧 System Verification Script"
echo "============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in the right directory. Please run from the project root."
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📦 Project: $(cat package.json | grep '"name"' | cut -d'"' -f4)"
echo ""

# Check Node.js and npm
echo "🔍 Environment Check:"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Check for .env file
if [ -f ".env" ]; then
    echo "✅ Environment file found"
else
    echo "⚠️  No .env file found"
fi

# Check data files
echo ""
echo "💾 Database Files:"
if [ -f "data/products.json" ]; then
    PRODUCT_COUNT=$(cat data/products.json | jq length 2>/dev/null || echo "unknown")
    echo "   Products: $PRODUCT_COUNT items"
else
    echo "   ❌ No products.json file"
fi

if [ -f "data/users.json" ]; then
    USER_COUNT=$(cat data/users.json | jq length 2>/dev/null || echo "unknown")
    echo "   Users: $USER_COUNT accounts"
else
    echo "   ❌ No users.json file"
fi

# Check upload directory
echo ""
echo "📸 Upload Directory:"
if [ -d "public/uploads" ]; then
    UPLOAD_COUNT=$(ls -1 public/uploads/ 2>/dev/null | wc -l)
    echo "   Uploaded files: $UPLOAD_COUNT"
    echo "   Files: $(ls public/uploads/ 2>/dev/null | head -3 | tr '\n' ' ')..."
else
    echo "   ❌ No uploads directory"
fi

# Test build
echo ""
echo "🏗️  Testing Build:"
if npm run build > build.log 2>&1; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed"
    echo "   Last few lines of build log:"
    tail -5 build.log | sed 's/^/     /'
fi

echo ""
echo "🚀 Testing Production Server:"

# Kill any existing processes
pkill -f "next start" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Start production server
npm start > server.log 2>&1 &
SERVER_PID=$!
echo "   Started server (PID: $SERVER_PID)"

# Wait for server to start
echo "   Waiting for server..."
for i in {1..15}; do
    sleep 1
    if curl -s -f http://localhost:3000/api/products > /dev/null 2>&1; then
        echo "   ✅ Server responding on port 3000"
        break
    elif [ $i -eq 15 ]; then
        echo "   ⚠️  Server taking longer than expected to start"
    fi
done

# Test API endpoints
echo ""
echo "🧪 API Testing:"

# Test Products API
if PRODUCTS=$(curl -s http://localhost:3000/api/products 2>/dev/null); then
    PRODUCT_COUNT=$(echo "$PRODUCTS" | jq length 2>/dev/null || echo "0")
    echo "   📦 Products API: ✅ ($PRODUCT_COUNT products)"
else
    echo "   📦 Products API: ❌"
fi

# Test Authentication
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@test.com", "password": "password"}' 2>/dev/null)

if echo "$AUTH_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
    echo "   🔐 Authentication: ✅"
    TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token')
    
    # Test authenticated endpoint
    if curl -s -f -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/products > /dev/null 2>&1; then
        echo "   🔒 Protected routes: ✅"
    else
        echo "   🔒 Protected routes: ⚠️"
    fi
else
    echo "   🔐 Authentication: ❌"
fi

# Test file upload endpoint
if curl -s -f http://localhost:3000/api/upload > /dev/null 2>&1; then
    echo "   📤 Upload endpoint: ✅"
else
    echo "   📤 Upload endpoint: ❌"
fi

echo ""
echo "🌐 Frontend Testing:"

# Test main page
if curl -s -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "   🏠 Homepage: ✅"
else
    echo "   🏠 Homepage: ❌"
fi

# Test admin page
if curl -s -f http://localhost:3000/admin > /dev/null 2>&1; then
    echo "   👨‍💼 Admin panel: ✅"
else
    echo "   👨‍💼 Admin panel: ❌"
fi

echo ""
echo "📊 Final Status:"
echo "   Server URL: http://localhost:3000"
echo "   Admin Panel: http://localhost:3000/admin"
echo "   Server PID: $SERVER_PID"

echo ""
echo "📝 Server Log (last 10 lines):"
tail -10 server.log | sed 's/^/   /'

echo ""
echo "✅ Verification complete!"
echo "   To stop the server: kill $SERVER_PID"
echo "   Server log: tail -f server.log"
