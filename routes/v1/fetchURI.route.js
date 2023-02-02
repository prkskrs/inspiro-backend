const express =  require("express");
const  {fetchURI} =  require('../../controllers/fetchURI.controller')
const authorization = require("../../middleware/authorization")

/**
 * Endpoint: /api/v1/fetch
 */
const router = express.Router();

router
    .route("/")
    .post(fetchURI)


module.exports = router;