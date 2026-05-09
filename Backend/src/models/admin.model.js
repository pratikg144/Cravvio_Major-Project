const mongoose=require('mongoose')



const adminSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        
    },
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
},
{
    timestamps:true
}
)

const adminModel= mongoose.model("admin",adminSchema);
module.exports=adminModel;