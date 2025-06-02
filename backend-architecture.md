# Backend Architecture for Water Tank Monitoring System

## 1. Technology Stack

### Core Technologies
- **Node.js** - Runtime environment
- **Nest js** - Web framework
- **MongoDB** - Database (flexible schema for IoT data)
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time updates for water levels and order status

### Deployment Options
- **Docker** - Containerization
- **AWS/Azure/GCP** - Cloud hosting

## 2. Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  role: String (enum: 'customer', 'supplier', 'admin'),
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  notificationPreferences: {
    push: Boolean,
    email: Boolean,
    sms: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Tank Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  capacity: Number, // in liters
  avgDailyUsage: Number, // calculated field
  lowWaterThreshold: Number, // percentage
  autoOrder: Boolean,
  preferredSupplier: ObjectId (ref: Supplier),
  deviceId: String, // IoT device identifier
  installedDate: Date,
  lastMaintenance: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### WaterLevel Model
```javascript
{
  _id: ObjectId,
  tankId: ObjectId (ref: Tank),
  level: Number, // percentage
  volumeLiters: Number, // calculated
  timestamp: Date,
  source: String (enum: 'sensor', 'manual', 'estimated')
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderNumber: String, // WO-XXXX
  userId: ObjectId (ref: User),
  tankId: ObjectId (ref: Tank),
  supplierId: ObjectId (ref: User with role 'supplier'),
  orderDate: Date,
  scheduledDeliveryDate: Date,
  actualDeliveryDate: Date,
  status: String (enum: 'placed', 'acknowledged', 'scheduled', 'in_transit', 'delivered', 'cancelled'),
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      updatedBy: ObjectId (ref: User),
      notes: String
    }
  ],
  amount: Number, // in liters
  price: Number,
  invoiceNumber: String,
  paymentStatus: String (enum: 'pending', 'paid', 'failed', 'refunded'),
  deliveryNotes: String,
  customerSignature: String, // base64 encoded image or path
  driverNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (enum: 'warning', 'order', 'delivery', 'cancel', 'reschedule', 'system'),
  message: String,
  relatedTo: {
    model: String (enum: 'order', 'tank', 'system'),
    id: ObjectId
  },
  read: Boolean,
  sentVia: [String], // array of channels: 'push', 'email', 'sms'
  createdAt: Date
}
```

### Supplier Model (extends User)
```javascript
{
  // inherits from User with role 'supplier'
  company: String,
  logo: String, // image path or URL
  serviceAreas: [
    {
      region: String,
      postalCodes: [String]
    }
  ],
  pricing: [
    {
      minVolume: Number,
      maxVolume: Number,
      pricePerLiter: Number
    }
  ],
  avgResponseTime: Number, // in hours (calculated)
  rating: Number, // 1-5 stars
  reviews: [
    {
      userId: ObjectId,
      rating: Number,
      comment: String,
      date: Date
    }
  ],
  active: Boolean
}
```

## 3. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile
- `PATCH /api/users/notification-preferences` - Update notification preferences

### Tank Management
- `GET /api/tanks` - Get all tanks for user
- `GET /api/tanks/:id` - Get specific tank details
- `POST /api/tanks` - Register new tank
- `PATCH /api/tanks/:id` - Update tank settings
- `DELETE /api/tanks/:id` - Delete tank

### Water Level
- `GET /api/tanks/:id/levels` - Get water level history
- `GET /api/tanks/:id/levels/current` - Get current water level
- `POST /api/tanks/:id/levels` - Record new water level (manual input)
- `POST /api/iot/water-level` - Endpoint for IoT devices to report levels

### Orders
- `GET /api/orders` - Get all orders for user
- `GET /api/orders/:id` - Get specific order details
- `POST /api/orders` - Place new order
- `PATCH /api/orders/:id/cancel` - Cancel order
- `PATCH /api/orders/:id/reschedule` - Reschedule order
- `GET /api/orders/statistics` - Get order statistics

### Supplier Endpoints
- `GET /api/supplier/orders` - Get all orders for supplier
- `GET /api/supplier/orders/:id` - Get specific order details
- `PATCH /api/supplier/orders/:id/status` - Update order status
- `GET /api/supplier/schedule` - Get delivery schedule
- `GET /api/supplier/customers` - Get all customers
- `GET /api/supplier/dashboard` - Get dashboard statistics

### Notifications
- `GET /api/notifications` - Get all notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/suppliers` - Get all suppliers
- `POST /api/admin/suppliers` - Add new supplier
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/statistics` - Get system statistics

## 4. Real-time Features (using Socket.io)

- Real-time water level updates
- Order status changes
- Delivery tracking
- Instant notifications

## 5. Middleware and Services

### Middleware
- Authentication middleware
- Role-based access control
- Request validation
- Error handling
- Logging

### Services
- **NotificationService** - Handles all types of notifications (push, email, SMS)
- **OrderService** - Manages order processing and status updates
- **WaterLevelService** - Processes and analyzes water level data
- **SchedulingService** - Manages delivery scheduling
- **PaymentService** - Handles payment processing
- **IoTService** - Manages IoT device communication
- **ReportingService** - Generates reports and analytics

## 6. IoT Integration

### Device Communication
- MQTT protocol for efficient IoT communication
- REST API endpoint for devices that support HTTP
- Webhook callbacks for device status changes

### Data Processing
- Stream processing for real-time water level monitoring
- Anomaly detection to identify potential leaks or device malfunctions
- Time-series storage for efficient historical data queries

## 7. Supplier Web Portal

### Features
- Dashboard with real-time order data
- Order management
  - View incoming orders
  - Accept/reject orders
  - Update order status
  - Schedule deliveries
  - Assign drivers
- Customer management
  - View customer details
  - See customer tank levels
  - View order history
- Delivery management
  - Route optimization
  - Delivery tracking
  - Proof of delivery collection
- Reporting
  - Delivery performance
  - Revenue reports
  - Customer analytics

### Technologies
- React.js for frontend
- Redux or Context API for state management
- Material-UI or Bootstrap for UI components
- Mapbox or Google Maps for delivery tracking and route planning

## 8. Database Considerations

### Data Sharding
- Time-based sharding for water level data
- Geographical sharding for regional scaling

### Indexes
- Index on `tankId` + `timestamp` for efficient water level queries
- Index on `userId` for quick user-related queries
- Index on `supplierId` + `status` for supplier order management
- Geospatial indexes for location-based queries

## 9. Scaling Considerations

### Horizontal Scaling
- Stateless API servers behind load balancer
- Database read replicas for scaling read operations
- Consider MongoDB Atlas for managed database scaling

### Caching
- Redis for caching frequently accessed data
- Cache current water levels and recent orders
- JWT token caching

## 10. Security Implementations

- HTTPS for all communications
- JWT with refresh token pattern
- Rate limiting
- Input validation
- OWASP security best practices
- Data encryption at rest and in transit
- Regular security audits and penetration testing

## 11. Development and Deployment Strategy

### Development
- Use feature branches and pull requests
- Comprehensive test coverage (unit, integration, e2e)
- CI/CD pipeline for automated testing and deployment
- Staging environment that mirrors production

### Deployment
- Containerize with Docker
- Kubernetes for orchestration (optional)
- Infrastructure as Code (Terraform)
- Blue-green deployment strategy for zero downtime updates
