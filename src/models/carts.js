import mongoose from 'mongoose';

const cartCollection = 'Carts';
const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
                quantity: { type: Number, default: 1 }
            }
        ],
        default: [],
        validate: {
            validator: Array.isArray,
            message: 'El campo "products" debe ser un array.'
        }
    }
});

export const cartModel = mongoose.model(cartCollection, cartSchema);

// const cartSchema = new mongoose.Schema({
//     products: 
//         {
//             type: [
//                 {
//                     productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//                     quantity: { type: Number, default: 1 }
//                 }
//             ],
//             required: true,
//             validate: {
//                 validator: (value) => {
//                     return Array.isArray(value) && value.length == 0;
//                 }
//             }
//         }    
// });