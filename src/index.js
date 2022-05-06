import { app } from "./api";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// start server
const Port = process.env.PORT || 3333;

app.listen(Port, () => console.log(`Api is avaialbe on port ${Port}`));
