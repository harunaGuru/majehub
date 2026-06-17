import Redis from 'ioredis';
import 'dotenv/config';

const redis = new Redis(process.env.REDIS_DATABASE_URL!);

export default redis;
