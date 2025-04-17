// Simple test script to verify the user achievements and stats endpoints
// Using ESM format for node-fetch v3
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const studentName = 'Tamer'; // The user that was having 404 errors

async function testEndpoints() {
  console.log('Testing user achievements and stats endpoints...');
  
  try {
    // Test achievements endpoint
    console.log(`Testing GET ${BASE_URL}/api/users/${studentName}/achievements`);
    const achievementsResponse = await fetch(`${BASE_URL}/api/users/${studentName}/achievements`);
    const achievementsStatus = achievementsResponse.status;
    const achievements = await achievementsResponse.json();
    
    console.log(`Status: ${achievementsStatus}`);
    console.log('Response:', JSON.stringify(achievements, null, 2));
    
    if (achievementsStatus === 200) {
      console.log('✅ Achievements endpoint is working!');
    } else {
      console.log('❌ Achievements endpoint still has an error!');
    }
    
    // Test stats endpoint
    console.log(`\nTesting GET ${BASE_URL}/api/users/${studentName}/stats`);
    const statsResponse = await fetch(`${BASE_URL}/api/users/${studentName}/stats`);
    const statsStatus = statsResponse.status;
    const stats = await statsResponse.json();
    
    console.log(`Status: ${statsStatus}`);
    console.log('Response:', JSON.stringify(stats, null, 2));
    
    if (statsStatus === 200) {
      console.log('✅ Stats endpoint is working!');
    } else {
      console.log('❌ Stats endpoint still has an error!');
    }
    
    // Summary
    if (achievementsStatus === 200 && statsStatus === 200) {
      console.log('\n✅ SUCCESS: Both endpoints are working correctly!');
    } else {
      console.log('\n❌ ERROR: One or both endpoints are still having issues.');
    }
  } catch (error) {
    console.error('Error occurred during testing:', error.message);
  }
}

// Run the tests
testEndpoints();