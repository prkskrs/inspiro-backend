const { createCustomError } = require("../errors/customAPIError")
const { sendSuccessApiResponse } = require("../middleware/successApiResponse")
const ComponentMaster = require("../model/ComponentMaster");
const APIFeatures = require('../util/APIfeature')
const getAllComponent = async(req ,res, next)=>{
    try{
        const SearchString = ["Name"];
        const query = new APIFeatures(ComponentMaster.find().populate("Addedby"),req.query)
        .filter()
        .sort()
        .page()
        .limit()
        .search(SearchString)
        const data = await query.query;
        const getCount = await ComponentMaster.countDocuments();
        const response = sendSuccessApiResponse({data,getCount})
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
};

const AddComponent = async(req ,res, next)=>{
    try{
        const Addedby = req.user.userId
        const Component = req.body.Name;
        const isComponent =await ComponentMaster.findOne({Name:Component});
        if(isComponent){
            const message = "Component Already Exist";
            return next(createCustomError(message, 301));
        }
        const doc = new ComponentMaster({
            Name:Component,
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

const UpdateComponent = async(req , res ,next)=>{
    try{
        const id = req.body.Id
        const Name = req.body.Name;
        const result = await ComponentMaster.findById(id);
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
const DeleteComponent = async(req , res ,next)=>{
    try{
        const id = req.params.id
        const result = await ComponentMaster.findByIdAndDelete(id);
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

module.exports =  {getAllComponent , AddComponent ,UpdateComponent,DeleteComponent}