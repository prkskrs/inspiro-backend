const express =  require("express");
const  {getAllComponent , AddComponent,UpdateComponent ,DeleteComponent} =  require('../../controllers/component.controller')
const authorization = require("../../middleware/authorization")

/**
 * Endpoint: /api/v1/component-master
 */
const router = express.Router();

router
    .route("/")
    .get(getAllComponent)
    .post(AddComponent)
    .patch(UpdateComponent);

router
    .route("/:id")
    .delete(DeleteComponent)


module.exports = router;