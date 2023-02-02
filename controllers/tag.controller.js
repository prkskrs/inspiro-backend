const { createCustomError } = require("../errors/customAPIError")
const { sendSuccessApiResponse } = require("../middleware/successApiResponse")
const Tag = require("../model/TagMaster");
const APIFeatures = require("../util/APIfeature");
const getAllTag  = async(req ,res, next)=>{
    try{
        const SearchString = ["Name"];
        const query = new APIFeatures(Tag.find().populate("Addedby"),req.query)
        .filter()
        .sort()
        .page()
        .limit()
        .search(SearchString)
        const data = await query.query;
        const getCount = await Tag.countDocuments();
        const response = sendSuccessApiResponse({data,getCount})
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}

const AddTag =async(req ,res, next)=>{
    try{
        const Addedby = req.user.userId
        const tag = req.body.Name;
        const isTag =await Tag.findOne({Name:tag});
        if(isTag){
            const message = "Tag Already Exist";
            return next(createCustomError(message, 301));
        }
        const doc = new Tag({
            Name:tag,
            Addedby:Addedby
        })
        await doc.save();
        const response = sendSuccessApiResponse(doc)
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}
const UpdateTag = async(req , res ,next)=>{
    try{
        const id = req.body.Id
        const Name = req.body.Name;
        const result = await Tag.findById(id);
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
const DeleteTag = async(req , res ,next)=>{
    try{
        const id = req.params.id
        const result = await Tag.findByIdAndDelete(id);
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
module.exports = {getAllTag , AddTag ,UpdateTag , DeleteTag}