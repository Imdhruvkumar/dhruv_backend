import mongoose ,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    chennel:{
         type:Schema.Types.ObjectId,
         ref:"user"
    }
    },
    {
        timestamps: true
    }
)

 export const subscription = mongoose.model("Subscription",subscriptionSchema)