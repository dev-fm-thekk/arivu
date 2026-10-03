import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// v1 routers
const appV1 = express.Router();

app.use('/api/v1', appV1);

app.get('/health', (req, res) => res.send('Health check ok !'));
app.get('/', (req, res) => res.send('Execution server is running !'))
export default app;


