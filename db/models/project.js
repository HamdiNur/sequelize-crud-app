'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

module.exports= sequelize.define('project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Title cannot be null' },
      notEmpty: { msg: 'Title cannot be empty' }
    }
  },

  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      notNull: { msg: 'isFeatured flag cannot be null' },
      isIn: {
        args: [[true, false]],
        msg: 'isFeatured must be true or false'
      }
    }
  },

  productImage: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    validate: {
      notNull: { msg: 'Product images cannot be null' },
      notEmpty: { msg: 'Product images cannot be empty' }
    }
  },

  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    validate: {
      notNull: { msg: 'Price cannot be null' },
      isDecimal: { msg: 'Price must be a decimal number' },
      min: { args: [0], msg: 'Price must be greater than or equal to 0' }
    }
  },

  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Short description cannot be null' },
      notEmpty: { msg: 'Short description cannot be empty' },
      len: {
        args: [10, 255],
        msg: 'Short description must be between 10 and 255 characters'
      }
    }
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Description cannot be null' },
      notEmpty: { msg: 'Description cannot be empty' },
      len: {
        args: [20, 5000],
        msg: 'Description must be at least 20 characters'
      }
    }
  },

  productUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Product URL cannot be null' },
      notEmpty: { msg: 'Product URL cannot be empty' },
      isUrl: { msg: 'Product URL must be a valid URL' }
    }
  },

  category: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    validate: {
      // optional, but if present cannot be empty
      notEmpty: { msg: 'Category cannot be an empty array' }
    }
  },

  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    validate: {
      notEmpty: { msg: 'Tags cannot be an empty array' }
    }
  },
createdBy: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'user',
    key: 'id'
  },
  validate: {
    isInt: { msg: 'createdBy must be an integer (user id)' }
  }
},


  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },

  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  paranoid: true,
  freezeTableName: true,  // table name = 'project'
  modelName: 'project'
});

