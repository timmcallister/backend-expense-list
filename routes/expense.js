const express = require('express');
const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');

const router = express.Router();

function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({sucess: false, message: 'Access denied'});

    try {
        const verified = jwt.verify(token, 'HMACSECRETKEY');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({success: false, message: 'Invalid token'});
    }
}

router.get('/', authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.userId});
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: 'Could not fetch expenses'});
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { description, amount, date } = req.body;
        const expense = new Expense({ description, amount, date, userId: req.user.userId });
        await expense.save();
        res.json(expense); 
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message:'Could not create expense'});
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: 'Could not update expense'});
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ success: true});
    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Could not delete expense'});
    }
});

module.exports = router;