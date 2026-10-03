import express from 'express';
import controller from '../controllers/testsController';

const Router = express();

Router.post('/run', async (req, res) => {
    const response = await controller.runTests(req);
    return res.send(response);
})

export default Router;
