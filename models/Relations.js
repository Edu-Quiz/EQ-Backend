import User from "../models/UserModel.js";
import Professor from "../models/ProfessorModel.js";
import Student from "../models/StudentModel.js";
import Group from "../models/GroupModel.js";

User.hasOne(Professor, { foreignKey: 'user_id' });
User.hasOne(Student, { foreignKey: 'user_id' });
Professor.hasMany(Group, { foreignKey: 'professor_id' });
Student.belongsToMany(Group, { through: 'Group_Students', foreignKey: 'student_id' });
Group.belongsTo(Professor, { foreignKey: 'professor_id' });

export {
  User,
  Professor,
  Student,
  Group,
};