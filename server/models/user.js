'use strict';
const {
  Model
} = require('sequelize');

const bcrypt = require('bcrypt')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Whishlist, {foreignKey: 'UserId'})
    }
  };
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    saldo: DataTypes.INTEGER
  }, {
    sequelize,
    hooks:{
      beforeCreate:(user) => {
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(user.password, salt)

        user.password = hash
        user.saldo = 5000000
      }
    },
    modelName: 'User',
  });
  return User;
};