const express = require('express');
const router = express.Router();

const {
    getMenu,
    getAllMenu,
    addMenuItem,
    updateMenuItem,
    disableMenuItem,
    enableMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');

// GET available menu
router.get('/', getMenu);

// GET all menu
router.get('/all', getAllMenu);

// CREATE
router.post('/', addMenuItem);

// UPDATE
router.put('/:id', updateMenuItem);

// DELETE
router.delete('/:id', deleteMenuItem);

// keep your old style (for now)
router.put('/:id/disable', disableMenuItem);
router.put('/:id/enable', enableMenuItem);

module.exports = router;