import { Group, Assignment, AssignmentQuestion, Student, StudentScore, User } from "../models/Relations.js";

export const getAssignments = async (req, res) => {
  const { group_id } = req.query;
  const { role, userId } = req;

  try {
    const group = await Group.findOne({
      where: {
        uuid: group_id,
      },
      include: [
        {
          model: Student,
          attributes: ['id', 'first_name', 'last_name', 'user_id']
        }
      ],
    });

    if (!group) {
      return res.status(404).json({ msg: 'Grupo no Encontrado' });
    }

    const assignments = await Assignment.findAll({
      where: {
        group_id: group.id,
      },
    });
    
    
    for (const assignment of assignments) {
      const totalStudents = group.Students.length;
      const studentsWithScores = await StudentScore.count({
        where: {
          AssignmentId: assignment.id,
        },
      });

      if (role !== 'Alumno') {
        assignment.setDataValue('studentCount', studentsWithScores + '/' + totalStudents);
      } else {
        const student = await Student.findOne({
          where: {
            user_id: userId
          }
        })
        const studentScore = await StudentScore.findOne({
          where: {
            StudentId: student.id,
            AssignmentId: assignment.id,
          },
          attributes: ['score'],
        });

        if (studentScore) {
          assignment.setDataValue('status', 'Completado');
          assignment.setDataValue('status_color', 'green');
          assignment.setDataValue('score', studentScore.score);
        } else {
          assignment.setDataValue('status_color', 'blue');
          assignment.setDataValue('status', 'Pendiente');
          assignment.setDataValue('score', "N/A");
        }
      }
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const getAssignmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findOne({
      where: {
        uuid: id,
      },
      include: AssignmentQuestion,
    });

    if (!assignment) {
      return res.status(404).json({ msg: 'Tarea no Encontrada' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createAssignment = async (req, res) => {
  const { title, category, group_uuid, questions } = req.body;

  try {
    const group = await Group.findOne({
      where: { uuid: group_uuid }
    });

    if (!group) {
      return res.status(404).json({ msg: 'Grupo no Encontrado' });
    }

    const assignment = await Assignment.create({
      title: title,
      group_id: group.id,
      category: category
    });

    if (Array.isArray(questions) && questions.length > 0) {
      const createdQuestions = await Promise.all(
        questions.map(async (questionObj) => {
          const questionKey = Object.keys(questionObj).find(key => key.startsWith('question_'));
          const correctAnswerKey = Object.keys(questionObj).find(key => key.startsWith('correctAnswer_'));
          const question = questionObj[questionKey];
          const correctAnswer = questionObj[correctAnswerKey];
          const answers = Object.keys(questionObj)
            .filter(key => key.startsWith('answer'))
            .map(key => questionObj[key]);

          const createdQuestion = await AssignmentQuestion.create({
            question: question,
            answer1: answers[0],
            answer2: answers[1],
            answer3: answers[2],
            answer4: answers[3],
            correctAnswer: correctAnswer
          });

          return createdQuestion;
        })
      );

      await assignment.setAssignmentQuestions(createdQuestions);
    }

    res.status(201).json({ msg: 'Tarea creada Exitosamente' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  const { title, category, questions } = req.body;
  const assignmentId = req.params.id;

  try {
    const assignment = await Assignment.findOne({
      where: { uuid: assignmentId }
    });

    if (!assignment) {
      return res.status(404).json({ msg: 'Tarea no Encontrada' });
    }

    assignment.title = title;
    assignment.category = category;

    if (Array.isArray(questions) && questions.length > 0) {
      await AssignmentQuestion.destroy({
        where: { AssignmentId: assignment.id }
      });

      const createdQuestions = await Promise.all(
        questions.map(async (questionObj) => {
          const questionKey = Object.keys(questionObj).find(key => key.startsWith('question'));
          const correctAnswerKey = Object.keys(questionObj).find(key => key.startsWith('correctAnswer'));
          const question = questionObj[questionKey];
          const correctAnswer = questionObj[correctAnswerKey];
          const answers = Object.keys(questionObj)
            .filter(key => key.startsWith('answer'))
            .map(key => questionObj[key]);

          const createdQuestion = await AssignmentQuestion.create({
            question: question,
            answer1: answers[0],
            answer2: answers[1],
            answer3: answers[2],
            answer4: answers[3],
            correctAnswer: correctAnswer,
            AssignmentId: assignment.id
          });

          return createdQuestion;
        })
      );
    }

    await assignment.save();

    res.status(200).json({ msg: 'La tarea se ha Actualizado Exitosamente' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
      const assignment = await Assignment.findOne({
          where: {
            uuid: req.params.id
          }
      });
      if (!assignment) return res.status(404).json({ msg: "Assignment not found" });
      if (req.role !== "Alumno") {
          await AssignmentQuestion.destroy({
              where: {
                  AssignmentId: assignment.id
              }
          });
          await Assignment.destroy({
              where: {
                  id: assignment.id
              }
          });

          res.status(200).json({ msg: "Tarea eliminada Exitosamente" });
      } else {
          res.status(403).json({ msg: "No tienes permisos para eliminar Tareas" });
      }
  } catch (error) {
      res.status(500).json({ msg: error.message });
  }
};

export const insertStudentScore = async (req, res) => {
  const { score, assignment_id, student_id } = req.body;

  try {
      const user = await User.findOne({
        where:{
          uuid: student_id
        }
      })
      const student = await Student.findOne({
        where:{
          user_id: user.id
        }
      });
      const assignment = await Assignment.findOne({
        where:{
          uuid: assignment_id
        }
      });

      if (!student || !assignment) {
          return res.status(404).json({ msg: "Student or assignment not found" });
      }

      const studentScore = await StudentScore.create({
          StudentId: student.id,
          AssignmentId: assignment.id,
          score: score
      });

      res.status(201).json({ msg: "Score inserted successfully" });
  } catch (error) {
      res.status(500).json({ msg: error.message });
  }
};

export const getScoresForAssignment = async (req, res) => {
  const assignmentUuid = req.params.id; // Assuming the assignment UUID is passed as a URL parameter

  try {
      // Find the assignment by its UUID
      const assignment = await Assignment.findOne({
          where: { uuid: assignmentUuid }
      });

      if (!assignment) {
          return res.status(404).json({ msg: "Assignment not found" });
      }

      // Retrieve a list of all students
      const students = await Student.findAll();

      // Find scores associated with the assignment
      const scores = await StudentScore.findAll({
          where: { AssignmentId: assignment.id }
      });
      // Map the scores to students and include "N/A" for students without records
      const scoresWithNA = students.map(student => {
          const studentScore = scores.find(score => score.StudentId === student.id);
          if (studentScore) {
              return {
                  student_id: student.id,
                  score: studentScore.score,
                  student_details: student // Include student details
              };
          } else {
              return {
                  student_id: student.id,
                  score: "N/A",
                  student_details: student // Include student details
              };
          }
      });

      res.status(200).json({ scores: scoresWithNA });
  } catch (error) {
      res.status(500).json({ msg: error.message });
  }
};


