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
exports.getUserForFD = async (req, res) => {
  const users = await getDatabaseUsers();
  let user = searchDatabaseByEmail(users, req.body.email);
  user = editUser(user);
  res.send(user);
};

exports.login = async (req, res) => {
  let val = await auth_controller.login(req, res);
  if (val !== "error") {
    let dbUsers = getDatabaseUsers();
    let user_data = searchDatabaseByUID(dbUsers, val);
    let myUsers = [];
    for (let i = 0; i < user_data._emailList.length; i++) {
      myUsers[i] = searchDatabaseByEmail(dbUsers, user_data._emailList[i]);
    }
    let user = editUser(user_data, myUsers);
    res.send(user);
  } else {
    uid = { UID: val };
    res.send(uid);
  }
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
exports.getDatabaseUser = async (req, res) => {
  const users = await getDatabaseUsers();
  let index = -1;
  console.log("required email to find is: " + req.body.email);
  console.log("database length is " + users.length);
  for (let i = 0; i < users.length; i++) {
    if (users[i]._email === req.body.email) index = i;
  }
  if (index >= 0) {
    console.log("found user in database and returning it");
    const my_user = {
      name: users[index]._name,
      email: users[index]._email,
      phone: users[index]._phone,
      type: users[index]._type,
      emailList:
        typeof users[index]._emailList === "undefined"
          ? []
          : users[index]._emailList,
      questions:
        typeof users[index]._questions === "undefined"
          ? []
          : users[index]._questions,
      medicalHistory:
        typeof users[index]._medicalHistory === "undefined"
          ? ""
          : users[index]._medicalHistory,
      files:
        typeof users[index]._files === "undefined" ? [] : users[index]._files,
    };

    res.send(my_user);
  } else {
    console.log("didn't find user in database and returning false");
    return false;
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
    await writeUserData(users.length, my_user, req.body.password, res);
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
  if (_uid == "") {
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
}

async function addingCareTaker(req, res) {
  let users = await getDatabaseUsers();
  let my_user = searchDatabaseByEmail(users, req.body.email);
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
    console.log(req.body.list);

    let check = 0;
    for (let i = 0; i < _emailList.length; i++) {
      for (let j = 0; j < req.body.list.length; j++) {
        if (req.body.list[j].email == _emailList[i]) {
          console.log("email is already in the list");
          check = 1;
          res.send(false);
          break;
        }
      }
      if ((check = 1)) break;
    }
    if (check == 0) {
      for (let i = _emailList.length; i < req.body.list.length; i++) {
        let my_careTaker = searchDatabaseByUser(users, req.body.list[i]);
        console.log(my_careTaker);
        _emailList[i] = my_careTaker._email;
      }
      let my_user_toUpdate = new UserDb(
        my_user._name,
        my_user._email,
        my_user._phone,
        my_user._type,
        _emailList,
        typeof my_user._questions === "undefined" ? [] : my_user._questions,
        typeof my_user._medicalHistory === "undefined"
          ? ""
          : my_user._medicalHistory,
        typeof my_user._files === "undefined" ? [] : my_user._files
      );
      console.log("user's caretaker list is:\n" + my_user._list);
      console.log(my_user_toUpdate);
      let userId = getUserId(users, my_user_toUpdate);
      console.log(userId);
      await editUserData(userId, my_user_toUpdate, res);
    }
  }
}

async function editUserData(userId, my_user, res) {
  try {
    await update(ref(db, "users/" + userId), my_user);
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
  for (let i = 0; i < users.length; i++) {
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
function editUser(user) {
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
  };
  return my_user;
}
