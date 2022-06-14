const { ref, set, get, update, child } = require("firebase/database");
const { dbRef, db } = require("../utils/utils");
const { UserDb } = require("../models/user");
const auth_controller = require("../controllers/auth_controller");
const dbController = require("../controllers/db_controller");

exports.signup = async (req, res) => {
  console.log(req.body);
  if (req.body.type === "caretaker") {
    await userSignup(req, res);
  } else {
    await patientSignupValidate(req, res);
  }
};

exports.signupNext = async (req, res) => {
  console.log(req.body);

  await userSignup(req, res);
};

exports.login = async (req, res) => {
  let val = await auth_controller.login(req, res);
};
exports.addCareTaker = async (req, res) => {
  await addingCareTaker(req, res);
};
exports.is_auth = async (req, res) => {
  let check = false;
  const users = await getDatabaseUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i]._UID == req.body.UID) {
      check = true;
    }
  }
  if (check) {
    res.send(true);
  } else {
    res.send(false);
  }
};
