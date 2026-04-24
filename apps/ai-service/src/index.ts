import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clusterRoutes from './routes/cluster';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/cluster', clusterRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: process.env.AI_PROVIDER || 'openai' });
});

app.listen(PORT, () => {
  console.log(`AI Service is running on port ${PORT}`);
});
