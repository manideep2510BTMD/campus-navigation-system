const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/auth');
const navigationRoutes = require('./src/routes/navigation');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/nav', navigationRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'CampusNav' }));

app.listen(PORT, () => {
  console.log(`\n🗺️  CampusNav Backend`);
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log(`✅ Ready to navigate!\n`);
});
