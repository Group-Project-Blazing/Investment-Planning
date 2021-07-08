const { User, Investment } = require("../models");

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

    User.findOne({
      where: {
        id: req.UserId,
      },
    })
      .then((result) => {
        if (result.dataValues.saldo > price) {
          User.update(
            {
              saldo: result.dataValues.saldo - price,
            },
            {
              where: {
                id: result.dataValues.id,
              },
            }
          )
            .then(() => {
              Investment.create({
                UserId: req.UserId,
                name: name,
                price: price,
              }).then((result) => {
                res.status(201).json({
                  name: result.dataValues.name,
                  price: result.dataValues.price,
                  UserId: result.dataValues.UserId,
                });
              });
            })
            .catch((err) => console.log(err));
        } else {
          throw new Error("insufficient saldo");
        }
      })
      .catch((err) => console.log(err));
  }

  static findById(req, res, next) {
    res.status(200).json(req.whishlist);
  }

  static deleteInvestment(req, res, next) {
    const { investment } = req;
    const { id } = req.params;
    let sisaSaldo;
    User.findOne({
      where: {
        id: req.UserId,
      },
    })
      .then((result) => {
        sisaSaldo = result.dataValues.saldo + investment.dataValues.price;
        return User.update(
          {
            saldo: sisaSaldo,
          },
          {
            where: {
              id: req.UserId,
            },
          }
        );
      })
      .then(() => {
        return Investment.destroy({
          where: {
            id: id,
          },
        });
      })
      .then(() => {
        res.status(200).json({
          message: "Successfully deleted wishlist",
          saldo: sisaSaldo,
        });
      })
      .catch((err) => {
        res.status(500).json(err);
      });

    // investment
    //   .destroy()
    //   .then(() => {
    //     res.status(200).json({ message: "Successfully delete Wishlist" });
    //   })
    //   .catch((err) => {
    //     res.json(500).json(err);
    //   });
  }
}

module.exports = InvestmentController;
