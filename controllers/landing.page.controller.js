const WebsiteMaster = require('../model/WebsiteMaster');
const {WhereClause} =require("../util/whereClause.js")
const { createCustomError } = require("../errors/customAPIError")

const getLimitedWebsite = async(req,res,next)=>{
    try {
        await WebsiteMaster.findRandom({}, {}, {limit: 3}, function(err, results) {
            if (!err) {
              console.log(results); // 5 elements
            }
            return res.send(results)
          });
    } catch (error) {
        next(createCustomError(error,400))
    }
}

const filteredWebsites =  async(req,res,next)=>{
  try {
     const resultPerPage = 2;
     const totalCountWebsite = await WebsiteMaster.countDocuments()
     
     const websiteObjs = await  new WhereClause(WebsiteMaster.find(),req.query).search().filter();
     let websites = await websiteObjs.base;
     let filteredWebsiteNumber = websites.length;
 
     // pagination
     websiteObjs.pager(resultPerPage);
     websites = await websiteObjs.base.clone();
 
     res.status(200).json({
         success:true,
         websites,
         filteredWebsiteNumber,
         totalCountWebsite
     }) 

  } catch (error) {
      next(createCustomError(error,400))
  }
}

module.exports = {getLimitedWebsite,filteredWebsites}