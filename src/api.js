import express from "express";
import cors from "cors";
import { auth } from "./firebase";

//user functions
import registerUserWithEmail from "./registerUserwithEmail";

const app = express();

//rawdody
app.use(
  express.json({
    verify: (req, res, buffer) => (req["rawBody"] = buffer),
  })
);

// Middelware
app.use(cors({ origin: true }));
app.use(decodeJWT);

async function decodeJWT(req, res, next) {
  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith("Bearer ")) {
      const idToken = req.headers.authorization.split("Bearer ")[1];

      try {
        if (idToken != "null") {
          const decodedToken = await auth.verifyIdToken(idToken);
          req["currentUser"] = decodedToken;
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  next();
}

// validation of Users

function validateUser(req) {
  var user = req["currentUser"];

  if (!user) {
    throw new Error(
      "You must be logged in to make this request. i.e Authroization: Bearer <token>"
    );
  }
  return user;
}

// Catch async errors when awaiting promises
function runAsync(callback) {
  return (req, res, next) => {
    callback(req, res, next).catch(next);
  };
}

/* User */

/* Not Logged in Functions */
app.post(
  "/test",
  runAsync(async (req, res) => {
    const user = validateUser(req);
    registerUserWithEmail.handler({ email: "Test" });
    if (errorMessage) res.status(500).send({ status: "FAILED" });

    res.status(200).send({ status: "OK" });
  })
);

/* Logged in functions */

// app.post(
//   "/user",
//   runAsync(async (req, res) => {
//     const user = validateUser(req);
//     res.status(200).send({ status: "OK", uid: user.uid });
//   })
// );

// app.post(
//   "/registerUserWithEmail",
//   runAsync(async (req, res) => {
//     const user = validateUser(req);
//     const agbdata = {
//       agbip: req.connection.remoteAddress,
//       agbdate: new Date(),
//     };
//     const errorMessage = await registerUserWithEmail(user, {
//       ...req.body,
//       ...agbdata,
//     });
//     if (errorMessage) res.status(500).send({ status: "FAILED" });

//     res.status(200).send({ status: "OK" });
//   })
// );

// app.post(
//   "/updatePrefrences",
//   runAsync(async (req, res) => {
//     const user = validateUser(req);

//     const errorMessage = await updatePrefrences(user, req.body);
//     if (errorMessage) res.status(500).send({ status: "FAILED" });
//     res.status(200).send({ status: "OK" });
//   })
// );

// app.post(
//   "/finishInitalSetup",
//   runAsync(async (req, res) => {
//     const user = validateUser(req);
//     const body = {
//       agbip: req.connection.remoteAddress,
//       agbdate: new Date(),
//       ...req.body.values,
//     };

//     const errorMessage = await finishInitalSetup(user, body);
//     if (errorMessage) res.status(500).send({ status: "FAILED" });
//     res.status(200).send({ status: "OK" });
//   })
// );

// app.post(
//   "/changePassword",
//   runAsync(async (req, res) => {
//     const user = validateUser(req);
//     const errorMessage = await changePassword(user, req.body);
//     if (errorMessage) res.status(500).send({ status: "FAILED" });

//     res.status(200).send({ status: "OK" });
//   })
// );

// app.post(
//   "/deleteAccount",
//   runAsync(async (req, res) => {
//     const user = validateUser(req);
//     const errorMessage = await deleteAccount(user);
//     if (errorMessage) res.status(500).send({ status: "FAILED" });

//     res.status(200).send({ status: "OK" });
//   })
// );

export { app };
