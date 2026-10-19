const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const verifyToken = require('../middleware/authMiddleware');

// protect all employee routes with JWT verification
router.use(verifyToken);

// (added:) get all employees owned by the logged-in user due to postman having issues
router.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find({ user: req.user.id });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// create a new employee for the logged-in user
router.post('/employees', async (req, res) => {
    try {
        // Pass everything in req.body directly, plus the user ID
        const employee = new Employee({
            ...req.body,
            user: req.user.id 
        });

        const savedEmployee = await employee.save();
        res.status(201).json({
            message: 'Employee created successfully.',
            employee: savedEmployee
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get a single employee by ID
router.get('/employees/:eid', async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.params.eid, user: req.user.id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// update an employee by ID
router.put('/employees/:eid', async (req, res) => {
    try {
        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: req.params.eid, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }

        res.status(200).json({
            message: 'Employee updated successfully.',
            updatedEmployee
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// delete an employee by query param (?eid=xxx)
router.delete('/employees', async (req, res) => {
    try {
        const { eid } = req.query;
        const deletedEmployee = await Employee.findOneAndDelete({ _id: eid, user: req.user.id });

        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }

        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;