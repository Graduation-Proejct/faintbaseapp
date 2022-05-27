let UserDb = class UserDb {
  constructor(
    name,
    email,
    phone,
    type,
    emailList,
    questions,
    medicalHistory,
    files,
    UID
  ) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.type = type;
    this.emailList = emailList;
    this.questions = questions;
    this.medicalHistory = medicalHistory;
    this.files = files;
    this.UID = UID;
  }
  //getters
  get name() {
    return this._name;
  }
  get email() {
    return this._email;
  }
  get phone() {
    return this._phone;
  }
  get type() {
    return this._type;
  }
  get emailList() {
    return this._emailList;
  }
  get questions() {
    return this._questions;
  }
  get medicalHistory() {
    return this._medicalHistory;
  }
  get files() {
    return this._files;
  }
  get UID(){
    return this._UID;
  }
  //setters
  set name(value) {
    this._name = value;
  }
  set email(value) {
    this._email = value;
  }
  set phone(value) {
    this._phone = value;
  }
  set type(value) {
    this._type = value;
  }
  set emailList(value) {
    this._emailList = value;
  }
  set questions(value) {
    this._questions = value;
  }
  set medicalHistory(value) {
    this._medicalHistory = value;
  }
  set files(value) {
    this._files = value;
  }
  set UID(value) {
    this._UID = value;
  }
};
module.exports.UserDb = UserDb;
