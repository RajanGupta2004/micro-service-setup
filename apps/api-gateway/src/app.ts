import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('gateway service is running fine!');
});

export default app;