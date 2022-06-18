const express = require("express");
const repo = require("../repository/repo");
const router = express.Router();

//takes user's data and checks if it's valid. then if it's a caretaker type, it adds the user to the db. sends true if it's a valid and/or it's added.
router.post("/signup", repo.signup);


// takes the user's data of type patient and adds it
 router.post('/signup_patient_user',repo.signupNext);

//takes the login credentials and checks if it's true and then login and sends true
router.post("/login", repo.login);

//takes the user's data of type patient and modifies it in the database (adding a caretaker related to this patient) and sends true if it's added.
router.post("/add_caretaker", repo.addCareTaker);

router.post("/delete_caretaker", repo.deleteCareTaker);


router.post("/is_auth", repo.is_auth);

router.post("/sos_patient",repo.sos_patient);
module.exports = router;
