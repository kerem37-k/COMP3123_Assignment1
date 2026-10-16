
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

const validId = (id) => mongoose.isValidObjectId(id);

const listEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ user: req.user._id });
    res.status(200).json(employees);
  } catch (error) { next(error); }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(employee);
  } catch (error) { next(error); }
};

const getEmployee = async (req, res, next) => {
  try {
    if (!validId(req.params.eid)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await Employee.findOne({
      _id: req.params.eid,
      user: req.user._id
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) { next(error); }
};

const updateEmployee = async (req, res, next) => {
  try {
    if (!validId(req.params.eid)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const allowed = [
      "first_name", "last_name", "email",
      "position", "salary", "date_of_joining", "department"
    ];

    const updates = {};
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.eid, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) { next(error); }
};

const deleteEmployee = async (req, res, next) => {
  try {
    if (!validId(req.query.eid)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await Employee.findOneAndDelete({
      _id: req.query.eid,
      user: req.user._id
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee
};
