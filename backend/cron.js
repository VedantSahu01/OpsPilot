import 'dotenv/config';
import { exec } from 'child_process';
import http from 'http';
import https from 'https';

// 14 minutes interval in milliseconds
const INTERVAL_MS = 14 * 60 * 1000;

// Configurations fetched from environment variables
const DEPLOY_COMMAND = process.env.DEPLOY_COMMAND;
const DEPLOY_WEBHOOK_URL = process.env.DEPLOY_WEBHOOK_URL;

/**
 * Triggers the deployment sequence
 */
function triggerDeployment() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Initiating deployment run...`);

  let triggered = false;

  // 1. Webhook trigger
  if (DEPLOY_WEBHOOK_URL) {
    triggered = true;
    console.log(`[${timestamp}] Sending GET request to webhook: ${DEPLOY_WEBHOOK_URL}`);
    const clientLib = DEPLOY_WEBHOOK_URL.startsWith('https') ? https : http;
    
    clientLib.get(DEPLOY_WEBHOOK_URL, (res) => {
      console.log(`[${timestamp}] Webhook responded with status code: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`[${timestamp}] Webhook execution failed:`, err.message);
    });
  }

  // 2. Local shell command trigger (e.g., deploy scripts, docker rebuilds)
  if (DEPLOY_COMMAND) {
    triggered = true;
    console.log(`[${timestamp}] Executing deployment command: "${DEPLOY_COMMAND}"`);
    exec(DEPLOY_COMMAND, (error, stdout, stderr) => {
      if (error) {
        console.error(`[${timestamp}] Command execution failed:`, error.message);
        return;
      }
      if (stderr) {
        console.warn(`[${timestamp}] Stderr outputs:\n`, stderr);
      }
      if (stdout) {
        console.log(`[${timestamp}] Stdout outputs:\n`, stdout);
      }
      console.log(`[${timestamp}] Deployment command execution complete.`);
    });
  }

  if (!triggered) {
    console.warn(`[${timestamp}] No deployment method configured. Please set DEPLOY_COMMAND or DEPLOY_WEBHOOK_URL in your environment.`);
  }
}

// Execute immediately on startup
triggerDeployment();

// Schedule to repeat every 14 minutes
setInterval(triggerDeployment, INTERVAL_MS);

console.log(`[${new Date().toISOString()}] Cron scheduler initialized. Running deployment check every 14 minutes.`);
