import Redis from 'ioredis';

const redis = new Redis(
  'rediss://default:AY6aAAIncDE5ZjM5ZmQ2NmE2ZGI0YzkwYjlkNmIyMjBhODk3ODY1OXAxMzY1MDY@up-grackle-36506.upstash.io:6379'
);
// await client.set('foo', 'bar');
// const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   password: process.env.REDIS_PASSWORD,
//   tls: {},
// });

export default redis;
