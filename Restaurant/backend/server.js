import 'dotenv/config';
import app from './app.js';
import { initDB } from './db.js';

const PORT = process.env.PORT || 4000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 RestaurantOS API running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
