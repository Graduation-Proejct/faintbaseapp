const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const { auth } = require("../utils/utils");

exports.addUserToFbAuth = async (res, email, password) => {
  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userCred = userCredential.user;
      console.log("user signed up and it's uid is:\n" + userCred.uid);
      res.send(true);
      return true;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      res.send(false);

      return false;
    });
    return true;
};
exports.login = async (req, res) => {
  await signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("user logged in and it's id is:\n" + user.uid);
      res.send(true);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      res.send(false);
    });
};
