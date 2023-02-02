const express =  require("express");
const  {getAllCategory , AddCategory,UpdateCategory ,DeleteCategory} =  require('../../controllers/category.controller')
const authorization = require("../../middleware/authorization")

/**
 * Endpoint: /api/v1/category-master
 */
const router = express.Router();

router
    .route("/")
    .get(getAllCategory)
    .post(AddCategory)
    .patch(UpdateCategory);
router
    .route("/:id").delete(DeleteCategory)


module.exports = router;