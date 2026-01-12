const express=require('express');

const env = require("dotenv");
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const cors = require("cors");
app.use(cors());
const addUserRoutes = require("./routes/user");
const addRoleRoutes=require('./routes/role');

const addVoterRoutes=require('./routes/voter');
const addFinalVoterRoutes=require('./routes/finalvoter');



app.use("/uploads", express.static("uploads"));
app.use("/images", express.static(path.join(__dirname, "public/images")));

const port = process.env.PORT || 5000;
env.config();


 mongoose
  .connect(
    "mongodb+srv://mohini:mohiniraut@cluster0.ukt1ubo.mongodb.net/votingDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Local MongoDB votingDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.json({ limit: '100mb' }));

app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use('/api',addUserRoutes)
  app.use('/api',addRoleRoutes)
 
  app.use('/api',addVoterRoutes)
    app.use('/api',addFinalVoterRoutes)
  
app.get('/',(req,res)=>{
res.send("Hello world....")
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
