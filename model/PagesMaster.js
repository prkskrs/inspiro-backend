const  mongoose = require('mongoose')
const schema = mongoose.Schema;

const PagesMasterSchema = new mongoose.Schema(
    {
        Name: {
            type: String,
            required: true,
            unique:true,
            trim: true,
        },
        Addedby: {
            type:schema.Types.ObjectId,
            ref:"User"
        },
        Websites:[{
            type:schema.Types.ObjectId,
            ref:"WebsiteMaster"
        }],
        count:{
            type:Number,
            default:0
        },
        createdAt: {
            type: Date, 
            default: Date.now(),
        },
    },
    
);

module.exports = mongoose.model("Pages", PagesMasterSchema, "Pages");
