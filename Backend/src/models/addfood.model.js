const mongoose = require('mongoose');


const foodaddSchema=new mongoose.Schema({
    name:{ type:String, required:true },
    description:{ type:String, required:true },
    price:{ type:Number, required:true },
    Quantity:{ type:Number, required:true },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    },{
    timestamps:true 
});


module.exports=mongoose.model("addfood",foodaddSchema);