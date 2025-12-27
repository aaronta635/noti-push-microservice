// Test script for Notification Service API
// Run with: node test-api.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAPI() {
    console.log('==========================================');
    console.log('Testing Notification Service API');
    console.log('==========================================\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    // Test 2: Register Device Token
    console.log('2. Testing Register Device Token...');
    try {
        const response = await fetch(`${BASE_URL}/register-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'test_user_123',
                device_token: 'test_device_token_abc123',
                platform: 'android'
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    // Test 3: Register Another Device
    console.log('3. Testing Register Second Device...');
    try {
        const response = await fetch(`${BASE_URL}/register-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'test_user_123',
                device_token: 'test_device_token_xyz789',
                platform: 'ios'
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    // Test 4: Register Device for Another User
    console.log('4. Testing Register Device for Another User...');
    try {
        const response = await fetch(`${BASE_URL}/register-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'test_user_456',
                device_token: 'test_device_token_def456',
                platform: 'android'
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    // Test 5: Send Hot Deal Notification
    console.log('5. Testing Hot Deal Notification...');
    try {
        const response = await fetch(`${BASE_URL}/notify/hot-deal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deal: {
                    id: 'deal_001',
                    title: '50% Off Fresh Produce',
                    description: 'Amazing deals on fresh fruits and vegetables today!',
                    vendor_id: 'vendor_123',
                    discount: '50',
                    expires_at: '2024-12-31T23:59:59Z'
                }
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    // Test 6: Send Order Confirmation Notification
    console.log('6. Testing Order Confirmation Notification...');
    try {
        const response = await fetch(`${BASE_URL}/notify/order-confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'test_user_123',
                order: {
                    id: 'order_789',
                    status: 'confirmed'
                }
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    // Test 7: Test Validation Error
    console.log('7. Testing Validation Error (should fail)...');
    try {
        const response = await fetch(`${BASE_URL}/notify/hot-deal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deal: {
                    id: 'deal_002'
                    // Missing required 'title' field
                }
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    // Test 8: Unregister Device
    console.log('8. Testing Unregister Device...');
    try {
        const response = await fetch(`${BASE_URL}/unregister-device`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'test_user_123',
                device_token: 'test_device_token_abc123'
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('Status:', response.status, '\n');
    } catch (error) {
        console.error('Error:', error.message, '\n');
    }

    console.log('==========================================');
    console.log('Testing Complete!');
    console.log('==========================================');
}

testAPI();

