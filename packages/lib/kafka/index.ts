import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from "path";
import 'dotenv/config';

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

// console.log("working directory", process.cwd());
// const certsPath = path.join(process.cwd(), '../../avienCertificate');
const certsPath = getCertsPath();
console.log('Loading certificates from:', certsPath);
// console.log(certsPath)
export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers: ['kafka-2ff967a-majehub.d.aivencloud.com:14180'],
  ssl: {
    rejectUnauthorized: true,
    ca: [fs.readFileSync(path.join(certsPath, 'ca.pem'), 'utf8')],
    cert: [fs.readFileSync(path.join(certsPath, 'service.cert'), 'utf8')],
    key: [fs.readFileSync(path.join(certsPath, 'service.key'), 'utf8')],
    // connectionTimeout: 10000, // Increase if connection is slow
    // authenticationTimeout: 10000,
  },
});