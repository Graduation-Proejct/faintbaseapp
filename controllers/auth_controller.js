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
 try{ await auth
    .getUser(req.body.uid)
    .then((userRecord) => {
      console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
      res.send(true);
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
      res.send(false);
    });}
    catch(error){
      res.send(false);
    }
};
