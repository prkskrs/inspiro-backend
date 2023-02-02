const mongoose = require("mongoose")
const schema = mongoose.Schema;
var random = require('mongoose-simple-random');

const WebsiteMasterSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        DesktopSS:[{
            type:String
        }],
        MobileSS:[{
            type:String
        }],
        Colors:[{
            type:String
        }],
        FontFamily:[{
            type:String
        }],
        Type:{
            id:{
                type:schema.Types.ObjectId
            },
            Name:{
                type:String
            }
        },  
        Framework:{
            id:{
                type:schema.Types.ObjectId
            },
            Name:{
                type:String
            }
        },    
        MarketplaceLink:{
            type:String
        },
        Price:{
            type:Number
        },
        Categorys:[{
            id:{
                type:schema.Types.ObjectId
            },
            Name:{
                type:String
            }
        }],
        Tags:[{
            id:{
                type:schema.Types.ObjectId
            },
            Name:{
                type:String
            }
        }],
        AssociatedPages:[{
            Category:{
                value:{
                    type:schema.Types.ObjectId
                },
                label:{
                    type:String
                }
            },
            PageLink:{
                type:String
            },
        }],
        AssociatedComponent :[{
            pageURL:{
                type:String
            },
            Category:{
                value:{
                    type:schema.Types.ObjectId
                },
                label:{
                    type:String
                }
            },
            SubCategory:{
                value:{
                    type:schema.Types.ObjectId
                },
                label:{
                    type:String
                }
            },
            DesktopSS:[{
                type:String
            }],
            MobileSS:[{
                type:String
            }]
        }],
        Addedby :{
            type:schema.Types.ObjectId,
            ref:"User"
        },
        isActive :{
            type:Boolean,
            default:false
        },
        likeCount:{
            type:Number,   
            // unique:true,
            // seq: { type: Number, default: 0 }
            default:0
        },
        saveCount:{
            type:Number,   
            default:0
            // unique:true,
            // seq: { type: Number, default: 0 }
        }
    }
);

WebsiteMasterSchema.plugin(random);

const WebSiteModel = mongoose.model("Website", WebsiteMasterSchema, "Website");
module.exports = WebSiteModel;


WebsiteMasterSchema.pre('save', function (next) {
    // Only increment when the document is new
    if (this.isNew) {
        WebSiteModel.count().then(res => {
            this.likeCount = res+1; // Increment count
            next();
        });
    } else {
        next();
    }
  });
  
