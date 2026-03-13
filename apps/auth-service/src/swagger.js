import swaggerAutogen from 'swagger-autogen';

const swaggerDoc = {
  swagger: '2.0',

  info: {
    title: 'Auth API',
    description: 'User registration and verification endpoints',
    version: '1.0.0',
  },

  host: 'localhost:6001',
  basePath: '/api',
  schemes: ['http'],

  tags: [
    {
      name: 'Authentication',
      description: 'Authentication related endpoints',
    },
  ],

  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Creates a new user and sends an OTP for verification',

        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/RegisterUser',
            },
          },
        ],

        responses: {
          201: {
            description: 'User registered successfully',
            schema: {
              example: {
                message: 'User registered',
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          401: {
            description: 'Unauthorized',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          403: {
            description: 'Forbidden',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          409: {
            description: 'Conflict',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          429: {
            description: 'Too many requests',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          500: {
            description: 'Internal server error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
        },
      },
    },

    '/auth/verify': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify user account',
        description: 'Verifies a user account using OTP',

        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/VerifyUser',
            },
          },
        ],

        responses: {
          200: {
            description: 'User verified successfully',
            schema: {
              example: {
                message: 'User verified',
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          401: {
            description: 'Unauthorized',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          404: {
            description: 'Not found',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          429: {
            description: 'Too many requests',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          500: {
            description: 'Internal server error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
        },
      },
    },
    //added forgot password endpoints
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset OTP',
        description: 'Sends a password reset OTP to the user email',

        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/ForgotPasswordRequest',
            },
          },
        ],

        responses: {
          200: {
            description: 'OTP sent successfully',
            schema: {
              example: 'Password reset OTP sent to email.',
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User does not exist',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          429: {
            description: 'Too many requests',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          500: {
            description: 'Internal server error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },

    '/auth/verify-forgot-password-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify forgot password OTP',
        description:
          'Verifies the OTP sent to the user email for password reset',

        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/VerifyForgotPasswordOtp',
            },
          },
        ],

        responses: {
          200: {
            description: 'OTP verified successfully',
            schema: {
              example: {
                message: 'OTP verified successfully.',
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          404: {
            description: 'User not found',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          429: {
            description: 'Too many attempts',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          500: {
            description: 'Internal server error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
        },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset user password',
        description: 'Resets user password after OTP verification',

        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/ResetPassword',
            },
          },
        ],

        responses: {
          200: {
            description: 'Password reset successfully',
            schema: {
              example: {
                message: 'Password reset successfully.',
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          404: {
            description: 'User not found',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
          500: {
            description: 'Internal server error',
            schema: {
              $ref: '#/definitions/ErrorResponse',
            },
          },
        },
      },
    },

    '/auth/user-login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        description: 'Authenticates user and sets JWT cookie',

        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/LoginRequest',
            },
          },
        ],

        responses: {
          200: {
            description: 'Login successful',
            schema: {
              example: {
                message: 'Login successful',
              },
            },
          },
          400: {
            description: 'Invalid credentials',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          401: {
            description: 'Unauthorized',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          500: {
            description: 'Internal server error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
  },

  definitions: {
    RegisterUser: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
        },
        email: {
          type: 'string',
          example: 'user@email.com',
        },
        password: {
          type: 'string',
          example: 'StrongPassword123',
        },
      },
    },

    VerifyUser: {
      type: 'object',
      required: ['email', 'otp'],
      properties: {
        email: {
          type: 'string',
          example: 'user@email.com',
        },
        otp: {
          type: 'string',
          example: '123456',
        },
      },
    },
    // New definition for verifying forgot password OTP
    ForgotPasswordRequest: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          example: 'user@email.com',
        },
      },
    },
    VerifyForgotPasswordOtp: {
      type: 'object',
      required: ['email', 'otp'],
      properties: {
        email: {
          type: 'string',
          example: 'user@email.com',
        },
        otp: {
          type: 'string',
          example: '123456',
        },
      },
    },

    ResetPassword: {
      type: 'object',
      required: ['email', 'newPassword'],
      properties: {
        email: {
          type: 'string',
          example: 'user@email.com',
        },
        newPassword: {
          type: 'string',
          example: 'NewStrongPassword123',
        },
      },
    },

    LoginRequest: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          example: 'user@email.com',
        },
        password: {
          type: 'string',
          example: 'StrongPassword123',
        },
      },
    },

    ErrorResponse: {
      type: 'object',
      required: ['success', 'message'],
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        message: {
          type: 'string',
          example: 'Validation failed',
        },
        details: {
          type: 'object',
          nullable: true,
          example: {
            field: 'email',
            issue: 'Invalid format',
          },
        },
      },
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/auth-router.ts']; // 👈 auto scan routes

swaggerAutogen()(outputFile, endpointsFiles, swaggerDoc);
