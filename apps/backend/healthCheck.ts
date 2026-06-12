const BACKEND_URL = process.env.REPLIT_DEPLOYMENT_URL || process.env.SOCIAL_REDIRECT_BASE_URL || 'https://bongseonjang.replit.app';

async function pingServer(): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    console.log(`[HealthCheck] ${new Date().toISOString()} - Server status: ${data.status}`);
  } catch (error) {
    console.error(`[HealthCheck] ${new Date().toISOString()} - Failed to ping server:`, error);
  }
}

pingServer();
