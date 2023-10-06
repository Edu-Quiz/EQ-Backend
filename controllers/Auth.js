import User from "../models/UserModel.js";
import argon2 from "argon2";

export const Login = async (req, res) =>{
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if(!user){
        return res.status(404).json({msg: "Usuario no encontrado"})
    };
    const match = await argon2.verify(user.password, req.body.password);
    if(!match){
        return res.status(400).json({msg: "Contaseña Incorrecta"})
    };
    req.session.userId = user.uuid;
    const uuid = user.uuid;
    const first_name = user.first_name;
    const last_name = user.last_name;
    const email = user.email;
    const role = user.role;
    res.status(200).json({uuid, first_name, last_name, email, role});
}

export const Me = async (req, res) =>{
    if(!req.session.userId){
        return res.status(401).json({msg: "¡Por favor, ingrese a su cuenta!"});
    }
    const user = await User.findOne({
        attributes:['uuid','first_name','last_name','email','role'],
        where: {
            uuid: req.session.userId
        }
    });
    if(!user) return res.status(404).json({msg: "Usuario no encontrado"});
    res.status(200).json(user);
}

export const logOut = (req, res) =>{
    req.session.destroy((err)=>{
        if(err) return res.status(400).json({msg: "No puedo cerrar sesión"});
        res.status(200).json({msg: "Has cerrado sesión"});
    });
}