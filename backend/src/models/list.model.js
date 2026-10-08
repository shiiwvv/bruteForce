import mongoose, { Schema } from "mongoose";

const listSchema = new Schema({
    title : {
        type : String,
        required : true,
    },
    description : {
        type : String,
    },
    encapsulation : {
        type : String,
        enum: ['private', 'public'],
        default: 'private', 
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    problems : [
        {
            type : Schema.Types.ObjectId,
            ref: "Problem",
        }
    ],
} , {timestamps : true});


const List = mongoose.model("List", listSchema);

export { List };

