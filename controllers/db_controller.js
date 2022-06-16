const { ref, set, get, update, child } = require("firebase/database");
const { dbRef, db } = require("../utils/utils");
const { UserDb } = require("../models/user");
const auth_controller = require("../controllers/auth_controller");

exports.getDatabaseUsers = async () => {
  let my_users = [];
  await get(child(dbRef, `users`))
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        console.log("database accessed");
        my_users = snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("error is:\n" + error);
    });
  return my_users;
};

exports.writeUserData = async (userId, user, password, res) => {
  console.log("writing users data");
  console.log(user);

  let _uid = await auth_controller.addUserToFbAuth(res, user._email, password);
  console.log("value returned from auth " + _uid);
  if (_uid == "error") {
    console.log("not added");
  } else {
    try {
      user._UID = _uid;
      await set(ref(db, "users/" + userId), user);
      console.log("added");
    } catch (error) {
      console.log(error);
    }
  }
  return _uid;
};

exports.editUserDataWithSending = async (
  userId,
  my_user_toUpdate,
  my_user_toSend,
  res
) => {
  try {
    await update(ref(db, "users/" + userId), my_user_toUpdate);
    console.log("updated");
    res.send(my_user_toSend);
  } catch (error) {
    console.log(error);
    console.log("not updated");
    res.send(false);
  }
};
exports.editUserData = async (userId, my_user_toUpdate, res) => {
  try {
    await update(ref(db, "users/" + userId), my_user_toUpdate);
    console.log("updated");
    res.send(true);
  } catch (error) {
    console.log(error);
    console.log("not updated");
    res.send(false);
  }
};
exports.editCareTakerData = async (userId, user) => {
  try {
    await update(ref(db, "users/" + userId), user);
    console.log("updated caretaker");
    console.log(user);
  } catch (error) {
    console.log(error);
    console.log("didn't update caretaker");
    console.log(user);
  }
};
