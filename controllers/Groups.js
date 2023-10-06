import { Professor, User, Group } from "../models/Relations.js";
import { Op } from "sequelize";

export const getGroups = async (req, res) =>{
    try {
        let response;
        if(req.role === "admin"){
            response = await Group.findAll({
                attributes:['uuid','group_name','professor_id'],
                include:[{
                    model: Professor,
                    attributes:['first_name','last_name']
                }]
            });
        }else{
            console.log(req)
            response = await Group.findAll({
                attributes:['uuid','group_name','professor_id'],
                include:[{
                    model: Professor,
                    attributes:['first_name','last_name']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getGroupById = async(req, res) =>{
    try {
        const group = await Group.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!group){
            return res.status(404).json({msg: "Datos no encontrados"})
        };
        let response;
        if(req.role === "admin"){
            response = await Group.findOne({
                attributes:['group_name'],
                where:{
                    uuid: group.uuid
                },
            });
        }else{
            response = await Group.findOne({
                attributes:['group_name'],
                where:{
                    [Op.and]:[{id: group.id}, {userId: req.userId}]
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createGroup = async(req, res) =>{
    const {group_name, professor_id} = req.body;
    try {
        await Group.create({
            group_name: group_name,
            professor_id: professor_id,
        });
        res.status(201).json({msg: "Grupo creado exitosamente"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const updateGroup = async(req, res) =>{
    try {
        const group = await Group.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!group) return res.status(404).json({msg: "Datos no encontrados"});
        const {name, price} = req.body;
        if(req.role === "admin"){
            await Group.update({name, price},{
                where:{
                    id: group.id
                }
            });
        }else{
            if(req.userId !== group.userId) return res.status(403).json({msg: "Acceso Denegado"});
            await Group.update({name, price},{
                where:{
                    [Op.and]:[{id: group.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Grupo actualizado exitosamente"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const deleteGroup = async(req, res) =>{
    try {
        const group = await Group.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!group) return res.status(404).json({msg: "Datos no encontrados"});
        const {name, price} = req.body;
        if(req.role === "admin"){
            await Group.destroy({
                where:{
                    id: group.id
                }
            });
        }else{
            if(req.userId !== group.userId) return res.status(403).json({msg: "Acceso Denegado"});
            await Group.destroy({
                where:{
                    [Op.and]:[{id: group.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Grupo eliminado exitosamente"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}