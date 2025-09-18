// Simple integration test to verify backend connection
import { healthAPI, authAPI } from './services/api';

export const testBackendConnection = async () => {
  console.log('🧪 Testing backend connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await healthAPI.check();
    console.log('✅ Health check passed:', healthResponse);
    
    // Test admin login
    const loginResponse = await authAPI.login('admin@minniesfarm.com', 'admin123');
    console.log('✅ Admin login test:', loginResponse);
    
    return { success: true, message: 'Backend integration working!' };
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    return { success: false, error: error.message };
  }
};

// Auto-run test when imported
testBackendConnection();

