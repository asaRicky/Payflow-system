from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime, timedelta
import secrets
import string
import os

app = Flask(__name__, static_folder='build', static_url_path='')

# Enhanced CORS implementation
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response

@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        response.headers['Access-Control-Max-Age'] = '3600'
        return response

# In-memory storage - START WITH EMPTY DATA
employees = []
departments = []
attendance = []
settings = {
    'raise_after_years': 2,
    'raise_percentage': 10.0,
    'point_value': 100.0,
    'payment_method': 'Bank Transfer',
    'early_points': 5,
    'on_time_points': 3
}

# Counter for IDs - using dict so we don't need global keyword
counters = {
    'employee_id': 1,
    'department_id': 1,
    'attendance_id': 1
}

# DEFAULT PASSWORD FOR ALL NEW EMPLOYEES
DEFAULT_PASSWORD = "welcome2026"

def generate_password(length=8):
    """Generate a random one-time password (DEPRECATED - now using default password)"""
    # This function is kept for backward compatibility but not used
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def calculate_salary_breakdown(employee):
    """Calculate complete salary breakdown for an employee"""
    base_salary = float(employee.get('base_salary', 0))
    allowances = float(employee.get('allowances', 0))
    deductions = float(employee.get('deductions', 0))
    points = int(employee.get('points', 0))
    
    # Calculate bonus from points
    point_value = float(settings.get('point_value', 100))
    bonus = points * point_value
    
    # Calculate raise if promoted or based on years of service
    raise_amount = 0
    if employee.get('is_promoted', False):
        raise_percentage = float(settings.get('raise_percentage', 10))
        raise_amount = base_salary * (raise_percentage / 100)
    
    # Calculate total
    total = base_salary + allowances + bonus + raise_amount - deductions
    
    return {
        'base_salary': base_salary,
        'allowances': allowances,
        'bonus': bonus,
        'raise': raise_amount,
        'deductions': deductions,
        'total': max(total, 0)  # Ensure non-negative
    }

def get_department_name(dept_id):
    """Get department name by ID"""
    if dept_id:
        dept = next((d for d in departments if d['id'] == dept_id), None)
        return dept['name'] if dept else None
    return None

# Employee endpoints
@app.route('/api/employees', methods=['GET', 'OPTIONS'])
def get_employees():
    """Get all employees with calculated salary breakdown"""
    if request.method == 'OPTIONS':
        return '', 204
    
    enriched_employees = []
    for emp in employees:
        emp_copy = emp.copy()
        emp_copy['salary_breakdown'] = calculate_salary_breakdown(emp)
        emp_copy['department_name'] = get_department_name(emp.get('department_id'))
        enriched_employees.append(emp_copy)
    return jsonify(enriched_employees)

