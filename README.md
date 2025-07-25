# Mini Support Ticketing System

A full-stack support ticketing system built with Flask (backend) and React (frontend).

## Features

- **User Roles**: Reporter and Admin
- **Ticket Management**: Create, assign, update, and resolve tickets
- **Status Tracking**: Open, In Progress, Closed
- **Priority Levels**: Low, Medium, High, Critical
- **Filtering**: Filter tickets by status, priority, and assigned admin
- **AI Integration**: Smart ticket categorization using Groq Cloud
- **Real-time Updates**: Live status updates

## Tech Stack

### Backend
- Python Flask
- SQLite Database
- SQLAlchemy ORM
- Flask-CORS for cross-origin requests
- Groq Cloud API for AI features

### Frontend
- React.js
- Axios for API calls
- Modern CSS with responsive design
- React Hooks for state management

## Project Structure

```
Mini Support Ticketing/
├── backend/
│   ├── app.py              # Flask application
│   ├── models.py           # Database models
│   ├── routes/             # API routes
│   ├── database.db         # SQLite database
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   └── App.js          # Main React app
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory
2. Install dependencies: `pip install -r requirements.txt`
3. Run the application: `python app.py`
4. Backend will run on http://localhost:5000

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Frontend will run on http://localhost:3000

## API Endpoints

- `GET /api/tickets` - Get all tickets with filtering
- `POST /api/tickets` - Create a new ticket
- `PUT /api/tickets/<id>` - Update ticket status/assignment
- `GET /api/users` - Get all users
- `POST /api/tickets/<id>/analyze` - AI analysis of ticket

## Default Users

### Reporters
- reporter1@example.com
- reporter2@example.com

### Admins
- admin1@example.com
- admin2@example.com

## Environment Variables

Create a `.env` file in the backend directory:
```
GROQ_API_KEY=your_groq_api_key_here
```
