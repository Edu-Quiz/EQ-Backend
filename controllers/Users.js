import { User, Professor, Student }  from "../models/Relations.js";
import argon2 from "argon2";

export const getUsers = async(req, res) =>{
    try {
        const response = await User.findAll({
            attributes:['id','uuid','first_name','last_name','email','role'],
            order: [['createdAt', 'ASC']],
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getUserById = async(req, res) =>{
    try {
        const response = await User.findOne({
            attributes:['id','uuid','first_name','last_name','email','role'],
            where: {
                uuid: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createUser = async (req, res) => {
    const { first_name, last_name, email, password, confPassword, role } = req.body;
    const hashPassword = await argon2.hash(password);
    if (password !== confPassword) {
        return res.status(400).json({ msg: "Las contraseñas no coinciden" });
    }
    try {
        const user = await User.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hashPassword,
            role: role,
        });
        if(role === 'Alumno') {
            const student = await Student.create({
                first_name: first_name,
                last_name: last_name
            });
            await user.setStudent(student);
        } else if (role === 'Profesor') {
            const professor = await Professor.create({
                first_name: first_name,
                last_name: last_name
            });
            await user.setProfessor(professor);
        }
        await user.reload();
        res.status(201).json({ msg: "Usuario Creado!" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

export const initialize = async(req, res) =>{
    const { first_name, last_name, email, password, confPassword } = req.body;
    const hashPassword = await argon2.hash(password);
    if(password !== confPassword){
        return res.status(400).json({msg: "Las contraseñas no coinciden"})
    };
    try {
        await User.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hashPassword,
            role: "admin"
        });
        res.status(201).json({msg: "Usuario Creado!"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}

export const updateUser = async(req, res) =>{
    const user = await User.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "Usuario no encontrado"});
    const { first_name, last_name, email, password, confPassword, role } = req.body;
    console.log(req)
    let hashPassword;
    if(password === "" || password === undefined ){
        hashPassword = user.password
    }else{
        hashPassword = await argon2.hash(password);
    }
    if(password !== confPassword){
        return res.status(400).json({msg: "Las contraseñas no coinciden"})
    };
    try {
        await User.update({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hashPassword,
            role: role
        },{
            where:{
                id: user.id
            }
        });
        res.status(200).json({msg: "Usuario Actualizado"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}

export const deleteUser = async(req, res) =>{
    const user = await User.findOne({
        where: {
            uuid: req.params.id
        },
        include:[
            {
                model: Professor,
                attributes:['id','first_name','last_name']
            },
            {
                model: Student,
                attributes:['id','first_name','last_name']
            }
        ]
    });
    if(!user){
        return res.status(404).json({msg: "Usuario no encontrado"})
    };
    try {
        if (user.role === 'Alumno' && user.Student) {
            await user.Student.destroy();
        }
        if (user.role === 'Profesor' && user.Professor) {
            await user.Professor.destroy();
        }
        await User.destroy({
            where:{
                uuid: user.uuid
            }
        });
        res.status(200).json({msg: "Usuario Eliminado"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}