# Pong Game Project

## Overview
This project is a Pong game based on the Ecole 42 ft_transcendence project.

### Contributors
- S. Ouelghabet (https://github.com/souelgha)
- M. Mahfoud (https://github.com/Thebelovedcookie)
- Y. Kawakita (https://github.com/yuuuuki15)
- M. Evonuk (https://github.com/mevonuk)

## Tech Stack
- Backend: Django
- Frontend: JavaScript
- Database: PostgreSQL
- Web Server: NGINX
- Containerization: Docker
- Recommended Browser: Google Chrome

## Main Features

### Game Modes
1. **Classic 2-Player Mode**
   - Two players using the same keyboard
   - Real-time multiplayer support

2. **Tournament Mode**
   - Local multiplayer for 3-8 players
   - Tournament-style battle system

3. **AI Mode**
   - Single player against AI
   - AI view updates once per second
   - Strategic but imperfect AI for balanced gameplay

4. **Multiplayer Arena Mode**
   - Circular arena for 3 players
   - Each player guards one-third of the arena circumference

### User Features
- Account registration, login, and deletion
- Username and profile image updates
- Friend management (add/remove)
- Match history tracking and display
- User dashboard with statistics

### Security Features
- Password hashing
- SQL injection protection
- Two-Factor Authentication (2FA)
- JWT-based authentication

### Multilingual Support
- Supported Languages:
  - English
  - French
  - Spanish
  - Japanese
- Language switching available during gameplay

## Game Characteristics
- Progressive difficulty with increasing ball speed
- Microservices Architecture:
  - Various game modes
  - User management
  - Online status tracking
  - Match history

## Installation and Setup
1. Clone the repository
2. Set up required environment variables
3. Build and run Docker containers
```bash
make all
```
