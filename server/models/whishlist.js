'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Whishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {foreignKey:'UserId'})
    }
  };
  Whishlist.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    image_url: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Whishlist',
  });
  return Whishlist;
};