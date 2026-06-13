# AuthMaster

A secure authentication system built with Node.js, Express, and MongoDB, featuring JWT-based authentication, email verification, and session management.

## Features

- **User Registration** with email verification via OTP
- **Secure Login** with JWT access and refresh tokens
- **Token Refresh Mechanism** with automatic token rotation
- **Session Management** with IP and user-agent tracking
- **Multi-Device Logout** (logout from current session or all sessions)
- **Password Security** using bcrypt with salt rounds
- **Email Verification** using Nodemailer with OAuth2
- **Secure Cookie Handling** with httpOnly and secure flags
- **Token Hashing** using SHA-256 for secure storage

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer with Gmail OAuth2
- **Cookie Management**: cookie-parser
- **Environment Variables**: dotenv

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AuthMaster
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGOOSE_URL=mongodb://localhost:27017/authmaster
JWT_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
GOOGLE_USER=your-email@gmail.com
PORT=3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm start
```

The server will run on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "age": 25,
  "password": "securePassword123"
}
```

**Response**: User object with verification OTP sent to email

#### Verify Email (OTP)
```http
POST /api/users/verify
Content-Type: application/json

{
  "otp": "123456",
  "email": "john@example.com"
}
```

**Response**: Verification success message

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**: 
```json
{
  "user": "john_doe",
  "AccessToken": "jwt-access-token"
}
```
**Note**: RefreshToken is set as an httpOnly cookie

#### Get Current User
```http
GET /api/users/getme
Authorization: Bearer <access-token>
```

**Response**: Current user object

#### Refresh Access Token
```http
GET /api/users/refresh-token
```
**Note**: Uses RefreshToken from httpOnly cookie

**Response**: New access token

#### Logout (Current Session)
```http
GET /api/users/logout
```
**Note**: Uses RefreshToken from httpOnly cookie

**Response**: Logout success message

#### Logout All Sessions
```http
GET /api/users/logoutAll
```
**Note**: Revokes all active sessions for the user

**Response**: Logout success message

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Plain text passwords are never stored

### JWT Token Management
- **Access Tokens**: Expire in 15 minutes
- **Refresh Tokens**: Expire in 7 days
- Tokens are signed using a secret key from environment variables
- Refresh tokens are hashed using SHA-256 before database storage

### Session Management
- Each session tracks IP address and user-agent
- Sessions can be revoked individually or all at once
- Refresh tokens are rotated on each refresh for enhanced security

### Cookie Security
- httpOnly flag prevents XSS attacks
- Secure flag enabled in production (HTTPS only)
- sameSite set to 'lax' for CSRF protection

### Email Verification
- OTP codes are hashed using SHA-256 before storage
- OTPs are sent via secure email using Gmail OAuth2
- OTPs are deleted after successful verification

## Project Structure

```
AuthMaster/
├── src/
│   ├── config/
│   │   ├── config.js           # Configuration management
│   │   └── mongoose.config.js  # MongoDB connection
│   ├── controller/
│   │   └── Auth.controller.js  # Authentication logic
│   ├── models/
│   │   ├── users.model.js      # User schema
│   │   ├── session.model.js    # Session schema
│   │   └── otp.model.js        # OTP schema
│   ├── routes/
│   │   └── users.routes.js     # API routes
│   ├── services/
│   │   ├── email.service.js    # Email configuration
│   │   └── sendMail.service.js # Email sending logic
│   ├── utils/
│   │   └── generateOtp.js      # OTP generation utilities
│   └── app.js                  # Express app setup
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGOOSE_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `GOOGLE_CLIENT_ID` | Gmail OAuth2 client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Gmail OAuth2 client secret | Yes |
| `GOOGLE_REFRESH_TOKEN` | Gmail OAuth2 refresh token | Yes |
| `GOOGLE_USER` | Gmail email address | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Gmail OAuth2 Setup

To use the email verification feature, you need to set up Gmail OAuth2:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add the following redirect URI: `https://developers.google.com/oauthplayground`
6. Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) to generate refresh token
7. Add the credentials to your `.env` file

## Usage Example

### Registration Flow
```javascript
// 1. Register user
const response = await fetch('http://localhost:3000/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    age: 25,
    password: 'securePassword123'
  })
});

// 2. Verify email with OTP received in email
const verifyResponse = await fetch('http://localhost:3000/api/users/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    otp: '123456',
    email: 'john@example.com'
  })
});
```

### Login Flow
```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePassword123'
  }),
  credentials: 'include' // Important for cookies
});

const { AccessToken } = await loginResponse.json();

// 2. Use access token for authenticated requests
const userResponse = await fetch('http://localhost:3000/api/users/getme', {
  headers: {
    'Authorization': `Bearer ${AccessToken}`
  }
});
```

## Development

The project uses `nodemon` for hot-reloading during development. Any changes to the source files will automatically restart the server.

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
