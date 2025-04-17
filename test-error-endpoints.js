import fetch from 'node-fetch';

// Function to test the endpoints with both existing and non-existing users
async function testEndpoints() {
  const baseUrl = 'http://localhost:3001';
  const existingUser = 'Tamer';          // User that was having issues
  const nonExistentUser = 'NonExistentUser123';  // User that doesn't exist
  
  console.log('\n=== Testing User Achievement Endpoints ===');
  
  // Test with existing user
  try {
    console.log(`Testing GET ${baseUrl}/api/users/${existingUser}/achievements`);
    const existingUserAchievementsResp = await fetch(`${baseUrl}/api/users/${existingUser}/achievements`);
    console.log(`GET /api/users/${existingUser}/achievements Status:`, existingUserAchievementsResp.status);
    console.log('Response:', await existingUserAchievementsResp.json());
  } catch (error) {
    console.error('Achievement endpoint error for existing user:', error.message);
  }
  
  // Test with non-existent user
  try {
    console.log(`\nTesting GET ${baseUrl}/api/users/${nonExistentUser}/achievements`);
    const nonExistentUserAchievementsResp = await fetch(`${baseUrl}/api/users/${nonExistentUser}/achievements`);
    console.log(`GET /api/users/${nonExistentUser}/achievements Status:`, nonExistentUserAchievementsResp.status);
    console.log('Response:', await nonExistentUserAchievementsResp.json());
  } catch (error) {
    console.error('Achievement endpoint error for non-existent user:', error.message);
  }
  
  console.log('\n=== Testing User Stats Endpoints ===');
  
  // Test with existing user
  try {
    console.log(`Testing GET ${baseUrl}/api/users/${existingUser}/stats`);
    const existingUserStatsResp = await fetch(`${baseUrl}/api/users/${existingUser}/stats`);
    console.log(`GET /api/users/${existingUser}/stats Status:`, existingUserStatsResp.status);
    console.log('Response:', await existingUserStatsResp.json());
  } catch (error) {
    console.error('Stats endpoint error for existing user:', error.message);
  }
  
  // Test with non-existent user
  try {
    console.log(`\nTesting GET ${baseUrl}/api/users/${nonExistentUser}/stats`);
    const nonExistentUserStatsResp = await fetch(`${baseUrl}/api/users/${nonExistentUser}/stats`);
    console.log(`GET /api/users/${nonExistentUser}/stats Status:`, nonExistentUserStatsResp.status);
    console.log('Response:', await nonExistentUserStatsResp.json());
  } catch (error) {
    console.error('Stats endpoint error for non-existent user:', error.message);
  }
}

testEndpoints();
