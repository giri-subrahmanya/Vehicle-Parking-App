from flask import current_app as app, request, jsonify
from flask_security import auth_required, roles_required, current_user #, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from application.database import db
from application.models import User
import re
import uuid
from datetime import datetime, timezone, timedelta

@app.route('/api/register', methods = ['POST'])
def register():
    data = request.get_json()

    key_not_found_list = []
    for i in ['name', 'email', 'password']:
        if i not in data.keys():
            key_not_found_list.append(f'"{i}" key not found.')
    
    if key_not_found_list:
        return jsonify({
            'message' : ' '.join(key_not_found_list)
        }), 400
    
    fields_validation_list = []

    if not isinstance(data['name'], str):
        fields_validation_list.append('"name" must be a string.')
    elif not re.fullmatch(r'^[A-Za-z][A-Za-z0-9]*', data['name']):
        fields_validation_list.append('Given name not valid.')
    
    if not isinstance(data['email'], str):
        fields_validation_list.append('"email" must be a string.')
    elif not re.fullmatch(r'^[a-z][a-z0-9]*@user.com', data['email']):
        fields_validation_list.append('Given email not valid.')
    
    if not isinstance(data['password'], str):
        fields_validation_list.append('"password" must be a string.')
    elif len(data['password']) < 6:
        fields_validation_list.append('Given password not valid.')
    
    if fields_validation_list:
        return jsonify({
            'message' : ' '.join(fields_validation_list) + ' ' + 'Please follow the format rules.'
        }), 400

    if User.query.filter(User.email == data['email']).first():
        return jsonify({
            'message' : '"email" already exists. Try another.'
        }), 400
    
    new_user = app.security.datastore.create_user(
        name = data['name'],
        email = data['email'],
        password = generate_password_hash(data['password']),
        roles = ['user']
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message' : 'User account has been created successfully.'
    }), 200

@app.route('/api/login', methods = ['POST'])
def login():
    data = request.get_json()

    key_not_found_list = []
    for i in ['email', 'password']:
        if i not in data.keys():
            key_not_found_list.append(f'"{i}" key not found.')

    if key_not_found_list:
        return jsonify({
            'message' : ' '.join(key_not_found_list)
        }), 400
    
    user = User.query.filter(User.email == data['email']).first()

    if not user:
        return jsonify({
            'message' : '"email" not found'
        }), 400
    
    if not check_password_hash(user.password, data['password']):
        return jsonify({
            'message' : 'Incorrect password'
        }), 400

    return({
        'id' : user.id,
        'name' : user.name,
        'email' : user.email,
        'role' : user.roles[0].name,
        'token' : user.get_auth_token(),
        'message' : 'Logged in successfully.'
    }), 200

@app.route('/api/user_detail')
@auth_required('token')
def user_detail():
    return jsonify({
        'name' : current_user.name,
        'email' : current_user.email,
        'role' : current_user.roles[0].name
    }), 200

@app.route('/api/logout', methods = ['POST'])
@auth_required('token')
def logout():
    current_user.fs_uniquifier = uuid.uuid4().hex
    db.session.commit()
    return jsonify({
        'message' : 'User logged out successfully'
    }), 200
