import { Professor }  from "../models/Relations.js";

export const getProfessor = async(req, res) =>{
    try {
        const response = await Professor.findAll({
            attributes:['id','first_name','last_name','user_id',]
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getUserById = async(req, res) =>{
    try {
        const response = await User.findOne({
            attributes:['uuid','first_name','last_name','email','role'],
            where: {
                uuid: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}