const express = require('express');
const { getRepositoriesForOwner } = require('../controllers/github.controller');

const router = express.Router();

router.get('/github/repositories/:owner', getRepositoriesForOwner);

module.exports = router;
