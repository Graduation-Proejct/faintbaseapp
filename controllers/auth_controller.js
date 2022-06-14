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
      res.send({ UID: userCred.uid });
      return userCred.uid;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error);
      res.send({ UID: "error" });

      return 0;
    });
  return true;
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
// exports.isAuth = async (req, res) => {
//   try {
//     let check = false;
//     const user = auth.currentUser;
//     if (user !== null) {
//       user.providerData.forEach((profile) => {
//         console.log("Sign-in provider: " + profile.providerId);
//         console.log("  Provider-specific UID: " + profile.uid);
//         console.log("  Name: " + profile.displayName);
//         console.log("  Email: " + profile.email);
//         console.log("  Photo URL: " + profile.photoURL);

//         if (profile.uid == req.body.uid) {
//           res.send(true);
//           check = true;
//           console.log("true");
//         }
//       });
//       if (!check) {
//         console.log("didn't find it");
//         res.send(false);
//       }
//     } else {
//       console.log("user is null");

//       res.send(false);
//     }
//   } catch (error) {
//     console.log(error);
//     res.send(false);
//   }
// };
