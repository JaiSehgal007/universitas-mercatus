import mongoose from 'mongoose'

const productSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    slug:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:mongoose.ObjectId,
        ref:'Category',
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    photo:{
        //  use use photo we will be using the package express-formidable
        // otherwise when we store the photo in the database we are not able to access it directly
        data:Buffer,
        contentType:String,
    },
    shipping:{
        // for shipping address
        type:Boolean,
    }
},{timestamps:true});

export default mongoose.model('Products',productSchema);