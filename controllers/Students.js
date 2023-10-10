import { Student }  from "../models/Relations.js";

export const getStudent = async(req, res) =>{
    try {
        const response = await Student.findAll({
            attributes:['id','first_name','last_name','user_id',]
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getStudentById = async(req, res) =>{
    try {
        const response = await Student.findOne({
            attributes:['first_name','last_name'],
            where: {
                uuid: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}