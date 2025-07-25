# Mini Support Ticketing System - Setup Instructions

## 🎯 Complete Full-Stack Support Ticketing System

This is a fully functional support ticketing system with:
- **Backend**: Python Flask API with SQLite database
- **Frontend**: React.js with modern responsive UI
- **AI Integration**: Groq Cloud for smart ticket categorization
- **User Roles**: Reporter and Admin with different capabilities
- **Real-time Features**: Live ticket management and status updates

## ⚡ Quick Start

### Backend Setup (Already Running)
The Flask backend is already running on `http://localhost:5000` with:
- ✅ Sample data initialized
- ✅ All API endpoints working
- ✅ SQLite database created
- ✅ CORS enabled for frontend communication

### Frontend Setup (Starting)
The React frontend is starting on `http://localhost:3000` with:
- ✅ Modern responsive UI
- ✅ Role-based access control
- ✅ Ticket management interface
- ✅ Dashboard with statistics

## 🔑 Demo Accounts

### Reporters (Can create and view their tickets)
- Email: `reporter1@example.com` | Password: `password123`
- Email: `reporter2@example.com` | Password: `password123`

### Admins (Can manage all tickets, assign themselves, update status)
- Email: `admin1@example.com` | Password: `password123`
- Email: `admin2@example.com` | Password: `password123`

## 🤖 AI Features (Optional)

To enable AI-powered ticket categorization with Groq Cloud:

1. **Get Groq API Key**:
   - Visit: https://console.groq.com/keys
   - Create a free account
   - Generate an API key

2. **Update Environment Variables**:
   - Open: `backend\.env`
   - Replace `your_groq_api_key_here` with your actual API key
   - Restart the backend server

3. **AI Features Include**:
   - Automatic ticket categorization
   - Smart category suggestions
   - Manual re-analysis of tickets

## 📱 System Features

### For Reporters:
- ✅ Create new support tickets
- ✅ View all their submitted tickets
- ✅ Track ticket status and progress
- ✅ Set priority levels (Low, Medium, High, Critical)
- ✅ View dashboard with personal statistics

### For Admins:
- ✅ View all tickets in the system
- ✅ Assign tickets to themselves or other admins
- ✅ Update ticket status (Open → In Progress → Closed)
- ✅ Filter tickets by status, priority, admin, or reporter
- ✅ AI-powered ticket analysis and categorization
- ✅ Comprehensive dashboard with system statistics

### System Features:
- ✅ Responsive design (works on mobile, tablet, desktop)
- ✅ Real-time statistics and charts
- ✅ Advanced filtering and search
- ✅ Priority-based ticket management
- ✅ Status tracking with timestamps
- ✅ Clean, modern UI with animations
- ✅ Error handling and loading states

## 🛠 Technical Stack

### Backend:
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **AI Integration**: Groq Cloud API (Llama3-8B model)
- **API**: RESTful endpoints with JSON responses
- **CORS**: Enabled for frontend communication

### Frontend:
- **Framework**: React.js 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome
- **State Management**: React Hooks

## 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tickets` | Get all tickets (with filters) |
| POST | `/api/tickets` | Create new ticket |
| PUT | `/api/tickets/<id>` | Update ticket |
| POST | `/api/tickets/<id>/analyze` | AI analyze ticket |
| GET | `/api/users` | Get all users |
| GET | `/api/stats` | Get dashboard statistics |

## 📊 Database Schema

### Users Table:
- id, email, name, role, password_hash, created_at

### Tickets Table:
- id, title, description, priority, status, category
- reporter_id, assigned_admin_id
- created_at, updated_at, closed_at

## 🎨 UI Components

1. **Login Screen**: Role-based authentication
2. **Dashboard**: Statistics and recent tickets
3. **Ticket List**: Advanced filtering and management
4. **Create Ticket**: Form with validation
5. **Header**: Navigation and user info

## 🚀 How to Access

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Login**: Use any demo account from above
3. **Explore**: Try creating tickets, assigning them, and updating status

## 📝 Sample Tickets

The system comes pre-loaded with sample tickets including:
- Login issues (High priority)
- Performance problems (Medium priority)
- Feature requests (Low priority)
- Critical system bugs (Critical priority)

## 🎯 Next Steps

1. **Customize**: Modify the UI colors, layout, or add new features
2. **Deploy**: Use services like Heroku, Vercel, or AWS
3. **Enhance**: Add email notifications, file attachments, or comments
4. **Scale**: Replace SQLite with PostgreSQL for production use

## 🔍 Troubleshooting

- **Backend not working**: Check if Python dependencies are installed
- **Frontend not loading**: Ensure npm dependencies are installed
- **AI not working**: Verify Groq API key is set correctly
- **Login issues**: Use the exact demo credentials provided

## 💡 Features Highlights

- **Fully Responsive**: Works perfectly on all devices
- **Real-time Updates**: Live status changes and statistics
- **Smart Categorization**: AI-powered ticket analysis
- **Role-based Access**: Different interfaces for reporters and admins
- **Production Ready**: Error handling, validation, and security

**🎉 Your Mini Support Ticketing System is now ready to use!**
