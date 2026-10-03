import express from 'express';
import controller from '../controllers/challengesController.js';

const Router = express.Router();

Router.post('/', async (req, res) => {
    const response = await controller.createChallenge(req);
    return res.send(response);
})

Router.get('/challenge/:id', async (req, res) => {
    const response = await controller.fetchChallenge(req);
    return res.send(response);
} )

Router.get('/:id', async (req, res) => {
    const response = await controller.fetchChallengeById(req);
    return res.send(response);
})

export default Router;