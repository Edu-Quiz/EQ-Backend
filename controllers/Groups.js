import { Student, Professor, User, Group } from "../models/Relations.js";
import { Sequelize, Op, literal } from "sequelize";

export const getGroups = async (req, res) => {
  try {
    let response;

    if (req.role === "admin") {
      response = await Group.findAll({
        attributes: ['id', 'uuid', 'group_name', 'professor_id', 'image'],
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: Professor,
            attributes: ['first_name', 'last_name'],
          },
        ],
      });

      for (const group of response) {
        const studentCount = await group.countStudents();
        group.setDataValue('studentCount', studentCount);
      }
    } else if (req.role === "Profesor") {
      const professor = await Professor.findOne({
        where: {
          user_id: req.userId,
        },
      });

      if (!professor) {
        return res.status(404).json({ msg: 'Profesor no encontrado' });
      }
      const professorId = professor.id;
      response = await Group.findAll({
        attributes: ['id', 'uuid', 'group_name', 'professor_id', 'image'],
        include: [
          {
            model: Professor,
            attributes: ['first_name', 'last_name'],
          },
        ],
        where: {
          professor_id: professorId,
        },
      });
    } else if (req.role === "Alumno") {
      const student = await Student.findOne({
        where: {
          user_id: req.userId,
        },
      });

      if (!student) {
        return res.status(404).json({ msg: 'Alumno no encontrado' });
      }
      const studentId = student.id;
      response = await Group.findAll({
        attributes: ['id', 'uuid', 'group_name', 'professor_id', 'image'],
        include: [
          {
            model: Professor,
            attributes: ['first_name', 'last_name'],
          },
        ],
        where: {},
        having: literal(`id IN (SELECT group_id FROM group_student WHERE student_Id = ${studentId})`),
      });
    } else {
      response = [];
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

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
        let response = await Group.findOne({
            attributes:['group_name'],
            where:{
                uuid: group.uuid
            },
            include: [
                {
                model: Professor,
                attributes: ['id', 'first_name', 'last_name', 'user_id'],
                },
                {
                    model: Student,
                    attributes: ['id', 'first_name', 'last_name', 'user_id']
                }
            ],
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createGroup = async (req, res) => {
    const { group_name, professor_id, student_ids, image } = req.body;
    try {
      const group = await Group.create({
        group_name: group_name,
        image: image,
        professor_id: professor_id,
      });
      if (Array.isArray(student_ids) && student_ids.length > 0) {
        const students = await Student.findAll({
          where: {
            id: student_ids,
          },
        });
  
        if (students.length === 0) {
          return res.status(404).json({ msg: 'No students found.' });
        }
  
        await group.addStudents(students);
      }
  
      res.status(201).json({ msg: 'Grupo creado exitosamente' });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };

export const updateGroup = async (req, res) => {
    try {
      const group = await Group.findOne({
        where: {
          uuid: req.params.id,
        },
      });
  
      if (!group) return res.status(404).json({ msg: "Datos no encontrados" });
      const { group_name, professor_id, student_ids } = req.body;
      if (req.role === "admin") {
        if (group_name) {
          group.group_name = group_name;
        }
        if (professor_id) {
          group.professor_id = professor_id;
        }
        if (student_ids !== undefined) {
          if (Array.isArray(student_ids)) {
            const students = await Student.findAll({
              where: {
                id: student_ids,
              },
            });
  
            if (students.length === 0) {
              return res.status(404).json({ msg: "No se encontraron estudiantes" });
            }
            await group.setStudents(students);
          } else if (student_ids === 0) {
            await group.setStudents([]);
          }
        }
      } else {
        if (req.userId !== group.userId) return res.status(403).json({ msg: "Acceso Denegado" });
        if (group_name) {
          group.group_name = group_name;
        }
        if (professor_id) {
          group.professor_id = professor_id;
        }

        if (student_ids.length !== 0) {
          if (Array.isArray(student_ids)) {
            const students = await Student.findAll({
              where: {
                id: student_ids,
              },
            });
  
            if (students.length === 0) {
              return res.status(404).json({ msg: "No se encontraron estudiantes" });
            }
            await group.setStudents(students);
          } 
          } else{
            await group.setStudents([]);
        }
      }
      await group.save();
      res.status(200).json({ msg: "Grupo actualizado exitosamente" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };

export const deleteGroup = async(req, res) =>{
    try {
        const group = await Group.findOne({
          where:{
            uuid: req.params.id
          }
        });
        if(!group) return res.status(404).json({msg: "Datos no encontrados"});
        await Group.destroy({
          where:{
            id: group.id
          }
        });
        res.status(200).json({msg: "Grupo eliminado exitosamente"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}