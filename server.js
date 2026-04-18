require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const welcomeRoutes = require('./routes/welcome');
const goodbyeRoutes = require('./routes/goodbye');

// Use routes
app.use('/api/welcome', welcomeRoutes);
app.use('/api/goodbye', goodbyeRoutes);

// Main page routes
app.get('/', (req, res) => {
    res.render('pages/index', {
        title: 'Phantom Cava - Canvas Image Generator',
        activePage: 'home'
    });
});

app.get('/welcome', (req, res) => {
    res.render('pages/welcome', {
        title: 'Welcome Image Generator',
        activePage: 'welcome'
    });
});

app.get('/goodbye', (req, res) => {
    res.render('pages/goodbye', {
        title: 'Goodbye Image Generator',
        activePage: 'goodbye'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/index', {
        title: 'Error',
        error: err.message
    });
});

app.listen(PORT, () => {
    console.log(`✨ Phantom Cava running on http://localhost:${PORT}`);
    console.log(`📝 Welcome API: http://localhost:${PORT}/api/welcome/v1`);
    console.log(`👋 Goodbye API: http://localhost:${PORT}/api/goodbye/v1`);
});