
const { body, param, query, validationResult } = require("express-validator");

const employeeFields = [
  "first_name",
  "last_name",
  "email",
  "position",
  "salary",
  "date_of_joining",
  "department"
];

const validateEmployee = (isUpdate = false) => {
  const validators = [];

  for (const field of employeeFields) {
    let rule = body(field);

    if (isUpdate) {
      rule = rule.optional();
    } else {
      rule = rule.exists().withMessage(`${field} is required`);
    }

    if (field === "email") {
      rule = rule.isEmail().withMessage("Invalid email")
        .normalizeEmail();
    } else if (field === "salary") {
      rule = rule.isFloat({ min: 0 })
        .withMessage("Salary must be a positive number or zero")
        .toFloat();
    } else if (field === "date_of_joining") {
      rule = rule.isISO8601({ strict: true, strictSeparator: true })
        .withMessage("Invalid date");
    } else {
      rule = rule.isString()
        .withMessage(`${field} must be text`)
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage(`${field} must be 1 to 100 characters`);
    }

    validators.push(rule);
  }

  validators.push(
    body().custom((value) => {
      if (!value || Array.isArray(value) || typeof value !== "object") {
        throw new Error("Body must be a JSON object");
      }

      if (Object.keys(value).some(key => !employeeFields.includes(key))) {
        throw new Error("Unexpected employee field");
      }

      if (isUpdate && Object.keys(value).length === 0) {
        throw new Error("Provide at least one field");
      }

      return true;
    })
  );

  return validators;
};

const validateParamId = [
  param("eid").isMongoId().withMessage("Invalid employee ID")
];

const validateQueryId = [
  query("eid").isMongoId().withMessage("Invalid employee ID")
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array()
    });
  }

  next();
};

module.exports = {
  validateEmployee,
  validateParamId,
  validateQueryId,
  checkValidation
};
