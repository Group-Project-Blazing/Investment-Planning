const { Investment } = require("../models");

class InvestmentController {
  static getAll(req, res, next) {
    Investment.findAll({ where: { UserId: req.UserId } })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(404).json(err);
      });
  }

  static addInvestment(req, res, next) {
    const { name, price } = req.body;

    Investment.create({
      name,
      price,
      UserId: req.UserId,
    })
      .then((result) => {
        res.status(201).json(result);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }

  static findById(req, res, next) {
    res.status(200).json(req.whishlist);
  }

  static deleteInvestment(req, res, next) {
    const { investment } = req;

    investment
      .destroy()
      .then(() => {
        res.status(200).json({ message: "Successfully delete Wishlist" });
      })
      .catch((err) => {
        res.json(500).json(err);
      });
  }
}

module.exports = InvestmentController;
