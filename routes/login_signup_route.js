const express = require("express");
const dbController = require("../controllers/db_controller");
const router = express.Router();
const auth_controller = require("../controllers/auth_controller");

//takes user's data and checks if it's valid. then if it's a caretaker type, it adds the user to the db. sends true if it's a valid and/or it's added.
router.post("/signup", dbController.signup);

//sends the user's data
router.post("/user_data", dbController.getDatabaseUser);

// //takes the user's data of type patient and adds it
// router.post('/signup_patient_user',);

//takes the login credentials and checks if it's true and then login and sends true
router.post("/login", dbController.login);

//takes the user's data of type patient and modifies it in the database (adding a caretaker related to this patient) and sends true if it's added.
router.post("/add_caretaker", dbController.addCareTaker);

router.post("/user_by_email", dbController.getUserForFD);

router.post("/is_auth", auth_controller.isAuth);

module.exports = router;
