import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'

const productsCollection = 'Products';

const productsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return typeof value === 'string' && value.trim().length > 0 && isNaN(value);
            }
        },
    },
    description: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return typeof value === 'string' && value.trim().length > 0 && isNaN(value);
            }
        },
    },
    code: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return typeof value === 'string' && value.trim().length > 0 && isNaN(value);
            }
        },
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: (value) => {
                return typeof value === 'number';
            }
        },
    },
    status: {
        type: Boolean,
        required: true,
        validate: {
            validator: (value) => {
                return typeof value === 'boolean';
            }
        },
    },
    stock: {
        type: Number,
        required: true,
        validate: {
            validator: (value) => {
                return typeof value === 'number';
            }
        },
    },
        category: {
            type: String,
            required: true,
            validate: {
                validator: (value) => {
                    return typeof value === 'string' && value.trim().length > 0 && isNaN(value);
                }
            },
        },
        thumbnails: {
            type: Array,
            required: true
        },

    });
    productsSchema.plugin(mongoosePaginate)

export const productModel = mongoose.model(productsCollection, productsSchema);