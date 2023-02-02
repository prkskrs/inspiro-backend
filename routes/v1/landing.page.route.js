const express =  require("express");

const router = express.Router();

/**
 * Endpoint: /api/v1/landingpage
 */

const  { getLimitedWebsite, filteredWebsites} =  require('../../controllers/landing.page.controller')
const authorization = require("../../middleware/authorization");
router
    .route("/websitesLanding")
    .get(getLimitedWebsite)

router
    .route("/filteredWebsites")
    .get(filteredWebsites)
module.exports = router;