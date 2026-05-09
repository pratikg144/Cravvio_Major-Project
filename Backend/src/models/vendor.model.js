const mongoose=require('mongoose')


const vendorSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    
    },
    CompanyName: { type: String },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    pincode:{
        type:String,
        required:true,
    }

    ,
    status: { type: String, enum: ['pending','approved','rejected','suspended'], default: 'pending' }

},
{
    timestamps:true
}
)


const vendorModel= mongoose.model("vendor",vendorSchema);

module.exports=vendorModel;


