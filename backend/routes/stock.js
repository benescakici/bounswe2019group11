const express = require('express');
const router = express.Router();
const stockService = require('../services/stock');
const errors = require('../helpers/errors');
const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/', async (req, res) => {
    try {
        const response = await stockService.getAll();
        res.status(200).json(response);
    } catch (e) {
        res.sendStatus(503);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const Id = req.params.id;
        const response = await stockService.getById(Id);
        res.status(200).json(response);
    } catch (err) {
        if (err.name === 'StockNotFound') {
            res.status(400).send(err);
        } else {
            res.status(500).send(errors.INTERNAL_ERROR(err));
        }
    }
});

router.post('/:id/comment', isAuthenticated, async (req, res) => {
    try {
        const stockId = req.params.id;
        const userId = req.token && req.token.data && req.token.data._id;
        const body = req.body.body;
        await stockService.postComment(stockId, userId, body);
        res.sendStatus(200);
    } catch (err) {
        if (err.name === 'StockNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'UserNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'ValidationError') {
            const causes = [];
            for (const field in err.errors) {
                if (err.errors[field].message === 'InvalidBody') {
                    causes.push(errors.INVALID_BODY());
                } else {
                    causes.push(errors.UNKNOWN_VALIDATION_ERROR(err.errors[field]));
                }
            }
            res.status(400).send(errors.VALIDATION_ERROR(causes));
        } else {
            res.status(500).send(errors.INTERNAL_ERROR(err));
        }
    }
});

router.get('/:id/comment/:commentId', async (req, res) => {
    try {
        const stockId = req.params.id;
        const commentId = req.params.commentId;
        const comment = await stockService.getComment(stockId, commentId);
        res.status(200).send(comment);
    } catch (err) {
        if (err.name === 'CommentNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'StockNotFound') {
            res.status(400).send(err);
        } else {
            res.status(500).send(errors.INTERNAL_ERROR(err));
        }
    }
});

router.post('/:id/comment/:commentId', isAuthenticated, async (req, res) => {
    try {
        const stockId = req.params.id;
        const authorId = req.token && req.token.data && req.token.data._id;
        const commentId = req.params.commentId;
        const newBody = req.body.body;
        await stockService.editComment(stockId, authorId, commentId, newBody);
        res.sendStatus(200);
    } catch (err) {
        if (err.name === 'StockNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'CommentNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'UserNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'ValidationError') {
            const causes = [];
            for (const field in err.errors) {
                if (err.errors[field].message === 'InvalidBody') {
                    causes.push(errors.INVALID_BODY());
                } else {
                    causes.push(errors.UNKNOWN_VALIDATION_ERROR(err.errors[field]));
                }
            }
            res.status(400).send(errors.VALIDATION_ERROR(causes));
        } else {
            res.status(500).send(errors.INTERNAL_ERROR(err));
        }
    }
});

router.delete('/:id/comment/:commentId', isAuthenticated, async (req, res) => {
    try {
        const stockId = req.params.id;
        const commentId = req.params.commentId;
        const userId = req.token && req.token.data && req.token.data._id;
        await stockService.deleteComment(stockId, commentId, userId);
        res.sendStatus(200);
    } catch (err) {
        if (err.name === 'StockNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'CommentNotFound') {
            res.status(400).send(err);
        } else if (err.name === 'UserNotFound') {
            res.status(400).send(err);
        } else {
            res.status(500).send(errors.INTERNAL_ERROR(err));
        }
    }
});

router.post('/:id/alert', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.token && req.token.data && req.token.data._id;
        const direction = req.body.direction;
        const rate = req.body.rate;
        await stockService.saveAlert(id, userId, direction, rate);
        res.sendStatus(200);
    } catch (err) {
        if (err.name === 'StockNotFound' || err.name === 'UserNotFound') {
            res.status(400).send(err);
        } else {
            res.status(500).send(errors.INTERNAL_ERROR(err));
        }
    }
});

router.delete('/:id/alert/delete/:alertId', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.token && req.token.data && req.token.data._id;
        const alertId = req.params.alertId;
        await stockService.deleteAlert(id, userId, alertId);
        res.sendStatus(200);
    } catch (err) {
        if (err.name === 'StockNotFound' || err.name === 'UserNotFound' || err.name === 'AlertNotFound') {
            res.status(400).send(err);
        } else {
            res.status(500).send(errors.INTERNAL_ERROR(err));
        }
    }
});

module.exports = router;
