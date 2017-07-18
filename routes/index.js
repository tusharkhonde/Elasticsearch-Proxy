const express = require('express'),
      router = express.Router(),
      controller = require('../controllers/app.js');
      
router.get('/', controller.index);
router.get('/api/v1/doctors/search', controller.search);

module.exports = router;