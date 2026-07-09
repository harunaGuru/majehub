import 'dotenv/config';
import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';

function getCertsPath(): string {
  // Use environment variable
  if (process.env.KAFKA_CERTS_PATH) {
    const envPath = process.env.KAFKA_CERTS_PATH;
    console.log(`Using certificates from env: ${envPath}`);
    return envPath;
  }

  // Fallback to project root + avienCertificate
  const fallbackPath = path.join(process.cwd(), '../../avienCertificate');
  console.log(`Using fallback path: ${fallbackPath}`);
  return fallbackPath;
}

const certsPath = getCertsPath();
console.log('Loading certificates from:', certsPath);
try {
  const content = fs.readFileSync(path.join(certsPath, 'ca.pem'), 'utf8');
  console.log('✅ Certificate found! Length:', content.length);
  console.log('First 100 chars:', content.substring(0, 100));
} catch (err: any) {
  console.error('❌ Error:', err.message);
  // Check if directory exists
  const dir = 'C:/Users/User/sul-ecom/majehub/avienCertificate';
  if (fs.existsSync(dir)) {
    console.log('Directory exists. Contents:', fs.readdirSync(dir));
  } else {
    console.log('Directory does NOT exist!');
  }
}
// console.log(certsPath)
export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers: ['kafka-2ff967a-majehub.d.aivencloud.com:14180'],
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync(path.join(certsPath, 'ca.pem'), 'utf8')],
    cert: [fs.readFileSync(path.join(certsPath, 'service.cert'), 'utf8')],
    key: [fs.readFileSync(path.join(certsPath, 'service.key'), 'utf8')],
  },
  connectionTimeout: 5000,
  authenticationTimeout: 5000,
  retry: {
    initialRetryTime: 100,
    retries: 10,
  },
});
