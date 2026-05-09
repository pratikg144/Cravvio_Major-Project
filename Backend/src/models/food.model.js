const mongoose=require('mongoose');

const foodSchema=new mongoose.Schema({
    name:{ type:String, required:true },
    image:{ type:String },
    description:{ type:String },
    price: { type: Number, default: 0 },
    
    vendorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"vendor",
        required:true
    }
    },{
    timestamps:true

    
});





module.exports=mongoose.model("food",foodSchema);
