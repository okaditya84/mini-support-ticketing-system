from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ticketing_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

db = SQLAlchemy(app)
CORS(app)

# Groq API configuration
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'reporter' or 'admin'
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), nullable=False)  # 'low', 'medium', 'high', 'critical'
    status = db.Column(db.String(20), default='open')  # 'open', 'in-progress', 'closed'
    category = db.Column(db.String(50))  # AI-generated category
    
    # Relationships
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_admin_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = db.Column(db.DateTime)
    
    # Relationships
    reporter = db.relationship('User', foreign_keys=[reporter_id], backref='reported_tickets')
    assigned_admin = db.relationship('User', foreign_keys=[assigned_admin_id], backref='assigned_tickets')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'category': self.category,
            'reporter': self.reporter.to_dict(),
            'assigned_admin': self.assigned_admin.to_dict() if self.assigned_admin else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'closed_at': self.closed_at.isoformat() if self.closed_at else None
        }

# AI Service for ticket analysis
def analyze_ticket_with_groq(title, description):
    """Use Groq API to analyze and categorize the ticket"""
    if not GROQ_API_KEY:
        return "General"
    
    try:
        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        prompt = f"""
        Analyze this support ticket and categorize it into one of these categories:
        - Technical Issue
        - Account Problem
        - Feature Request
        - Bug Report
        - General Inquiry
        - Billing Issue
        - Performance Issue
        - Security Concern
        
        Ticket Title: {title}
        Ticket Description: {description}
        
        Respond with only the category name.
        """
        
        data = {
            "model": "llama3-8b-8192",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 50,
            "temperature": 0.1
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            category = result['choices'][0]['message']['content'].strip()
            return category
        else:
            print(f"Groq API error: {response.status_code}")
            return "General"
            
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return "General"

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    # Get filter parameters
    status_filter = request.args.get('status')
    priority_filter = request.args.get('priority')
    assigned_admin_filter = request.args.get('assigned_admin')
    reporter_filter = request.args.get('reporter')
    
    # Build query
    query = Ticket.query
    
    if status_filter:
        query = query.filter(Ticket.status == status_filter)
    if priority_filter:
        query = query.filter(Ticket.priority == priority_filter)
    if assigned_admin_filter:
        query = query.filter(Ticket.assigned_admin_id == assigned_admin_filter)
    if reporter_filter:
        query = query.filter(Ticket.reporter_id == reporter_filter)
    
    # Order by creation date (newest first)
    tickets = query.order_by(Ticket.created_at.desc()).all()
    
    return jsonify([ticket.to_dict() for ticket in tickets])

@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'priority', 'reporter_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate reporter exists
    reporter = User.query.get(data['reporter_id'])
    if not reporter or reporter.role != 'reporter':
        return jsonify({'error': 'Invalid reporter ID'}), 400
    
    # Validate priority
    valid_priorities = ['low', 'medium', 'high', 'critical']
    if data['priority'] not in valid_priorities:
        return jsonify({'error': 'Invalid priority level'}), 400
    
    # Analyze ticket with AI
    category = analyze_ticket_with_groq(data['title'], data['description'])
    
    # Create new ticket
    ticket = Ticket(
        title=data['title'],
        description=data['description'],
        priority=data['priority'],
        reporter_id=data['reporter_id'],
        category=category
    )
    
    try:
        db.session.add(ticket)
        db.session.commit()
        return jsonify(ticket.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create ticket'}), 500

@app.route('/api/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    
    # Update allowed fields
    if 'status' in data:
        valid_statuses = ['open', 'in-progress', 'closed']
        if data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        ticket.status = data['status']
        
        # Set closed_at when ticket is closed
        if data['status'] == 'closed':
            ticket.closed_at = datetime.utcnow()
        else:
            ticket.closed_at = None
    
    if 'assigned_admin_id' in data:
        if data['assigned_admin_id']:
            admin = User.query.get(data['assigned_admin_id'])
            if not admin or admin.role != 'admin':
                return jsonify({'error': 'Invalid admin ID'}), 400
        ticket.assigned_admin_id = data['assigned_admin_id']
    
    if 'priority' in data:
        valid_priorities = ['low', 'medium', 'high', 'critical']
        if data['priority'] not in valid_priorities:
            return jsonify({'error': 'Invalid priority level'}), 400
        ticket.priority = data['priority']
    
    ticket.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify(ticket.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update ticket'}), 500

@app.route('/api/tickets/<int:ticket_id>/analyze', methods=['POST'])
def analyze_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Re-analyze the ticket with AI
    category = analyze_ticket_with_groq(ticket.title, ticket.description)
    ticket.category = category
    ticket.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'ticket_id': ticket_id,
            'new_category': category,
            'message': 'Ticket analyzed successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to analyze ticket'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    total_tickets = Ticket.query.count()
    open_tickets = Ticket.query.filter_by(status='open').count()
    in_progress_tickets = Ticket.query.filter_by(status='in-progress').count()
    closed_tickets = Ticket.query.filter_by(status='closed').count()
    
    # Priority breakdown
    critical_tickets = Ticket.query.filter_by(priority='critical').count()
    high_tickets = Ticket.query.filter_by(priority='high').count()
    medium_tickets = Ticket.query.filter_by(priority='medium').count()
    low_tickets = Ticket.query.filter_by(priority='low').count()
    
    return jsonify({
        'total_tickets': total_tickets,
        'status_breakdown': {
            'open': open_tickets,
            'in_progress': in_progress_tickets,
            'closed': closed_tickets
        },
        'priority_breakdown': {
            'critical': critical_tickets,
            'high': high_tickets,
            'medium': medium_tickets,
            'low': low_tickets
        }
    })

def init_db():
    """Initialize database with sample data"""
    db.create_all()
    
    # Check if data already exists
    if User.query.count() > 0:
        return
    
    # Create sample users
    users = [
        User(email='reporter1@example.com', name='John Reporter', role='reporter'),
        User(email='reporter2@example.com', name='Jane User', role='reporter'),
        User(email='admin1@example.com', name='Admin Smith', role='admin'),
        User(email='admin2@example.com', name='Support Manager', role='admin')
    ]
    
    for user in users:
        user.password_hash = generate_password_hash('password123')
        db.session.add(user)
    
    db.session.commit()
    
    # Create sample tickets
    sample_tickets = [
        {
            'title': 'Cannot login to my account',
            'description': 'I keep getting an error message when trying to log in. It says invalid credentials but I am sure my password is correct.',
            'priority': 'high',
            'reporter_id': 1
        },
        {
            'title': 'Website loading very slowly',
            'description': 'The website takes more than 30 seconds to load any page. This is affecting my productivity.',
            'priority': 'medium',
            'reporter_id': 2
        },
        {
            'title': 'Feature request: Dark mode',
            'description': 'It would be great if the application had a dark mode option for better user experience.',
            'priority': 'low',
            'reporter_id': 1
        },
        {
            'title': 'Critical bug in payment system',
            'description': 'Payments are failing with error code 500. This is affecting our business operations.',
            'priority': 'critical',
            'reporter_id': 2
        }
    ]
    
    for ticket_data in sample_tickets:
        category = analyze_ticket_with_groq(ticket_data['title'], ticket_data['description'])
        ticket = Ticket(
            title=ticket_data['title'],
            description=ticket_data['description'],
            priority=ticket_data['priority'],
            reporter_id=ticket_data['reporter_id'],
            category=category
        )
        db.session.add(ticket)
    
    db.session.commit()
    print("Database initialized with sample data!")

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True, port=5000)
