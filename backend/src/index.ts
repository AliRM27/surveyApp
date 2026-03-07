import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const startServer = async () => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
