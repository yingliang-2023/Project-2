const app = require("./app");

app.listen(process.env.PORT || 3000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Server started on port 3000");
  }
});


