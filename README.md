
# Faint Base App

The Backend system for the faintrush app

![Image](https://i.ibb.co/zPsZ8sS/Drawing1.png)
## API Reference

#### Validates user's sign up data, and sign him/her up if he/she is a caretaker.  

```http
  POST /signup
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `type` | `string` | **Required**. Your user type (patient/caretaker) |
| `email` | `string` | **Required**. Your email |

> Returns:
* UID if the user is a caretaker
* True if the user is patient

#### Signs up a patient user

```http
  POST /signup_patient_user
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. Your email |

> Returns:
* UID 

#### Login

```http
  POST /login
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. Your email |
| `password`      | `string` | **Required**. Your password |
> Returns:
* User's data (patient/caretaker's list)

#### Add a Caretaker

```http
  POST /add_caretaker
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `UID`      | `string` | **Required**. Your UID |
| `emailList`      | `string` | **Required**. Your emailList |
> Returns:
* User object after update (patient/caretaker's list)

#### Delete a Caretaker

```http
  POST /delete_caretaker
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `UID`      | `string` | **Required**. Your UID |
| `emailList`      | `string` | **Required**. Your emailList |
> Returns:
* User object after update (patient/caretaker's list)

#### Is Auth

```http
  POST /is_auth
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `UID`      | `string` | **Required**. Your UID |
> Returns:
* True (the UID is in the Database) or False (the UID isn't in the Database)

#### SOS Patient

```http
  POST /sos_patient
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `UID`      | `string` | **Required**. Your UID (as a caretaker) |
> Returns:
* The patient's data that is connected to this caretaker
* False if the caretaker isn't connected to any patient
## Badges


![Host](https://img.shields.io/badge/Host-Heroku-blueviolet)
![Tech](https://img.shields.io/badge/Platform-NodeJS-brightgreen)
![DB](https://img.shields.io/badge/Database-Firebase-orange)

## Authors

- [@sayedkhaled](https://github.com/SayedKhaledd)

