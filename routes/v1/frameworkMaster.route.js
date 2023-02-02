const express =  require("express");
const  {getAllFramework, AddFramework,UpdateFramework ,DeleteFramework} =  require('../../controllers/framework.controller')
const authorization = require("../../middleware/authorization")

/**
 * Endpoint: /api/v1/category-master
 */
const router = express.Router();

router
    .route("/")
    .get(getAllFramework)
    .post(AddFramework)
    .patch(UpdateFramework);
router
    .route("/:id")
    .delete(DeleteFramework)


module.exports = router;