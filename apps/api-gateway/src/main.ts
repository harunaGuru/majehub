import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import morgan from 'morgan';
import proxy from 'express-http-proxy';
import initializeSiteConfig from './lib/initializeSiteConfig';
const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      // 'http://127.0.0.1:3000',
      // 'http://127.0.0.1:3001',
      'http://localhost:3001',
      // 'http://localhost:6001',
      // 'http://localhost:8080',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['set-cookie', 'Set-Cookie'], // Add this!
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.set('trust proxy', 1); // Trust first proxy

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100000), // 100/1000 requests per IP based on authentication
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    return ipKeyGenerator(req);
  },
});
app.use(apiLimiter);

app.get('/api-gateway', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use(
  '/auth',
  proxy('http://127.0.0.1:6001', {
    proxyReqPathResolver: (req) => req.originalUrl.replace('/auth', ''),

    userResHeaderDecorator: (headers, userReq, userRes) => {
      console.log('Auth service response headers:', headers);
      // Forward ALL headers from the auth service
      Object.keys(headers).forEach((key) => {
        if (headers[key] !== undefined && headers[key] !== null) {
          // Convert to array if needed for set-cookie
          if (key.toLowerCase() === 'set-cookie') {
            const cookies = Array.isArray(headers[key])
              ? headers[key]
              : [headers[key]];
            userRes.setHeader('set-cookie', cookies.filter(Boolean));
            console.log('Cookies set on gateway response:', cookies);
          } else {
            userRes.setHeader(key, headers[key] as string | string[]);
          }
        }
      });
      return headers;
    },

    // Also forward the host header if needed
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Forward the host
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-forwarded-host'] = srcReq.headers.host;

      // Forward cookies from client to backend
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers.cookie = srcReq.headers.cookie;
      }

      return proxyReqOpts;
    },

    preserveHostHdr: true,
  }
  )
);

app.use(
  '/product',
  proxy('http://127.0.0.1:6002', {
    proxyReqPathResolver: (req) => req.originalUrl.replace('/product', ''),

    userResHeaderDecorator: (headers, userReq, userRes) => {
      console.log('Product service response headers:', headers);
      // Forward ALL headers from the auth service
      Object.keys(headers).forEach((key) => {
        if (headers[key] !== undefined && headers[key] !== null) {
          // Convert to array if needed for set-cookie
          if (key.toLowerCase() === 'set-cookie') {
            const cookies = Array.isArray(headers[key])
              ? headers[key]
              : [headers[key]];
            userRes.setHeader('set-cookie', cookies.filter(Boolean));
            console.log('Cookies set on gateway response:', cookies);
          } else {
            userRes.setHeader(key, headers[key] as string | string[]);
          }
        }
      });
      return headers;
    },

    // Also forward the host header if needed
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Forward the host
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-forwarded-host'] = srcReq.headers.host;

      // Forward cookies from client to backend
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers.cookie = srcReq.headers.cookie;
      }

      return proxyReqOpts;
    },

    preserveHostHdr: true,
  })
);

//  add middleware to log outgoing headers
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('Gateway setting cookie header:', name, value);
    }
    return originalSetHeader.call(this, name, value);
  };
  next();
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig()
  }catch (error){
    console.error(error);
  }
});
server.on('error', console.error);
