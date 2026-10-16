
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/employeeController");

const {
  validateEmployee,
  validateParamId,
  validateQueryId,
  checkValidation
} = require("../validators/employeeValidator");

router.use(auth);

router.get("/employees", controller.listEmployees);

router.post(
  "/employees",
  validateEmployee(false),
  checkValidation,
  controller.createEmployee
);

router.get(
  "/employees/:eid",
  validateParamId,
  checkValidation,
  controller.getEmployee
);

router.put(
  "/employees/:eid",
  validateParamId,
  validateEmployee(true),
  checkValidation,
  controller.updateEmployee
);

router.delete(
  "/employees",
  validateQueryId,
  checkValidation,
  controller.deleteEmployee
);

module.exports = router;
