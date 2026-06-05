const express = require('express');
const router = express.Router();

const {
    getUsers,
    updateUser,
    deleteUser
} = require('../controllers/userController');

router.get('/users', getUsers);

router.put('/users/:id', updateUser);

router.delete('/users/:id', deleteUser);

module.exports = router;