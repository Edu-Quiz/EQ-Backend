import User from "../models/UserModel.js";
import Professor from "../models/ProfessorModel.js";
import Student from "../models/StudentModel.js";
import Group from "../models/GroupModel.js";
import Assignment from "./AssignmentModel.js";
import AssignmentQuestion from "./AssignmentQuestionModel.js"
import StudentScore from "./StudentScoreModel.js";

User.hasOne(Professor, { foreignKey: 'user_id' });
User.hasOne(Student, { foreignKey: 'user_id' });
Professor.hasMany(Group, { foreignKey: 'professor_id' });
Student.belongsToMany(Group, { through: 'Group_Student', foreignKey: 'student_id' });
Group.belongsToMany(Student, { through: 'Group_Student', foreignKey: 'group_id' });
Group.hasMany(Assignment, { foreignKey: 'group_id', onDelete: 'CASCADE' });
Group.belongsTo(Professor, { foreignKey: 'professor_id' });
Assignment.hasMany(AssignmentQuestion, { onDelete: 'CASCADE' });
Assignment.hasMany(StudentScore);
AssignmentQuestion.belongsTo(Assignment);
StudentScore.belongsTo(Student);
StudentScore.belongsTo(Assignment);

export {
  AssignmentQuestion,
  StudentScore,
  Assignment,
  User,
  Professor,
  Student,
  Group,
};