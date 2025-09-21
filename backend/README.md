# Minnie's Farm Resort - Backend API

A professional Node.js + MongoDB backend for the resort booking and management system.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Booking Management**: Complete booking system with status tracking
- **Contact Management**: Handle customer inquiries and messages
- **User Management**: Admin and super admin user roles
- **Image Management**: Upload and manage resort images
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Data Export**: Export bookings and contacts to CSV/JSON
- **Security**: Rate limiting, input validation, password hashing
- **API Documentation**: RESTful API with proper error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/minnies_farm_resort

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (generate a strong secret key)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=superadmin123
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The database will be created automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### 4. Initialize Database

Run the database initialization script to create admin users and sample data:

```bash
npm run init-db
```

This will create:
- Super Admin account (username: `superadmin`, password: `superadmin123`)
- Regular Admin account (username: `admin`, password: `admin123`)
- Sample bookings and contact messages (in development mode)

### 5. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new admin (super admin only)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Bookings
- `POST /api/bookings` - Create new booking (public)
- `GET /api/bookings` - Get all bookings (admin)
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/status` - Update booking status (admin)
- `DELETE /api/bookings/:id` - Delete booking (admin)
- `GET /api/bookings/stats/dashboard` - Get booking statistics (admin)

### Contacts
- `POST /api/contacts` - Create contact message (public)
- `GET /api/contacts` - Get all contacts (admin)
- `GET /api/contacts/:id` - Get single contact (admin)
- `PATCH /api/contacts/:id/status` - Update contact status (admin)
- `PATCH /api/contacts/:id/priority` - Update contact priority (admin)
- `POST /api/contacts/:id/reply` - Reply to contact (admin)
- `DELETE /api/contacts/:id` - Delete contact (admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard data (admin)
- `GET /api/admin/users` - Get all users (super admin)
- `PATCH /api/admin/users/:id/status` - Update user status (super admin)
- `DELETE /api/admin/users/:id` - Delete user (super admin)
- `GET /api/admin/export/bookings` - Export bookings data (admin)
- `GET /api/admin/export/contacts` - Export contacts data (admin)

### Images
- `POST /api/images/upload` - Upload image (admin)
- `GET /api/images` - Get all images (admin)
- `GET /api/images/serve/:filename` - Serve image file (public)
- `PUT /api/images/:id` - Update image metadata (admin)
- `DELETE /api/images/:id` - Delete image (admin)
- `DELETE /api/images` - Delete all images (admin)

### Health Check
- `GET /api/health` - Server health check

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Admin**: Can manage bookings, contacts, and view dashboard
- **Super Admin**: All admin permissions + user management

## 📊 Database Schema

### Booking Schema
```javascript
{
  bookingId: String (unique),
  guestName: String,
  email: String,
  phone: String,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  accommodationType: String, // 'day' or 'overnight'
  addOns: [String],
  totalAmount: Number,
  specialRequests: String,
  status: String, // 'pending', 'confirmed', 'cancelled', 'completed'
  paymentStatus: String, // 'unpaid', 'partial', 'paid', 'refunded'
  adminNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Schema
```javascript
{
  messageId: String (unique),
  name: String,
  email: String,
  phone: String,
  subject: String, // 'booking', 'information', 'complaint', 'suggestion', 'other'
  message: String,
  status: String, // 'new', 'read', 'replied', 'resolved'
  priority: String, // 'low', 'medium', 'high', 'urgent'
  adminResponse: String,
  respondedBy: String,
  respondedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String, // 'admin' or 'superadmin'
  firstName: String,
  lastName: String,
  phone: String,
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Express Validator for all inputs
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Account Locking**: Temporary lockout after failed login attempts

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_super_secure_jwt_secret
PORT=5000
```

### PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "resort-api"
pm2 startup
pm2 save
```

## 🧪 Testing

```bash
# Test server health
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📝 Development Scripts

```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run init-db     # Initialize database with admin users
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email admin@minniesfarmresort.com or create an issue in the repository.

---

**Happy Coding! 🎉**
