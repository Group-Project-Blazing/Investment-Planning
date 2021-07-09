const { User, Investment } = require("../models");
const axios = require("axios");

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
  }
  static getCryptoPrices(req, res, next) {
    let prices = {};
    let btc = axios.get(
        `https://api.lunarcrush.com/v2?data=assets&key=${process.env.LUNAR_API_KEY}&symbol=BTC`
      ),
      xrp = axios.get(
        `https://api.lunarcrush.com/v2?data=assets&key=${process.env.LUNAR_API_KEY}&symbol=XRP`
      ),
      eth = axios.get(
        `https://api.lunarcrush.com/v2?data=assets&key=${process.env.LUNAR_API_KEY}&symbol=ETH`
      ),
      doge = axios.get(
        `https://api.lunarcrush.com/v2?data=assets&key=${process.env.LUNAR_API_KEY}&symbol=DOGE`
      );
    Promise.all([btc, xrp, eth, doge])
      .then((results) => {
        results.forEach((result) => {
          prices[result.data.data[0].symbol] =
            result.data.data[0].price * 14000;
        });
        res.status(200).json({ results: JSON.stringify(prices) });
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }

  static getStocksPrices(req, res, next) {
    let stocks = {};
    let stocks_list = [];
    let api_header = {
      "x-rapidapi-key": process.env.RAPID_API_YAHOO_FINANCE_KEY,
      "x-rapidapi-host": process.env.RAPID_API_YAHOO_FINANCE_HOST,
    };

    let bbca = axios.get(
        "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary",
        {
          params: { symbol: "BBCA.JK" },
          headers: api_header,
        }
      ),
      arto = axios.get(
        "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary",
        {
          params: { symbol: "ARTO.JK" },
          headers: api_header,
        }
      ),
      unvr = axios.get(
        "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary",
        {
          params: { symbol: "UNVR.JK" },
          headers: api_header,
        }
      ),
      bmri = axios.get(
        "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary",
        {
          params: { symbol: "BMRI.JK" },
          headers: api_header,
        }
      );

  Promise.all([bbca, arto, unvr,bmri])
    .then(result => {
      result.forEach((result) =>{
        stocks[result.data.price.symbol] = result.data.price.regularMarketPrice.raw
      })
      res.status(200).json(JSON.stringify(stocks));
    })
    .catch(err => {
      res.status(500).json(err)
    })
  }
}

module.exports = InvestmentController;
