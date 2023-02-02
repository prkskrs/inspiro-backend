const express = require("express");
const  {getAllType , AddType , UpdateType ,DeleteType} =  require('../../controllers/type.controller')
const authorization = require("../../middleware/authorization")

/**
 * Endpoint: /api/v1/type-master
 */
const router = express.Router();

router
    .route("/")
    .get(getAllType)
    .post(AddType)
    .patch(UpdateType);
router
    .route("/:id")
    .delete(DeleteType)


module.exports = router;