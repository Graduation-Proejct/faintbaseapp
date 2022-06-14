const { ref, set, get, update, child } = require("firebase/database");
const { dbRef, db } = require("../utils/utils");
const { UserDb } = require("../models/user");
const auth_controller = require("../controllers/auth_controller");

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
  console.log("uid is " + val);
  if (val !== "error") {
    let dbUsers = await getDatabaseUsers();
    let user_data = searchDatabaseByUID(dbUsers, val);
    console.log(user_data);
    if (user_data != false) {
      let myUsers = [];
      console.log(user_data._emailList);
      for (let i = 0; i < user_data._emailList.length; i++) {
        myUsers[i] = searchDatabaseByEmail(dbUsers, user_data._emailList[i]);
      }
      console.log(myUsers);
      let user = editUser(user_data, myUsers);
      res.send(user);
    } else {
      console.log("user is false, didn't find uid");
      error = { UID: "error" };

      res.send(error);
    }
  } else {
    uid = { UID: val };
    res.send(uid);
  }
};
exports.addCareTaker = async (req, res) => {
  await addingCareTaker(req, res);
};
exports.deleteCareTaker = async (req, res) => {
  await deleteCareTaker(req, res);
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

async function patientSignupValidate(req, res) {
  const users = await getDatabaseUsers();
  const val = isUserInDb(users, req.body.email);
  if (!val) {
    res.send(true);
  } else {
    res.send(false);
  }
}
async function userSignup(req, res) {
  const users = await getDatabaseUsers();
  let val = isUserInDb(users, req.body.email);
  console.log("is user in db? " + val);
  if (!val) {
    let my_user = new UserDb(
      req.body.name,
      req.body.email,
      req.body.phone,
      req.body.type,
      typeof req.body.emailList === "undefined" ? [] : req.body.emailList,
      typeof req.body.questions === "undefined" ? [] : req.body.questions,
      typeof req.body.medicalHistory === "undefined"
        ? ""
        : req.body.medicalHistory,
      typeof req.body.files === "undefined" ? [] : req.body.files
    );
    let uid = await writeUserData(
      users.length,
      my_user,
      req.body.password,
      res
    );
    res.send({ UID: uid });
  } else {
    console.log("user is found in database");
    res.send({ UID: "error" });
  }
}
async function getDatabaseUsers() {
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
}
function isUserInDb(users, email) {
  let flag = 0;

  for (let i = 0; i < users.length; i++) {
    if (users[i]._email === email) flag = 1;
  }
  if (flag == 1) {
    console.log("true");

    return true;
  } else {
    console.log("false");
    return false;
  }
}
async function writeUserData(userId, user, password, res) {
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
}
async function deleteCareTaker(req, res) {
  let users = await getDatabaseUsers();
  let my_user = searchDatabaseByUID(users, req.body.UID);
  console.log("my user is");
  console.log(my_user);
  if (my_user == false) {
    console.log("sending false");
    res.send(false);
  } else {
    let _emailList =
      typeof my_user._emailList === "undefined" ? [] : my_user._emailList;
    console.log("my email list before adding");
    console.log(_emailList);
    let index = -1;
    
    for (let i = 0; i < _emailList.length; i++) {
      if (req.body.emailCaretaker == _emailList[i]) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      let my_careTaker = searchDatabaseByEmail(users, req.body.emailCaretaker);
      console.log(my_careTaker);
      _emailList.splice(index, 1);

      let my_user_toUpdate = {
        _UID: req.body.UID,
        _name: my_user._name,
        _email: my_user._email,
        _phone: my_user._phone,
        _type: my_user._type,
        _emailList: _emailList,
        _questions:
          typeof my_user._questions === "undefined" ? [] : my_user._questions,
        _medicalHistory:
          typeof my_user._medicalHistory === "undefined"
            ? ""
            : my_user._medicalHistory,
        _files: typeof my_user._files === "undefined" ? [] : my_user._files,
      };

      console.log("user's caretaker list is:\n" + my_user_toUpdate._list);
      console.log(my_user_toUpdate);
      let userId = getUserId(users, my_user_toUpdate);
      console.log(userId);
      await editUserData(userId, my_user_toUpdate, res);
    }
    else {
      res.send(false);
    }
  }
}
async function addingCareTaker(req, res) {
  let users = await getDatabaseUsers();
  let my_user = searchDatabaseByUID(users, req.body.UID);
  console.log("my user is");
  console.log(my_user);
  if (my_user == false) {
    console.log("sending false");
    res.send(false);
  } else {
    let _emailList =
      typeof my_user._emailList === "undefined" ? [] : my_user._emailList;
    console.log("my email list before adding");
    console.log(_emailList);
    let check = 0;
    for (let i = 0; i < _emailList.length; i++) {
      if (req.body.emailCaretaker == _emailList[i]) {
        check = 1;
        res.send(false);
        break;
      }
    }
    if (check == 0) {
      let my_careTaker = searchDatabaseByEmail(users, req.body.emailCaretaker);
      console.log(my_careTaker);
      _emailList[_emailList.length] = my_careTaker._email;

      let my_user_toUpdate = {
        _UID: req.body.UID,
        _name: my_user._name,
        _email: my_user._email,
        _phone: my_user._phone,
        _type: my_user._type,
        _emailList: _emailList,
        _questions:
          typeof my_user._questions === "undefined" ? [] : my_user._questions,
        _medicalHistory:
          typeof my_user._medicalHistory === "undefined"
            ? ""
            : my_user._medicalHistory,
        _files: typeof my_user._files === "undefined" ? [] : my_user._files,
      };
      let my_user_toSend = {
        UID: req.body.UID,
        name: my_user._name,
        email: my_user._email,
        phone: my_user._phone,
        type: my_user._type,
        emailList: _emailList,
        questions:
          typeof my_user._questions === "undefined" ? [] : my_user._questions,
        medicalHistory:
          typeof my_user._medicalHistory === "undefined"
            ? ""
            : my_user._medicalHistory,
        files: typeof my_user._files === "undefined" ? [] : my_user._files,
      };

      console.log("user's caretaker list is:\n" + my_user_toUpdate._list);
      console.log(my_user_toUpdate);
      let userId = getUserId(users, my_user_toUpdate);
      console.log(userId);
      await editUserData(userId, my_user_toUpdate, my_user_toSend, res);
    }
  }
}

async function editUserData(userId, my_user_toUpdate, my_user_toSend, res) {
  try {
    await update(ref(db, "users/" + userId), my_user_toUpdate);
    console.log("updated");
    res.send(my_user_toSend);
  } catch (error) {
    console.log(error);
    console.log("not updated");
    res.send(false);
  }
}
async function editUserData(userId, my_user_toUpdate, res) {
  try {
    await update(ref(db, "users/" + userId), my_user_toUpdate);
    console.log("updated");
     res.send(true);
  } catch (error) {
    console.log(error);
    console.log("not updated");
    res.send(false);
  }
}
function getUserId(users, user) {
  let index = -1;
  for (let i = 0; i < users.length; i++) {
    if (users[i]._email == user._email) {
      index = i;
      break;
    }
  }
  return index;
}
function searchDatabaseByEmail(users, email) {
  for (let i = 0; i < users.length; i++) {
    if (users[i]._email == email) {
      return users[i];
    }
  }
  return false;
}
function searchDatabaseByUser(users, user) {
  for (let i = 0; i < users.length; i++) {
    if (users[i]._email == user.email || users[i]._email == user._email) {
      return users[i];
    }
  }
  return NaN;
}
function searchDatabaseByUID(users, UID) {
  console.log(UID);
  for (let i = 0; i < users.length; i++) {
    console.log(
      "user number " +
        i +
        " it uid is " +
        users[i]._UID +
        " while my uid is " +
        UID
    );
    if (users[i]._UID == UID) {
      return users[i];
    }
  }
  return false;
}
function editUser(user, my_list) {
  const my_user = {
    UID: user._UID,
    name: user._name,
    email: user._email,
    phone: user._phone,
    type: user._type,
    questions: typeof user._questions === "undefined" ? [] : user._questions,
    medicalHistory:
      typeof user._medicalHistory === "undefined" ? "" : user._medicalHistory,
    files: typeof user._files === "undefined" ? [] : user._files,
    list: my_list,
  };
  return my_user;
}
// function editUser(user) {
//   const my_user = {
//     UID: user._UID,
//     name: user._name,
//     email: user._email,
//     phone: user._phone,
//     type: user._type,
//     questions: typeof user._questions === "undefined" ? [] : user._questions,
//     medicalHistory:
//       typeof user._medicalHistory === "undefined" ? "" : user._medicalHistory,
//     files: typeof user._files === "undefined" ? [] : user._files,
//   };
//   return my_user;
// }
