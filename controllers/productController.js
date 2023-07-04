import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from 'fs';
import { trace } from "console";
import braintree from 'braintree'
import dotenv from 'dotenv'
// fs stands for file system,it is used for product image

dotenv.config();

// payment gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
    try {
        // console.log(req.fields);
        const { name, description, price, category, quantity } = req.fields;
        const { photo } = req.files;

        //    validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: 'Name is Required' });
            case !description:
                return res.status(500).send({ error: 'Description is Required' });
            case !price:
                return res.status(500).send({ error: 'price is Required' });
            case !category:
                return res.status(500).send({ error: 'category is Required' });
            case !quantity:
                return res.status(500).send({ error: 'quantity is Required' });
            case photo && photo.size > 1000000:
                return res.status(500).send({ error: 'Photo of size less than 1 mb is required' });
        }

        const products = new productModel({ ...req.fields, slug: slugify(name) });
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success: true,
            message: 'Product created Successfully',
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Creating Product'
        })
    }
}

export const getProductController = async (req, res) => {
    try {
        // now we do not want to increse the size of our request, so we will be using another api for photos
        // and we will merge and use it to maintain the performance of the application
        const products = await productModel.find({}).populate('category').select("-photo").limit(12).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'All Products',
            products,
            countTotal: products.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in getting Product'
        })
    }
}

// get single product
export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug }).select("-photo").populate("category");
        res.status(200).send({
            success: true,
            message: 'Single product fetched',
            product
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in getting single Product'
        })
    }
}

export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("photo");
        if (product.photo.data) {
            res.set('Content-type', product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in getting fetching photo'
        })
    }
}

export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success: true,
            message: "product deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in deleting product'
        })
    }
}


export const updateProductController = async (req, res) => {
    try {
        // console.log(req.fields);
        const { name, description, price, category, quantity } = req.fields;
        const { photo } = req.files;

        //    validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: 'Name is Required' });
            case !description:
                return res.status(500).send({ error: 'Description is Required' });
            case !price:
                return res.status(500).send({ error: 'price is Required' });
            case !category:
                return res.status(500).send({ error: 'category is Required' });
            case !quantity:
                return res.status(500).send({ error: 'quantity is Required' });
            case photo && photo.size > 1000000:
                return res.status(500).send({ error: 'Photo of size less than 1 mb is required' });
        }

        const products = await productModel.findByIdAndUpdate(req.params.pid,
            { ...req.fields, slug: slugify(name) }, { new: true }
        )

        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success: true,
            message: 'Product Updated Successfully',
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Updated Product'
        })
    }
}

export const productFilterController = async (req, res) => {
    try {
        const { checked, radio } = req.body
        let args = {};

        if (checked.length > 0) args.category = checked

        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }

        const products = await productModel.find(args);

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while filtering products',
            error
        })
    }
}

// product count
export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while product count',
            error
        })
    }
}

export const productListController = async (req, res) => {
    try {
        const perPage = 2
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel
            .find({})
            .select("-photo")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error in per page ctrl',
            error
        })
    }
}

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        // here this syntax is to find the keyword from the description or the name
        // i represents that it is case insensitive
        const results = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        }).select("-photo");
        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: 'Error in Search Product API',
            error
        })
    }
}

// similar product

export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel.find({
            category: cid,
            _id: { $ne: pid }
        }).select("-photo").limit(3).populate('category')
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log(error);
        relatedProductController.status(400).send({
            success: false,
            message: 'Error While getting Realted Product'
        })
    }
}

// get product by category
export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug });
        const products = await productModel.find({ category }).populate('category');
        res.status(200).send({
            success: true,
            category,
            products,
        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            error,
            message: 'Error While Getting Products'
        })
    }
}

// payment gateway api

// token
export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(response);
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// payment
export const braintreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body;
        let total = 0;
        cart.map((i) => { return (total += i.price) });

        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id
                    }).save()
                    res.json({ ok: true })
                } else {
                    res.status(500).send(error);
                }
            }
        )

    } catch (error) {
        console.log(error)
    }
}