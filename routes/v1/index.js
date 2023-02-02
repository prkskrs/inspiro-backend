const express = require("express");
const { sendSuccessApiResponse } = require("../../middleware/successApiResponse");
const authRoute = require("./auth.route");
const typeRoute = require("./typeMaster.route");
const tagRoute = require("./tagMaster.route")
const categoryRoute = require("./categoryMaster.route")
const frameworkRoute = require('./frameworkMaster.route')
const pageRoute = require("./pagesMaster.route")
const componentRoute = require('./componentMaster.route')
const websiteRoute = require('./website.route')
const fetchURIRoute = require('./fetchURI.route');
const UserRoute = require('./user.route')
const landingPage = require('./landing.page.route')


const { authorization } = require("../../middleware/authorization");
const PagesMaster = require("../../model/PagesMaster");
/**
 * Endpoint: /api/v1
 */
const router = express.Router();

router.use("/auth", authRoute);
router.use("/type-master",authorization,typeRoute);
router.use("/tag-master",authorization,tagRoute)
router.use("/category-master",authorization,categoryRoute)
router.use("/framework-master",authorization,frameworkRoute)
router.use("/pages-master",authorization,pageRoute)
router.use("/components-master",authorization,componentRoute)
router.use("/website",authorization,websiteRoute)
router.use("/fetch",authorization,fetchURIRoute);
router.use("/user",authorization,UserRoute);
router.use("/landingpage",landingPage);

router.get("/", (req, res) => {
    const response = sendSuccessApiResponse({ message: "Inspiro - V1 API is running" });
    res.status(200).send(response);
});

module.exports = router;
