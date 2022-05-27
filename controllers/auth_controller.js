const { FirebaseError } = require("firebase/app");
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
      res.send({ UID: user.uid });
      return true;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      res.send({ UID: "error" });

      return false;
    });
  return true;
};
exports.login = async (req, res) => {
  await signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("user logged in and it's id is:\n" + user.uid);
      res.send({ UID: user.uid });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      res.send({ UID: "error" });
    });
};
exports.isAuth = async (req, res) => {
  try {
    const user = auth.currentUser;
    if (user !== null) {
      user.providerData.forEach((profile) => {
        console.log("Sign-in provider: " + profile.providerId);
        console.log("  Provider-specific UID: " + profile.uid);
        console.log("  Name: " + profile.displayName);
        console.log("  Email: " + profile.email);
        console.log("  Photo URL: " + profile.photoURL);
      });
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
    res.send(false);
  }
};
