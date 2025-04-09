import Products from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize";

export const getProducts = async (req, res) => {
    try {
        let response;
        if (req.role === "admin"){
            response = await Products.findAll({
                attributes: ['uuid', 'name', 'price'],
                include:[{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }else{
            response = await Products.findAll({
                attributes: ['uuid', 'name', 'price'],
                where: {
                    userId: req.userId
                },
                include:[{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!product) return res.status(404).json({msg: "Data Tidak Ditemukan"});
        let response;
        if (req.role === "admin"){
            response = await Products.findOne({
                attributes: ['uuid', 'name', 'price'],
                where: {
                    id: req.params.id
                },
                include:[{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }else{
            response = await Products.findOne({
                attributes: ['uuid', 'name', 'price'],
                where: {
                    [Op.and]: [{id: req.params.id}, {userId: req.userId}]
                },
                include:[{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createProduct = async (req, res) => {
    const {name, price} = req.body;
    try {
        await Products.create({
            name: name,
            price: price,
            userId: req.userId
        });
        res.status(201).json({msg: "Product Created"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const updateProduct = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!product) return res.status(404).json({msg: "Data Tidak Ditemukan"});
        const {name, price} = req.body;
        if (req.role === "admin"){
            await Products.update({
                name: name,
                price: price
            },{
                where: {
                    id: product.id
                }
            });
        }else{
            if (req.userId !== product.userId) return res.status(403).json({msg: "Akses ditolak karena anda bukan pemilik data"});
            await Products.update({
                name: name,
                price: price
            },{
                where: {
                    [Op.and]: [{id: req.params.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Product Updated Successfully"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!product) return res.status(404).json({msg: "Data Tidak Ditemukan"});
        const {name, price} = req.body;
        if (req.role === "admin"){
            await Products.destroy({
                name: name,
                price: price
            },{
                where: {
                    id: product.id
                }
            });
        }else{
            if (req.userId !== product.userId) return res.status(403).json({msg: "Akses ditolak karena anda bukan pemilik data"});
            await Products.destroy({
                name: name,
                price: price
            },{
                where: {
                    [Op.and]: [{id: req.params.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Product Deleted Successfully"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}