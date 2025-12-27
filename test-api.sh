#!/bin/bash

# Test script for Notification Service API
# Make sure the server is running on port 3000 (or update BASE_URL)

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Testing Notification Service API"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -X GET "${BASE_URL}/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X GET "${BASE_URL}/health" -w "\nStatus: %{http_code}\n"
echo ""

# Test 2: Register Device Token
echo "2. Testing Register Device Token..."
curl -X POST "${BASE_URL}/register-device" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "device_token": "test_device_token_abc123",
    "platform": "android"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "${BASE_URL}/register-device" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123", "device_token": "test_device_token_abc123", "platform": "android"}' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 3: Register Another Device (same user, different token)
echo "3. Testing Register Second Device..."
curl -X POST "${BASE_URL}/register-device" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "device_token": "test_device_token_xyz789",
    "platform": "ios"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "${BASE_URL}/register-device" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123", "device_token": "test_device_token_xyz789", "platform": "ios"}' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 4: Register Device for Another User
echo "4. Testing Register Device for Another User..."
curl -X POST "${BASE_URL}/register-device" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_456",
    "device_token": "test_device_token_def456",
    "platform": "android"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "${BASE_URL}/register-device" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_456", "device_token": "test_device_token_def456", "platform": "android"}' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 5: Send Hot Deal Notification
echo "5. Testing Hot Deal Notification..."
curl -X POST "${BASE_URL}/notify/hot-deal" \
  -H "Content-Type: application/json" \
  -d '{
    "deal": {
      "id": "deal_001",
      "title": "50% Off Fresh Produce",
      "description": "Amazing deals on fresh fruits and vegetables today!",
      "vendor_id": "vendor_123",
      "discount": "50",
      "expires_at": "2024-12-31T23:59:59Z"
    }
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "${BASE_URL}/notify/hot-deal" \
  -H "Content-Type: application/json" \
  -d '{"deal": {"id": "deal_001", "title": "50% Off Fresh Produce", "description": "Amazing deals!"}}' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 6: Send Order Confirmation Notification
echo "6. Testing Order Confirmation Notification..."
curl -X POST "${BASE_URL}/notify/order-confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "order": {
      "id": "order_789",
      "status": "confirmed"
    }
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "${BASE_URL}/notify/order-confirm" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123", "order": {"id": "order_789", "status": "confirmed"}}' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 7: Test Validation Error (missing required field)
echo "7. Testing Validation Error (should fail)..."
curl -X POST "${BASE_URL}/notify/hot-deal" \
  -H "Content-Type: application/json" \
  -d '{
    "deal": {
      "id": "deal_002"
    }
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "${BASE_URL}/notify/hot-deal" \
  -H "Content-Type: application/json" \
  -d '{"deal": {"id": "deal_002"}}' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 8: Unregister Device
echo "8. Testing Unregister Device..."
curl -X DELETE "${BASE_URL}/unregister-device" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "device_token": "test_device_token_abc123"
  }' \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X DELETE "${BASE_URL}/unregister-device" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123", "device_token": "test_device_token_abc123"}' \
  -w "\nStatus: %{http_code}\n"
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="

