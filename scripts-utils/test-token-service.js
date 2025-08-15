// Test script for iFood token service
const axios = require('axios');

async function testTokenService() {
    console.log('🧪 Testing iFood Token Service...\n');

    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    try {
        const health = await axios.get('http://localhost:9001/health');
        console.log('✅ Health Check:', health.data);
    } catch (error) {
        console.error('❌ Health Check failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Token Generation (with test credentials)
    console.log('2️⃣ Testing Token Generation...');
    console.log('⚠️  Note: This test requires valid iFood credentials');
    
    const testCredentials = {
        clientId: 'TEST_CLIENT_ID',    // Replace with actual client ID
        clientSecret: 'TEST_CLIENT_SECRET', // Replace with actual client secret
        userId: 'test-user-123'
    };

    console.log('\n📝 To test token generation, you need to:');
    console.log('1. Replace TEST_CLIENT_ID with your actual iFood client ID');
    console.log('2. Replace TEST_CLIENT_SECRET with your actual iFood client secret');
    console.log('3. Run this script again\n');

    // Uncomment the following block when you have real credentials
    /*
    try {
        const response = await axios.post('http://localhost:9001/api/token', testCredentials);
        console.log('✅ Token Generation Response:', response.data);
    } catch (error) {
        console.error('❌ Token Generation failed:', error.response?.data || error.message);
    }
    */

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Check Token Status (requires client ID)
    console.log('3️⃣ Testing Token Status Check...');
    console.log('⚠️  This also requires a valid client ID\n');

    /*
    try {
        const status = await axios.get(`http://localhost:9001/api/token/status/${testCredentials.clientId}`);
        console.log('✅ Token Status:', status.data);
    } catch (error) {
        console.error('❌ Token Status Check failed:', error.response?.data || error.message);
    }
    */

    console.log('🏁 Test completed!\n');
    console.log('📌 Service endpoints available:');
    console.log('   GET  http://localhost:9001/health - Health check');
    console.log('   POST http://localhost:9001/api/token - Generate token');
    console.log('   GET  http://localhost:9001/api/token/status/:clientId - Check token status');
}

// Run the test
testTokenService().catch(console.error);