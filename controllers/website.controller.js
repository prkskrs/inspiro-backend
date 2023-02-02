const { default: mongoose, Mongoose } = require('mongoose');
const { createCustomError } = require('../errors/customAPIError');
const { sendSuccessApiResponse } = require('../middleware/successApiResponse');
const TypeMaster = require('../model/TypeMaster');
const User = require('../model/User');
const WebsiteMaster = require('../model/WebsiteMaster');
const FrameworkMaster = require('../model/FrameworkMaster')
const Category = require("../model/CategoryMaster")
const Tag = require("../model/TagMaster");
const TagMaster = require('../model/TagMaster');
const APIFeatures = require('../util/APIfeature');



const addWebsite = async(req, res, next)=>{
    try{
        const {
            url,
            Colors,
            FontFamily,
            autoFetchDesktop,
            autoFetchMobile
        } = req.body
        let filename = req.files;

        const isWebsite = await WebsiteMaster.findOne({url:url});
        console.log(isWebsite)

        if(isWebsite){
            const result = await User.findOne({_id:req.user.userId,Websites:mongoose.Types.ObjectId(isWebsite._id)});
            // console.log(result)
            if(result){
                isWebsite.Colors = Colors;
                isWebsite.FontFamily = FontFamily;
                isWebsite.DesktopSS = [];
                isWebsite.MobileSS = [];
                await isWebsite.save();
                if(filename.DesktopSS){
                    for(let i = 0; i<filename.DesktopSS.length ;i++){
                        isWebsite.DesktopSS.push("/public/WebsiteSS/"+filename.DesktopSS[i].originalname)
                    }
                }
                if(filename.MobileSS){
                    for(let i = 0; i<filename.MobileSS.length ;i++){
                        isWebsite.MobileSS.push("/public/WebsiteSS/"+filename.MobileSS[i].originalname)
                    }
                }
                if(autoFetchDesktop) isWebsite.DesktopSS.push(autoFetchDesktop);
                if(autoFetchMobile) isWebsite.MobileSS.push(autoFetchMobile);
                await isWebsite.save();
                return res.json(isWebsite);
            }
            else  return  next(createCustomError("Website Already Exist",400));
        }
        const website = await WebsiteMaster.create({url:url})
        console.log(filename)
        if(filename.DesktopSS){
            for(let i = 0; i<filename.DesktopSS.length ;i++){
                website.DesktopSS.push("/public/WebsiteSS/"+filename.DesktopSS[i].originalname)
            }
        }
        if(filename.MobileSS){
            for(let i = 0; i<filename.MobileSS.length ;i++){
                website.MobileSS.push("/public/WebsiteSS/"+filename.MobileSS[i].originalname)
            }
            await website.save();
        }
        if(autoFetchDesktop) website.DesktopSS.push(autoFetchDesktop);
        if(autoFetchMobile) website.MobileSS.push(autoFetchMobile);
        website.Colors = Colors;
        website.FontFamily = FontFamily;
        const isUser = await User.findById(req.user.userId);
        isUser.Websites.push(website._id);
        website.Addedby = req.user.userId;
        await isUser.save();
        await website.save()
        // await isUser.save()
        res.json(website)
    }
    catch(err){
        next(createCustomError(err,400));
    }
}
const updateWebsite = async (req, res, next)=>{
    try{
        let {
            id,
            url,
            uploadedurl,
            MobileSSLength,
            Colors,
            FontFamily,
            MarketplaceLink,
            Price,
            Framework,
            Type,
            Categorys,
            Tags,
            AssociatedPages,
            pageURL,
            MyCategory,
            SubCategory,
        } = req.body
        const step = req.query.step;
        console.log(step)
        const website = await WebsiteMaster.findById(mongoose.Types.ObjectId(id));
        // console.log(website)
        if(!website){
            return next(createCustomError("Not Found",404))
        }
        if(website.Addedby.toString() != req.user.userId.toString() ){
            return next(createCustomError("Cannot Update other's website",404))
        }
        switch (step) {
            case "2":
                await WebsiteMaster.findByIdAndUpdate(id,{
                    Type:Type,
                    Framework:Framework,
                    MarketplaceLink:MarketplaceLink,
                    Price:Price
                })
                const isType =await TypeMaster.findOne({_id:Type.id,Websites:id})
                if(!isType) await TypeMaster.findOneAndUpdate({_id:Type.id},{$push:{Websites:id}})
                if(Framework){
                    const isFrame = await FrameworkMaster.findOne({_id:Framework.id,Websites:id})
                    if(isFrame) await FrameworkMaster.findOneAndUpdate({_id:Framework.id},{$push:{Websites:id}})
                }
                break;
            case "3":
                for(let i = 0; i < Categorys.length ; i++){
                    const isCategory = await WebsiteMaster.findOne({_id:id,Categorys:Categorys[i]})
                    if(!isCategory) await WebsiteMaster.findOneAndUpdate({_id:id},{$push:{Categorys:Categorys[i]}})
                }
                for(let i = 0; i < Categorys.length ; i++){
                    const isCategory = await Category.findOne({_id:Categorys[i].id,Websites:id})
                    if(!isCategory) await Category.findOneAndUpdate({_id:Categorys[i].id},{$push:{Websites:id}})
                }
                break;
            case "4":
                for(let i = 0; i < Tags.length ; i++){
                    const isTag = await WebsiteMaster.findOne({_id:id,Tags:Tags[i]})
                    if(!isTag) await WebsiteMaster.findOneAndUpdate({_id:id},{$push:{Tags:Tags[i]}})
                }
                for(let i = 0; i < Tags.length ; i++){
                    const isTag = await Tag.findOne({_id:Tags[i].id,Websites:id})
                    if(!isTag) await Tag.findOneAndUpdate({_id:Tags[i].id},{$push:{Websites:id}})
                }
                break;
            case "5":
                for(let i = 0; i < AssociatedPages.length ; i++){
                    const isPage = await WebsiteMaster.findOne({_id:id,AssociatedPages:AssociatedPages[i]})
                    if(!isPage) await WebsiteMaster.findOneAndUpdate({_id:id},{$push:{AssociatedPages:AssociatedPages[i]}})
                }
                break;
            case "6":
                website.AssociatedComponent = [];
                await website.save();
                pageURL = JSON.parse(pageURL)
                MyCategory = JSON.parse(MyCategory)
                SubCategory = JSON.parse(SubCategory)
                uploadedurl = JSON.parse(uploadedurl);
                let filename = req.files;
                console.log(filename)
                let i = 0;
                let k = uploadedurl.length/2;

                for(i=0 ,j=0 ; i< uploadedurl.length ; i=i+2,j++){
                    const toAdd = {
                        pageURL:pageURL[j],
                        Category:MyCategory[j],
                        SubCategory:SubCategory[j],
                        DesktopSS:uploadedurl[i],
                        MobileSS:uploadedurl[i+1]
                    }
                    website.AssociatedComponent.push(toAdd)
                    await website.save()
                }
                if(filename.DesktopSS){
                    for(i = 0 ; i< (filename.DesktopSS.length);i++){
                        // const Desktopchunk =[];
                        // const Mobilechunk = [];
                        // console.log(DesktopSSLength[i])
                        // console.log(DesktopSSLength[i+1])
                        // for(let j = DesktopSSLength[i];j < DesktopSSLength[i+1] ;j++){
                        //     Desktopchunk.push("/public/WebsiteSS/"+filename.DesktopSS[i].originalname)
                        // // }
                        // // for(let j = MobileSSLength[i];j < MobileSSLength[i+1] ;j++){
                        //     Mobilechunk.push("/public/WebsiteSS/"+filename.MobileSS[i+1].originalname)
                        // // }

                        const toAdd = {
                            pageURL:pageURL[i+k],
                            Category:MyCategory[i+k],
                            SubCategory:SubCategory[i +k],
                            DesktopSS:"/public/WebsiteSS/"+filename.DesktopSS[i].originalname,
                            MobileSS:"/public/WebsiteSS/"+filename.MobileSS[i].originalname
                        }

                        website.AssociatedComponent.push(toAdd)
                        await website.save()
                        // console.log(website.AssociatedComponent); 
                    }
                }
                break;
            default:
                return next(createCustomError("Step Not defined",400));
        }
        const response = sendSuccessApiResponse(website)
        res.status(200).json(response);
    }
    catch(err){
        console.log(err)
        next(createCustomError(err,400));
    }
}
const publishWebsite = async(req, res, next)=>{
    try{
        const id = req.params.id;
        const website = await WebsiteMaster.findById(id);
        console.log(website)
        for(let i = 0 ; i < website.Tags.length; i++){
            const tag = await TagMaster.findById(website.Tags[i].id)
            tag.count++;
            await tag.save()
        }
        for(let i = 0; i < website.Categorys.length; i++){
            const category = await Category.findById(website.Categorys[i].id)
            category.count++;
            await category.save();
        }
        const type = await TypeMaster.findById(website.Type.id);
        type.count++;
        await type.save()
        const frame = await FrameworkMaster.findById(website.Framework.id);
        if(frame){
            frame.count++;
            await frame.save();
        }
        website.isActive = true;
        await website.save()
        const response = sendSuccessApiResponse(`Website pubished`)
        res.status(200).json(response);
    }
    catch(err){
        console.log(err)
        next(createCustomError(err,400));
    }
}
const getWebsite = async (req, res, next)=>{
    try{
        const id = req.params.id;
        const website = await WebsiteMaster.findById(id)
        if(!website){
            return next(createCustomError("Not Found",404));
        }
        const response = sendSuccessApiResponse(website);
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}
const geUrltWebsite = async (req, res, next)=>{
    try{
        const url = req.body.url;
        const website = await WebsiteMaster.find({url:url}) 
        if(!website){
            return next(createCustomError("Not Found",404));
        }
        const response = sendSuccessApiResponse(website);
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}
const softdeleteWebsite = async (req, res, next)=>{
    try{
        const id = req.params.id;
        const website = await WebsiteMaster.findById(id);
        if(!website){
            return next(createCustomError("Not Found",404))
        }
        if(website.Addedby.toString() != (req.user.userId) ){
            return next(createCustomError("Cannot Delete other's website",401))
        }
        website.isActive = false;
        await website.save();
        await User.updateOne({_id:req.user.userId},{$pull:{Websites:id}})
        const response = sendSuccessApiResponse("Soft Deleted")
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}
const getAllWebsite = async(req ,res , user)=>{
    try{
        console.log(1); 
        const SearchString = ["url"]
        const isAdmin =await User.findById(req.user.userId);
        if(isAdmin.role !='Admin'){
            return next(createCustomError(`${req.user.userId} is not Admin`,401));
        }
        const query = new APIFeatures(WebsiteMaster.find({isActive:true}),req.query)
        .filter()
        .sort()
        .page()
        .limit()
        .search(SearchString);
        const data = await query.query;
        const getCount = await WebsiteMaster.countDocuments({isActive:true});
        const response = sendSuccessApiResponse({data,getCount});
        res.status(200).json(response);
    }
    catch(err){
        next(createCustomError(err,400));
    }
}






module.exports = {addWebsite, updateWebsite,getAllWebsite ,getWebsite,geUrltWebsite ,publishWebsite, softdeleteWebsite}