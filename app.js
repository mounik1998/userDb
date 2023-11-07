const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const bcrypt = require('bcrypt')

app.use(express.json())
const dbPath = path.join(__dirname, 'userData.db')

let db = null

module.exports = app

const connectDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server connected')
    })
  } catch (e) {
    console.log(`error : ${e.message}`)
    process.exit(1)
  }
}

module.exports = app

connectDbServer()

//api1

app.post(' /register', async (request, response) => {
  const {username, name, password, gender, location} = request.body

  const registerQuery = `SELECT * FROM user WHERE username = '${username}';`

  const dbData = await db.get(registerQuery)

  if (password.length < 5) {
    response.status(400)
    response.send('Password is too short')
  } else {
    if (dbData === undefined) {
      const hashedPassword = await bcrypt.hash(request.body.password, 15)
      const dbAddUserQuery = `INSERT INTO user(username,name,password,gender,location) VALUES ('${username}','${name}','${hashedPassword}','${gender}','${location}');`
      const addUserData = await db.run(dbAddUserQuery)
      response.status(200)
      response.send('User created successfully')
    } else {
      response.status(400)
      response.send('User already exists')
    }
  }
})

//api2

app.post('/login', (response, request) => {
  const {username, password} = request.body
  const loginUserQuery = `SELECT * FROM user WHERE username = '${username}';`

  const loginUserData = db.get(loginUserQuery)

  const passwordCheck = bcrypt.compare(password, loginUserData.password)

  if (loginUserData === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    if (passwordCheck === false) {
      response.status(400)
      resposne.send('Invalid password')
    } else {
      response.status(200)
      response.send('Login success!')
    }
  }
})

//api3

app.put('/change-password', async (response, request) => {
  const {username, oldPassword, newPassword} = request.body
  const changePasswordQuery = `SELECT * FROM user WHERE username = '${username}';`
  const changPasswordUserData = db.get(changePasswordQuery)
  const passwordCheckForChangePassword = bcrypt.compare(
    oldPassword,
    changPasswordUserData.password,
  )

  if (changPasswordUserData === undefined) {
    response.status(400)
    reponse.send('Invalid User')
  } else if (changPasswordUserData !== undefined) {
    if (passwordCheckForChangePassword === false) {
      response.status(400)
      response.send('Invalid current password')
    } else {
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const hashedNewPassword = await bcrypt.hash(newPassword, 15)
        newPasswordQuery = `UPDATE user SET password = '${hashedNewPassword}' WHERE username ='${username}';`
        await db.run(newPasswordQuery)
        response.status(200)
        response.send('Password updated')
      }
    }
  }
})
