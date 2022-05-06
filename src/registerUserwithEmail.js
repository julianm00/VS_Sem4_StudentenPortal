exports.handler = async function registerUserWithEmail(data) {
  try {
    const { email } = data;
    console.log("register User with Email", email);
  } catch (err) {
    console.log("error with registerUserWithEmail", err);
    return err;
  }
};
