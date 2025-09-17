'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const project = require('./project');

const user = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },

  userType: {
    type: DataTypes.ENUM('0','1','2'),
    allowNull: false,
    validate: {
      notNull: { msg: 'User type cannot be null' },
      notEmpty: { msg: 'User type cannot be empty' }
    }
  },

  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'First name cannot be null' },
      notEmpty: { msg: 'First name cannot be empty' }
    }
  },

  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Last name cannot be null' },
      notEmpty: { msg: 'Last name cannot be empty' }
    }
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'Email must be unique' },
    validate: {
      notNull: { msg: 'Email cannot be null' },
      notEmpty: { msg: 'Email cannot be empty' },
      isEmail: { msg: 'Must be a valid email address' }
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Password cannot be null' },
      notEmpty: { msg: 'Password cannot be empty' },
      len: { args: [6, 100], msg: 'Password must be at least 6 characters long' }
    }
  },

  confirmPassword: {
    type: DataTypes.VIRTUAL,
    set(value) {
      if (value !== this.password) {
        throw new AppError('Password and confirm password must be the same', 400);
      }
    }
  },

  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
  deletedAt: { type: DataTypes.DATE }

}, {
  paranoid: true,
  freezeTableName: true,
  modelName: 'user',

  hooks: {
    beforeCreate: (user) => {
      if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    },
    beforeUpdate: (user) => {
      if (user.changed('password')) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    }
  }
});

user.hasMany(project,{foreignKey:'createdBy'})
project.belongsTo(user,{foreignKey:'createdBy'})

module.exports = user;
