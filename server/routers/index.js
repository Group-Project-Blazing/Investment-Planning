const UserController = require("../controllers/userController");
const InvestmentController = require("../controllers/investmentController");
const { authentification, authorization } = require("../middleware/auth");

const router = require("express").Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/googleLogin", UserController.googleLogin);
router.get(
  "/investments/crypto",
  authentification,
  InvestmentController.getCryptoPrices
);
router.get("/investments", authentification, InvestmentController.getAll);
router.post(
  "/investments",
  authentification,
  InvestmentController.addInvestment
);
router.delete(
  "/investments/:id",
  authentification,
  authorization,
  InvestmentController.deleteInvestment
);

module.exports = router;
