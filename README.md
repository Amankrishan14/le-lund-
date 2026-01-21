# WebAR + Spin Wheel Integrated Experience

An interactive WebAR application featuring AR video experiences with an integrated spin-to-win lottery system. Built with React, Express.js, and PostgreSQL.

## ⚡ Quick Start (For New Setup)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd fascinoar

# 2. Install PostgreSQL (if not installed)
# macOS: brew install postgresql@14
# Ubuntu: sudo apt install postgresql postgresql-contrib
# Windows: Download from postgresql.org

# 3. Setup database
cd backend/spinwheel-backend
psql -U postgres -f setup.sql
# Enter your postgres password when prompted

# 4. Configure backend
cp env.example .env
# Edit .env and set your database password

# 5. Install and run backend
npm install
npm run dev
# Backend runs on http://localhost:5000

# 6. Open new terminal and setup frontend
cd ../../frontend/webar-frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173

# 7. Open in browser
# Navigate to http://localhost:5173
```

## 🎯 Features

### WebAR Experience
- 🎥 **Live Camera Feed**: Real-time camera background for AR effect
- 📱 **Interactive Video Cards**: Swipeable video carousel with banner graphics
- 🎬 **Two Video Experiences**:
  - SBMU (Swachh Bharat Mission Urban) - Gujarat
  - GSRTC (Gujarat State Road Transport Corporation)
- ✨ **Glassmorphic UI**: Premium frosted glass design
- 🔄 **Smooth Transitions**: No blank frames, seamless video switching
- 📲 **Mobile-First**: Optimized for touch devices

### Spin Wheel Integration
- 🎡 **Fortune Wheel**: Interactive spin-to-win lottery
- 🎁 **Multiple Prize Tiers**: Bronze Prize, Silver Prize, Gold Prize, Jackpot Prize
- 🎯 **Pity System**: Guaranteed wins after certain spins
- 📊 **Daily Caps**: Limited high-value prizes per day
- 💾 **Persistent Storage**: User data saved with localStorage
- 🏆 **Reward Popup**: Beautiful prize announcement

## 🏗️ Project Structure

```
fascinoar/
├── backend/
│   └── spinwheel-backend/
│       ├── server.js           # Express API server
│       ├── package.json
│       └── env.example
├── frontend/
│   └── webar-frontend/         # Integrated WebAR + Spin Wheel
│       ├── src/
│       │   ├── App.jsx         # Camera initialization
│       │   ├── Scene.jsx       # Main AR scene + integration logic
│       │   ├── ui/             # WebAR UI components
│       │   │   ├── ArFrame.jsx
│       │   │   ├── ArVideoFrame.jsx
│       │   │   ├── SwipeInstruction.jsx
│       │   │   ├── FloatingCTA.jsx
│       │   │   ├── SpinToWinButton.jsx
│       │   │   └── [CSS files]
│       │   ├── spinwheel/      # Spin Wheel components
│       │   │   ├── SpinWheelPage.jsx
│       │   │   ├── CustomWheel.jsx
│       │   │   ├── RewardPopup.jsx
│       │   │   └── [CSS files]
│       │   ├── utils/
│       │   │   └── userId.js   # UUID generation
│       │   └── store.js        # Zustand state management
│       ├── public/
│       │   ├── assets/banner/  # Banner images
│       │   └── videos/         # Video files
│       └── index.html
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Install PostgreSQL

#### macOS
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14

# Or download from https://postgresapp.com/
```

#### Ubuntu/Debian Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
Download and install from: https://www.postgresql.org/download/windows/

Or use the installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### 2. Configure PostgreSQL

#### Set up PostgreSQL user (if fresh install)

```bash
# Switch to postgres user (Linux/macOS)
sudo -u postgres psql

# Or on macOS with Homebrew
psql postgres

# Create a password for postgres user (if not set)
ALTER USER postgres WITH PASSWORD 'your_secure_password';

# Exit
\q
```

#### Enable local connections

Edit `pg_hba.conf` to allow local connections:

**macOS (Homebrew):** `/opt/homebrew/var/postgresql@14/pg_hba.conf`  
**Ubuntu:** `/etc/postgresql/14/main/pg_hba.conf`  
**Windows:** `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`

Add this line:
```
local   all   postgres   trust
```

Restart PostgreSQL after changes.

### 3. Create Database and Tables

#### Quick Setup (Recommended)

Use the provided SQL setup file:

```bash
# Navigate to backend directory
cd backend/spinwheel-backend

# Run the setup script
psql -U postgres -f setup.sql

# Enter your postgres password when prompted
```

This will automatically:
- Create the `lucky_draw` database
- Create all required tables
- Set up indexes
- Insert sample prize data

#### Option A: Using psql command line (Manual)

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lucky_draw;

# Connect to the new database
\c lucky_draw

# Create items table
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  weight INTEGER DEFAULT 1
);

# Create spin_history table
CREATE TABLE spin_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  item_id INTEGER NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_weight INTEGER NOT NULL,
  was_pity BOOLEAN DEFAULT FALSE,
  spin_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

# Create user_pity_counters table
CREATE TABLE user_pity_counters (
  user_id VARCHAR(255) NOT NULL,
  item_id INTEGER NOT NULL,
  counter INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

# Create indexes for better performance
CREATE INDEX idx_user_spins ON spin_history(user_id, spin_timestamp DESC);
CREATE INDEX idx_user_pity ON user_pity_counters(user_id);

# Insert sample prizes (4 tiers)
INSERT INTO items (name, weight) VALUES 
  ('Bronze Prize', 0),
  ('Silver Prize', 1),
  ('Gold Prize', 2),
  ('Jackpot Prize', 3);

# Verify tables were created
\dt

# Exit psql
\q
```

