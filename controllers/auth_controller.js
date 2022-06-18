const { FirebaseError } = require("firebase/app");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const { auth } = require("../utils/utils");

exports.addUserToFbAuth = async (res, email, password) => {
  let UID = "";
  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userCred = userCredential.user;
      console.log("user signed up and it's uid is:\n" + userCred.uid);
      UID = userCred.uid;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
    });
  return UID;
};
exports.login = async (req, res) => {
  let UID = "";
  await signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("user logged in and it's id is:\n" + user.uid);
      UID = user.uid;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("error");
      console.log(error);
      UID = "error";
    });
  return UID;
};

