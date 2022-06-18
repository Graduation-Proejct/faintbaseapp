const { ref, set, get, update, child } = require("firebase/database");
const { dbRef, db } = require("../utils/utils");
const { UserDb } = require("../models/user");
const auth_controller = require("../controllers/auth_controller");
const dbController = require("../controllers/db_controller");

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
    let dbUsers = await dbController.getDatabaseUsers();
    let user_data = searchDatabaseByUID(dbUsers, val);
    console.log(user_data);
    if (user_data != false) {
      let myUsers = [];
      console.log(user_data._emailList);
      if (user_data._emailList != undefined) {
        for (let i = 0; i < user_data._emailList.length; i++) {
          myUsers[i] = searchDatabaseByEmail(dbUsers, user_data._emailList[i]);
        }
      }
      console.log(myUsers);
      user_data.list = myUsers;
      let user = editUser(user_data);
      console.log(user);
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
  const users = await dbController.getDatabaseUsers();
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
exports.sos_patient = async (req, res) => {
  let UID = req.body.UID;
  let users = await dbController.getDatabaseUsers();
  let careTaker = searchDatabaseByUID(users, UID);
  let emailList =
    typeof careTaker._emailList === "undefined" ? [] : careTaker._emailList;
  console.log(emailList);
  if (emailList.length > 0) {
    let patient = searchDatabaseByEmail(users, emailList[0]);
    let user = editUser(patient);
    res.send(user);
  } else {
    res.send(false);
  }
};
async function patientSignupValidate(req, res) {
  const users = await dbController.getDatabaseUsers();
  const val = isUserInDb(users, req.body.email);
  if (!val) {
    res.send(true);
  } else {
    res.send(false);
  }
}
async function userSignup(req, res) {
  const users = await dbController.getDatabaseUsers();
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
    let uid = await dbController.writeUserData(
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

async function deleteCareTaker(req, res) {
  let users = await dbController.getDatabaseUsers();
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
      let patient_user = editUser(my_user);
      my_user.emailList = my_user._emailList;
      console.log(my_user.emailList);
      for (let i = 0; i < my_user.emailList.length; i++) {
        let caretaker = searchDatabaseByEmail(users, my_user.emailList[i]);
        let my_emailList =
          typeof caretaker._emailList === "undefined"
            ? []
            : caretaker._emailList;
        let mindex = -1;

        for (let j = 0; j < my_emailList.length; j++) {
          if (my_emailList[j] == patient_user.email) {
            mindex = j;
            break;
          }
        }
        if (mindex > -1) {
          console.log(
            "found the patient and deleting it from caretaker list of patients"
          );
          console.log("email list of caretaker patient before deleteing is");
          console.log(my_emailList);
          console.log("index to be deleted is " + mindex);
          my_emailList.splice(mindex, 1);
          console.log("email list of caretaker patient after deleteing is");
          console.log(my_emailList);
          caretaker._emailList = my_emailList;

          let ID = getUserId(users, caretaker);

          console.log("id is " + ID);
          await dbController.editCareTakerData(ID, caretaker);
          break;
        }
      }
      _emailList.splice(index, 1);
      my_user.emailList = _emailList;
      my_user.UID = req.body.UID;
      let my_user_toUpdate = createUserForDB(my_user);
      console.log("user's caretaker list is:\n" + my_user_toUpdate._list);
      console.log(my_user_toUpdate);
      let userId = getUserId(users, my_user_toUpdate);
      console.log(userId);

      await dbController.editUserData(userId, my_user_toUpdate, res);
    } else {
      res.send(false);
    }
  }
}
async function addingCareTaker(req, res) {
  let users = await dbController.getDatabaseUsers();
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
      my_user.UID = req.body.UID;
      my_user.emailList = _emailList;
      let my_user_toSend = editUser(my_careTaker);
      let my_user_toUpdate = createUserForDB(my_user);
      console.log("user's caretaker list is:\n" + my_user_toUpdate._emailList);
      console.log(my_user_toUpdate);
      let userId = getUserId(users, my_user_toUpdate);
      console.log(userId);

      let patient_user = editUser(my_user);
      for (let i = 0; i < my_user.emailList.length; i++) {
        let caretaker = searchDatabaseByEmail(users, my_user.emailList[i]);
        let my_emailList =
          typeof caretaker._emailList === "undefined"
            ? []
            : caretaker._emailList;
        let check = false;
        for (let j = 0; j < my_emailList.length; j++) {
          if (my_emailList[j] == patient_user.email) {
            check = true;
            break;
          }
        }
        if (!check) {
          my_emailList[my_emailList.length] = patient_user.email;
        }
        caretaker._emailList = my_emailList;

        let Id = getUserId(users, caretaker);
        await dbController.editCareTakerData(Id, caretaker);
      }
      await dbController.editUserDataWithSending(
        userId,
        my_user_toUpdate,
        my_user_toSend,
        res
      );
    }
  }
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

function editUser(user) {
  const my_user = {
    UID: user._UID,
    name: user._name,
    email: user._email,
    phone: user._phone,
    type: user._type,
    list: typeof user.list === "undefined" ? [] : user.list,
    questions: typeof user._questions === "undefined" ? [] : user._questions,
    medicalHistory:
      typeof user._medicalHistory === "undefined" ? "" : user._medicalHistory,
    files: typeof user._files === "undefined" ? [] : user._files,
  };
  return my_user;
}

function createUserForDB(user) {
  let my_user = new UserDb(
    typeof user.name === "undefined" ? user._name : user.name,
    typeof user.email === "undefined" ? user._email : user.email,
    typeof user.phone === "undefined" ? user._phone : user.phone,
    typeof user.type === "undefined" ? user._type : user.type,
    typeof user.emailList === "undefined" ? [] : user.emailList,
    typeof user.questions === "undefined" ? [] : user.questions,
    typeof user.medicalHistory === "undefined" ? "" : user.medicalHistory,
    typeof user.files === "undefined" ? [] : user.files,
    user.UID
  );
  return my_user;
}