@app.route('/api/employees', methods=['POST', 'OPTIONS'])
def create_employee():
    """Create a new employee"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        if not data.get('base_salary'):
            return jsonify({'error': 'Base salary is required'}), 400
        
        # Check if email already exists
        if any(e.get('email') == data.get('email') for e in employees):
            return jsonify({'error': 'Email already exists'}), 400
        
        # Use default password instead of generating random one
        one_time_password = DEFAULT_PASSWORD
        
        employee = {
            'id': counters['employee_id'],
            'name': data.get('name'),
            'email': data.get('email'),
            'department_id': int(data.get('department_id')) if data.get('department_id') else None,
            'base_salary': float(data.get('base_salary', 0)),
            'allowances': float(data.get('allowances', 0)),
            'deductions': float(data.get('deductions', 0)),
            'points': int(data.get('points', 0)),
            'is_promoted': False,
            'one_time_password': one_time_password,
            'password_used': False,
            'must_change_password': True,  # Require password change on first login
            'created_at': datetime.now().isoformat(),
            'hire_date': datetime.now().isoformat()
        }
        
        employees.append(employee)
        counters['employee_id'] += 1
        
        # Return employee with salary breakdown and one-time password
        employee_copy = employee.copy()
        employee_copy['salary_breakdown'] = calculate_salary_breakdown(employee)
        employee_copy['department_name'] = get_department_name(employee.get('department_id'))
        
        print(f"✅ Employee created: {employee['name']} (ID: {employee['id']}) - Password: {DEFAULT_PASSWORD}")
        
        return jsonify(employee_copy), 201
    
    except Exception as e:
        print(f"❌ Error creating employee: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees/<int:emp_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def employee_operations(emp_id):
    """Handle employee operations"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    employee = next((e for e in employees if e['id'] == emp_id), None)
    
    if request.method == 'GET':
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        emp_copy = employee.copy()
        emp_copy['salary_breakdown'] = calculate_salary_breakdown(employee)
        emp_copy['department_name'] = get_department_name(employee.get('department_id'))
        emp_copy['salary_breakdown']['points'] = employee.get('points', 0)
        
        return jsonify(emp_copy)
    
    elif request.method == 'PUT':
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        try:
            data = request.json
            
            # Update fields if provided
            if 'name' in data:
                employee['name'] = data['name']
            if 'email' in data:
                # Check if new email already exists (excluding current employee)
                if any(e.get('email') == data['email'] and e['id'] != emp_id for e in employees):
                    return jsonify({'error': 'Email already exists'}), 400
                employee['email'] = data['email']
            if 'department_id' in data:
                employee['department_id'] = int(data['department_id']) if data['department_id'] else None
            if 'base_salary' in data:
                employee['base_salary'] = float(data['base_salary'])
            if 'allowances' in data:
                employee['allowances'] = float(data['allowances'])
            if 'deductions' in data:
                employee['deductions'] = float(data['deductions'])
            if 'points' in data:
                employee['points'] = int(data['points'])
            if 'is_promoted' in data:
                employee['is_promoted'] = bool(data['is_promoted'])
            
            employee['updated_at'] = datetime.now().isoformat()
            
            # Return updated employee with salary breakdown
            employee_copy = employee.copy()
            employee_copy['salary_breakdown'] = calculate_salary_breakdown(employee)
            employee_copy['department_name'] = get_department_name(employee.get('department_id'))
            
            print(f"✅ Employee updated: {employee['name']} (ID: {employee['id']})")
            
            return jsonify(employee_copy)
        
        except Exception as e:
            print(f"❌ Error updating employee: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        employees.remove(employee)
        
        print(f"✅ Employee deleted: ID {emp_id}")
        
        return jsonify({'message': 'Employee deleted successfully'})

# Department endpoints
@app.route('/api/departments', methods=['GET', 'POST', 'OPTIONS'])
def departments_list():
    """Handle department list operations"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        enriched_departments = []
        for dept in departments:
            dept_copy = dept.copy()
            dept_employees = [e for e in employees if e.get('department_id') == dept['id']]
            dept_copy['employee_count'] = len(dept_employees)
            enriched_departments.append(dept_copy)
        return jsonify(enriched_departments)
    
    elif request.method == 'POST':
        try:
            data = request.json
            
            if not data or not data.get('name'):
                return jsonify({'error': 'Department name is required'}), 400
            
            # Check if department name already exists
            if any(d.get('name') == data.get('name') for d in departments):
                return jsonify({'error': 'Department name already exists'}), 400
            
            department = {
                'id': counters['department_id'],
                'name': data.get('name'),
                'manager': data.get('manager', ''),
                'created_at': datetime.now().isoformat()
            }
            
            departments.append(department)
            counters['department_id'] += 1
            
            print(f"✅ Department created: {department['name']} (ID: {department['id']})")
            
            return jsonify(department), 201
        
        except Exception as e:
            print(f"❌ Error creating department: {str(e)}")
            return jsonify({'error': str(e)}), 500

@app.route('/api/departments/<int:dept_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def department_operations(dept_id):
    """Handle department operations"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    department = next((d for d in departments if d['id'] == dept_id), None)
    
    if request.method == 'GET':
        if not department:
            return jsonify({'error': 'Department not found'}), 404
        return jsonify(department)
    
    elif request.method == 'PUT':
        if not department:
            return jsonify({'error': 'Department not found'}), 404
        
        try:
            data = request.json
            
            if 'name' in data:
                # Check if new name already exists (excluding current department)
                if any(d.get('name') == data['name'] and d['id'] != dept_id for d in departments):
                    return jsonify({'error': 'Department name already exists'}), 400
                department['name'] = data['name']
            if 'manager' in data:
                department['manager'] = data['manager']
            
            department['updated_at'] = datetime.now().isoformat()
            
            print(f"✅ Department updated: {department['name']} (ID: {department['id']})")
            
            return jsonify(department)
        
        except Exception as e:
            print(f"❌ Error updating department: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        if not department:
            return jsonify({'error': 'Department not found'}), 404
        
        # Check if department has employees
        dept_employees = [e for e in employees if e.get('department_id') == dept_id]
        if dept_employees:
            return jsonify({'error': f'Cannot delete department with {len(dept_employees)} employees'}), 400
        
        departments.remove(department)
        
        print(f"✅ Department deleted: ID {dept_id}")
        
        return jsonify({'message': 'Department deleted successfully'})

# Settings endpoints
@app.route('/api/settings', methods=['GET', 'PUT', 'OPTIONS'])
def settings_operations():
    """Handle settings operations"""
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        return jsonify(settings)
    
    elif request.method == 'PUT':
        try:
            data = request.json
            
            if 'raise_after_years' in data:
                settings['raise_after_years'] = int(data['raise_after_years'])
            if 'raise_percentage' in data:
                settings['raise_percentage'] = float(data['raise_percentage'])
            if 'point_value' in data:
                settings['point_value'] = float(data['point_value'])
            if 'payment_method' in data:
                settings['payment_method'] = data['payment_method']
            if 'early_points' in data:
                settings['early_points'] = int(data['early_points'])
            if 'on_time_points' in data:
                settings['on_time_points'] = int(data['on_time_points'])
            
            print(f"✅ Settings updated")
            
            return jsonify(settings)
        
        except Exception as e:
            print(f"❌ Error updating settings: {str(e)}")
            return jsonify({'error': str(e)}), 500

# Statistics endpoint
@app.route('/api/statistics', methods=['GET', 'OPTIONS'])
def get_statistics():
    """Get dashboard statistics"""
    if request.method == 'OPTIONS':
        return '', 204
    
    total_employees = len(employees)
    total_departments = len(departments)
    
    # Calculate total payout
    total_payout = sum(
        calculate_salary_breakdown(emp)['total'] 
        for emp in employees
    )
    
    # Get today's attendance count
    today = datetime.now().date().isoformat()
    attendance_today = len([
        a for a in attendance 
        if a.get('date') == today and a.get('status') in ['present', 'early']
    ])
    
    return jsonify({
        'total_employees': total_employees,
        'total_departments': total_departments,
        'total_payout': total_payout,
        'attendance_today': attendance_today
    })

# Notifications endpoint
@app.route('/api/notifications/<int:emp_id>', methods=['GET', 'OPTIONS'])
def get_notifications(emp_id):
    """Get notifications for an employee"""
    if request.method == 'OPTIONS':
        return '', 204
    
    notifications = []
    
    today = datetime.now().date().isoformat()
    recent_attendance = [a for a in attendance if a.get('employee_id') == emp_id]
    
    # Add attendance notifications
    for att in recent_attendance[-5:]:  # Last 5 attendance records
        if att.get('status') == 'early':
            notifications.append({
                'id': len(notifications) + 1,
                'type': 'success',
                'title': 'Early Arrival Bonus!',
                'message': f"You earned {att.get('points_earned', 0)} points for arriving early on {att.get('date')}",
                'created_at': att.get('created_at'),
                'is_read': False
            })
        elif att.get('status') == 'present':
            notifications.append({
                'id': len(notifications) + 1,
                'type': 'info',
                'title': 'Attendance Marked',
                'message': f"You earned {att.get('points_earned', 0)} points for being on time on {att.get('date')}",
                'created_at': att.get('created_at'),
                'is_read': False
            })
    
    return jsonify(notifications)

# Attendance endpoints
@app.route('/api/attendance/today/<int:emp_id>', methods=['GET', 'OPTIONS'])
def get_today_attendance(emp_id):
    """Check if employee has marked attendance today"""
    if request.method == 'OPTIONS':
        return '', 204
    
    today = datetime.now().date().isoformat()
    
    today_record = next(
        (a for a in attendance if a['employee_id'] == emp_id and a['date'] == today),
        None
    )
    
    if not today_record:
        return jsonify({'status': 'not_marked'})
    
    # Check if clocked out
    if today_record.get('check_out_time'):
        return jsonify({
            'status': 'clocked_out',
            'attendance': today_record
        })
    
    # Otherwise, clocked in
    return jsonify({
        'status': 'clocked_in',
        'attendance': today_record
    })

@app.route('/api/salary-report/<int:emp_id>', methods=['GET', 'OPTIONS'])
def get_salary_report(emp_id):
    """Generate salary report for employee"""
    if request.method == 'OPTIONS':
        return '', 204
    
    employee = next((e for e in employees if e['id'] == emp_id), None)
    
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404
    
    breakdown = calculate_salary_breakdown(employee)
    
    # Generate text report
    report = f"""
    ===============================================
    SALARY REPORT - {employee['name'].upper()}
    ===============================================
    
    Employee ID: {employee['id']}
    Email: {employee['email']}
    Department: {get_department_name(employee.get('department_id')) or 'N/A'}
    
    ===============================================
    SALARY BREAKDOWN
    ===============================================
    
    Base Salary:        KES {breakdown['base_salary']:,.2f}
    Allowances:       + KES {breakdown['allowances']:,.2f}
    Bonus (Points):   + KES {breakdown['bonus']:,.2f}
    Raise:            + KES {breakdown['raise']:,.2f}
    Deductions:       - KES {breakdown['deductions']:,.2f}
    -----------------------------------------------
    TOTAL SALARY:       KES {breakdown['total']:,.2f}
    
    ===============================================
    POINTS SUMMARY
    ===============================================
    
    Total Points: {employee.get('points', 0)}
    Point Value: KES {settings.get('point_value', 100):.2f} per point
    Bonus Earned: KES {breakdown['bonus']:,.2f}
    
    ===============================================
    Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    ===============================================
    """
    
    return report, 200, {'Content-Type': 'text/plain', 'Content-Disposition': f'attachment; filename=salary_report_{emp_id}.txt'}

# Attendance endpoints
@app.route('/api/attendance', methods=['GET', 'POST', 'OPTIONS'])
def attendance_operations():
    """Handle attendance operations"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'GET':
        date_filter = request.args.get('date')
        
        if date_filter:
            filtered = [a for a in attendance if a.get('date') == date_filter]
            return jsonify(filtered)
        
        return jsonify(attendance)
    
    elif request.method == 'POST':
        try:
            data = request.json
            employee_id = data.get('employee_id')
            action = data.get('action')  # 'check_in' or 'check_out'
            date = datetime.now().date().isoformat()
            current_time = datetime.now()
            
            # Get employee
            employee = next((e for e in employees if e['id'] == employee_id), None)
            if not employee:
                return jsonify({'error': 'Employee not found'}), 404
            
            # Check if attendance already exists for today
            existing = next(
                (a for a in attendance if a['employee_id'] == employee_id and a['date'] == date),
                None
            )
            
            if action == 'check_in':
                # Check if already checked in today
                if existing:
                    return jsonify({'error': 'Already checked in today'}), 400
                
                # Determine if early or on-time
                hour = current_time.hour
                minute = current_time.minute
                
                is_early = hour < 8 or (hour == 8 and minute < 30)  # Before 8:30 AM
                is_on_time = hour < 9  # Before 9:00 AM
                
                if hour >= 9:
                    status = 'late'
                    points_earned = 0
                elif is_early:
                    status = 'early'
                    points_earned = settings.get('early_points', 5)
                else:
                    status = 'present'
                    points_earned = settings.get('on_time_points', 3)
                
                # Create attendance record
                attendance_record = {
                    'id': counters['attendance_id'],
                    'employee_id': employee_id,
                    'date': date,
                    'status': status,
                    'check_in_time': current_time.strftime('%H:%M:%S'),
                    'check_out_time': None,
                    'points_earned': points_earned,
                    'is_early': is_early,
                    'is_on_time': is_on_time,
                    'created_at': current_time.isoformat()
                }
                
                attendance.append(attendance_record)
                counters['attendance_id'] += 1
                
                # Award points to employee
                employee['points'] = employee.get('points', 0) + points_earned
                
                print(f"✅ Attendance marked: {employee['name']} - {status}")
                
                return jsonify(attendance_record), 201
            
            elif action == 'check_out':
                # Check if checked in today
                if not existing:
                    return jsonify({'error': 'Must check in before checking out'}), 400
                
                # Check if already checked out
                if existing.get('check_out_time'):
                    return jsonify({'error': 'Already checked out today'}), 400
                
                # Update check-out time
                existing['check_out_time'] = current_time.strftime('%H:%M:%S')
                existing['updated_at'] = current_time.isoformat()
                
                print(f"✅ Check-out: {employee['name']}")
                
                return jsonify(existing)
            
            return jsonify({'error': 'Invalid action'}), 400
        
        except Exception as e:
            print(f"❌ Error marking attendance: {str(e)}")
            return jsonify({'error': str(e)}), 500

@app.route('/api/attendance/bulk', methods=['POST', 'OPTIONS'])
def bulk_mark_attendance():
    """Mark attendance for multiple employees"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        records = data.get('records', [])
        date = data.get('date', datetime.now().date().isoformat())
        
        created_records = []
        
        for record in records:
            employee_id = record.get('employee_id')
            status = record.get('status', 'present')
            
            # Check existing
            existing = next(
                (a for a in attendance if a['employee_id'] == employee_id and a['date'] == date),
                None
            )
            
            if existing:
                existing['status'] = status
                existing['updated_at'] = datetime.now().isoformat()
                created_records.append(existing)
            else:
                attendance_record = {
                    'id': counters['attendance_id'],
                    'employee_id': employee_id,
                    'date': date,
                    'status': status,
                    'created_at': datetime.now().isoformat()
                }
                
                attendance.append(attendance_record)
                counters['attendance_id'] += 1
                created_records.append(attendance_record)
                
                # Award points
                employee = next((e for e in employees if e['id'] == employee_id), None)
                if employee:
                    if status == 'early':
                        employee['points'] = employee.get('points', 0) + settings.get('early_points', 5)
                    elif status == 'present':
                        employee['points'] = employee.get('points', 0) + settings.get('on_time_points', 3)
        
        print(f"✅ Bulk attendance marked: {len(created_records)} records")
        
        return jsonify(created_records), 201
    
    except Exception as e:
        print(f"❌ Error bulk marking attendance: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Employee login endpoint
@app.route('/api/employee/login', methods=['POST', 'OPTIONS'])
def employee_login():
    """Employee login with default password"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        employee = next((e for e in employees if e.get('email') == email), None)
        
        if not employee:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if password matches the default password or one-time password
        if employee.get('one_time_password') == password and not employee.get('password_used'):
            print(f"✅ Employee login: {employee['name']}")
            return jsonify({
                'success': True,
                'employee': {
                    'id': employee['id'],
                    'name': employee['name'],
                    'email': employee['email'],
                    'requires_password_change': employee.get('must_change_password', True)
                }
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        print(f"❌ Error during login: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/change-password', methods=['POST', 'OPTIONS'])
def change_password():
    """Allow employee to change their password"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        employee_id = data.get('employee_id')
        new_password = data.get('new_password')
        
        employee = next((e for e in employees if e['id'] == employee_id), None)
        
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        # Update password
        employee['one_time_password'] = new_password
        employee['password_used'] = True
        employee['must_change_password'] = False
        employee['password_changed_at'] = datetime.now().isoformat()
        
        print(f"✅ Password changed: {employee['name']}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
    
    except Exception as e:
        print(f"❌ Error changing password: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Serve React app
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 PayFlow Admin System Starting...")
    print("="*60)
    print(f"\n📊 System Status:")
    print(f"   • Database: Empty (ready for your data)")
    print(f"   • Employees: {len(employees)}")
    print(f"   • Departments: {len(departments)}")
    print(f"\n🔐 Security Settings:")
    print(f"   • Default Password: {DEFAULT_PASSWORD}")
    print(f"   • All new employees use this password")
    print(f"   • Password change required on first login")
    print(f"\n💡 Getting Started:")
    print(f"   1. Create departments first")
    print(f"   2. Add employees to departments")
    print(f"   3. Configure system settings")
    print(f"\n⚙️  CORS: Enabled for all origins")
    print(f"   • Frontend can connect from any port")
    print("\n" + "="*60)
    print("✅ Server running on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000)