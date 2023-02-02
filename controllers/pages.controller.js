const { createCustomError } = require("../errors/customAPIError")
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const PagesMaster = require("../model/PagesMaster");
const APIFeatures = require("../util/APIfeature");

const getAllPages = async(req ,res, next)=>{
    try{
        const SearchString = ["Name"];
        const query = new APIFeatures(PagesMaster.find().populate("Addedby"),req.query)
        .filter()
        .sort()
        .page()
        .limit()
        .search(SearchString)
        const data = await query.query;
        const getCount = await PagesMaster.countDocuments();
        const response = sendSuccessApiResponse({data,getCount})
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
};

const AddPages = async(req ,res, next)=>{
    try{
        const Addedby = req.user.userId
        const Pages = req.body.Name;
        const isPages =await PagesMaster.findOne({Name:Pages})
        if(isPages){
            const message = "Pages Already Exist";
            return next(createCustomError(message, 301));
        }
        const doc = new PagesMaster({
            Name:Pages,
            Addedby:Addedby
        })
        await doc.save();
        const response = sendSuccessApiResponse(doc)
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
};

const UpdatePages = async(req , res ,next)=>{
    try{
        const id = req.body.Id
        const Name = req.body.Name;
        const result = await PagesMaster.findById(id);
        if(!result){
            const message = "Not Found";
            return next(createCustomError(message, 404));
        }
        result.Name = Name;
        result.save();
        const response = sendSuccessApiResponse(result);
        res.status(201).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}
const DeletePages = async(req , res ,next)=>{
    try{
        const id = req.params.id
        const result = await PagesMaster.findByIdAndDelete(id);
        if(!result){
            const message = "Not Found";
            return next(createCustomError(message, 404));
        }
        const response = sendSuccessApiResponse(result);
        res.status(201).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}

module.exports =  {getAllPages , AddPages ,UpdatePages,DeletePages}