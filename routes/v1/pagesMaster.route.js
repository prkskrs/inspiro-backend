const express =  require("express");
const  {getAllPages , AddPages,UpdatePages ,DeletePages} =  require('../../controllers/pages.controller')
const authorization = require("../../middleware/authorization")

/**
 * Endpoint: /api/v1/pages-master
 */
const router = express.Router();

router
    .route("/")
    .get(getAllPages)
    .post(AddPages)
    .patch(UpdatePages);
router
    .route("/:id")
    .delete(DeletePages)


module.exports = router;