#### Option B: Using SQL file

Save the SQL commands to `setup.sql` and run:

```bash
psql -U postgres -f setup.sql
```

### 4. Verify Database Setup

```bash
# Login to PostgreSQL
psql -U postgres -d lucky_draw

# Check items
SELECT * FROM items;

# Should show:
# id |     name      | weight 
# ----+---------------+--------
#  1 | Bronze Prize  |      0
#  2 | Silver Prize  |      1
#  3 | Gold Prize    |      2
#  4 | Jackpot Prize |      3

# Exit
\q
```

### 5. Backend Setup

```bash
# Navigate to backend directory
cd backend/spinwheel-backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lucky_draw
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=5000

# Daily Win Caps
DAILY_CAP_WEIGHT_3=100
DAILY_CAP_WEIGHT_2=200
DAILY_CAP_WEIGHT_1=500
EOF

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 6. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/webar-frontend

# Install dependencies
npm install

# Create .env file (optional - defaults to localhost:5000)
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar)

## 🎮 User Flow

1. **User scans QR code** → WebAR experience opens
2. **Camera activates** → Video canvas loads
3. **After 3 seconds** → "Swipe → to see the next video" instruction appears
4. **Stays for 4 seconds** → Then fades out in 0.4 seconds
5. **After 1 second** → "Spin to Win" button appears at the top
6. **User swipes** → Switch between SBMU and GSRTC videos
7. **User clicks "Learn More"** → Opens relevant website (video-specific)
8. **User clicks "Spin to Win"**:
   - WebAR videos pause
   - Transitions to fullscreen Spin Wheel
   - User spins the wheel
   - Reward popup shows the prize
9. **User clicks "Back to AR Experience"**:
   - Returns to WebAR
   - Videos resume playing
   - UI restores to normal state

## 🔌 API Endpoints

### Backend (Port 5000)
- `GET /api/items` - Get all wheel items
- `POST /api/spin` - Record a spin
- `GET /api/pity/:userId` - Get user's pity counters
- `POST /api/pity/:userId` - Update pity counters
- `GET /api/stats/:userId` - Get user statistics
- `GET /api/daily-caps` - Get allowed weights based on daily caps

## 🎨 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **GSAP** - Animations
- **React Portal** - Render spin wheel outside AR scene

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **CORS** - Cross-origin support
- **dotenv** - Environment variables

## 📱 Browser Support

- Chrome 90+ (recommended)
- Safari 14+ (iOS 14+)
- Firefox 88+
- Requires HTTPS for camera access
- WebGL support required

## ❗ Troubleshooting PostgreSQL

### Connection Issues

**Error: "psql: could not connect to server"**
```bash
# Check if PostgreSQL is running
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Start if not running
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

**Error: "password authentication failed"**
- Check your `.env` file has the correct password
- Reset password: `ALTER USER postgres WITH PASSWORD 'new_password';`

**Error: "database does not exist"**
- Make sure you created the database: `CREATE DATABASE lucky_draw;`
- Check existing databases: `\l` in psql

**Error: "relation does not exist"**
- Make sure you ran all CREATE TABLE commands
- Check tables: `\dt` in psql
- Make sure you're connected to the right database: `\c lucky_draw`

### Port Already in Use

If port 5432 (PostgreSQL) or 5000 (Backend) is in use:

```bash
# Check what's using port 5432
lsof -i :5432

# Check what's using port 5000
lsof -i :5000

# Kill the process if needed
kill -9 <PID>
```

## 🔧 Development

### Run Both Servers

**Terminal 1 - Backend:**
```bash
cd backend/spinwheel-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend/webar-frontend
npm run dev
```

### Build for Production

```bash
cd frontend/webar-frontend
npm run build
```

Output will be in `dist/` directory.

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lucky_draw
DB_USER=postgres
DB_PASSWORD=your_password

PORT=5000

DAILY_CAP_WEIGHT_3=100
DAILY_CAP_WEIGHT_2=200
DAILY_CAP_WEIGHT_1=500
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:5000
```

## 🎯 Key Features Implemented

✅ Camera-based AR experience  
✅ Video carousel with swipe navigation  
✅ Dynamic "Learn More" links per video  
✅ Timed UI elements (swipe instruction, spin button)  
✅ Fullscreen spin wheel via React Portal  
✅ Pity system for guaranteed wins  
✅ Daily caps for rare prizes  
✅ Responsive design (mobile-first)  
✅ Reward popup with animations  
✅ Smooth video pause/resume  
✅ localStorage for user persistence  

## 📄 License

Open source - available for use and modification.

---

**Note**: This application requires HTTPS and camera permissions to function properly. The Vite dev server automatically provides HTTPS support.
