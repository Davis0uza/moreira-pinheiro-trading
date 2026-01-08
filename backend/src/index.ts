import * as dotenv from 'dotenv';
dotenv.config();
import app from './app';
// import { migrate } from 'drizzle-orm/node-postgres/migrator'; 
// import { db } from './db';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
