const express = require("express");
const mongoose = require("mongoose");

const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

const app = express();
const PORT = 3000;
const DB =
  "mongodb+srv://tuvankhanh2002:2042002lol@cluster0.pxpacj1.mongodb.net/?retryWrites=true&w=majority";

// middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

mongoose
  .connect(DB)
  .then(() => {
    console.log("connection successful");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`connected at port ${PORT}`);
});
