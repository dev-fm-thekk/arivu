import express from 'express';
import TestRouter from './routes/testRoute.js';
import ChallengeRouter from './routes/challengesRoute.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// v1 routers
const appV1 = express.Router();
appV1.use('/test', TestRouter);
appV1.use('/challenge', ChallengeRouter);

app.use('/api/v1', appV1);

app.get('/health', (req, res) => res.send('Health check ok !'));
app.get('/', (req, res) => res.send('Execution server is running !'))

export default app;


