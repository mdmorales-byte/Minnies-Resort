# 🧪 Minnie's Farm Resort - Testing Guide

## 🚀 System Status
✅ **Backend Server**: Running on http://localhost:5000  
✅ **Database**: MongoDB connected and seeded  
✅ **Frontend**: Ready to start on http://localhost:3000  

## 🔐 Test Credentials

### Admin Login
- **Super Admin**: `superadmin@minniesfarmresort.com` / `superadmin123`
- **Regular Admin**: `admin@minniesfarmresort.com` / `admin123`

## 📋 Testing Checklist

### 1. Customer Features (Frontend)
- [ ] **Homepage**: Visit http://localhost:3000
  - [ ] Hero slideshow works
  - [ ] Pricing section displays correctly
  - [ ] Testimonials show properly
  - [ ] Call-to-action buttons work

- [ ] **Booking System**: http://localhost:3000/booking
  - [ ] Fill out booking form
  - [ ] Submit booking (saves to database)
  - [ ] Receive confirmation
  - [ ] Check booking appears in admin panel

- [ ] **Contact Form**: http://localhost:3000/contact
  - [ ] Submit contact message
  - [ ] Message saves to database
  - [ ] Check message appears in admin panel

### 2. Admin Features (Backend Connected)
- [ ] **Admin Login**: http://localhost:3000/admin/login
  - [ ] Login with super admin credentials
  - [ ] Login with regular admin credentials
  - [ ] Verify JWT token authentication

- [ ] **User Management**: (Super Admin only)
  - [ ] View all users
  - [ ] Search and filter users
  - [ ] User roles display correctly

- [ ] **Booking Management**:
  - [ ] View all bookings from database
  - [ ] Update booking status
  - [ ] Search and filter bookings
  - [ ] Delete bookings

- [ ] **Contact Messages**:
  - [ ] View all messages from database
  - [ ] Update message status
  - [ ] Search and filter messages
  - [ ] Delete messages

### 3. Database Operations
- [ ] **Data Persistence**:
  - [ ] New bookings save to MongoDB
  - [ ] Contact messages save to MongoDB
  - [ ] Admin changes persist after refresh
  - [ ] User authentication maintains session

- [ ] **API Endpoints**:
  - [ ] GET /api/health (Health check)
  - [ ] POST /api/auth/login (Admin login)
  - [ ] GET /api/bookings (Fetch bookings)
  - [ ] POST /api/bookings (Create booking)
  - [ ] GET /api/contacts (Fetch messages)
  - [ ] POST /api/contacts (Create message)
  - [ ] GET /api/users (Fetch users)

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if MongoDB is running
net start MongoDB

# Restart backend server
cd backend
npm run dev
```

### Frontend Issues
```bash
# Clear React cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Re-seed database
cd backend
node seedDatabase.js
```

## 📊 Expected Test Results

### Customer Booking Flow
1. Customer fills booking form → ✅ Data validates
2. Submit booking → ✅ Saves to MongoDB
3. Admin sees booking → ✅ Real data displayed
4. Admin updates status → ✅ Changes persist

### Contact Message Flow
1. Customer sends message → ✅ Saves to database
2. Admin views messages → ✅ Real data shown
3. Admin updates status → ✅ Changes saved
4. Message tracking works → ✅ Status updates

### Authentication Flow
1. Admin login → ✅ JWT token generated
2. Protected routes → ✅ Token validation
3. Role-based access → ✅ Super admin vs admin
4. Session persistence → ✅ Stays logged in

## 🎯 Success Criteria
- ✅ No more "demo mode" messages
- ✅ Real data in all admin panels
- ✅ Customer bookings save to database
- ✅ Contact messages persist
- ✅ Admin authentication works
- ✅ All CRUD operations functional

## 🔧 Next Steps After Testing
1. **Production Setup**: Configure for production environment
2. **Email Integration**: Add email notifications
3. **Payment Gateway**: Integrate payment processing
4. **Image Upload**: Enable real image management
5. **Backup System**: Set up database backups
