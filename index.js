const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.Admin_DB}:${process.env.Admin_PASS}@cluster0.r5e76.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });

    const usersCollection = client.db("NaturaVoyage").collection("users");

    //for signup
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    //for signin
    app.patch("/users", async (req, res) => {
      const signInUser = req.body;
      const userEmail = signInUser.email;
      const userLastSignIn = signInUser.lastSignIn;
      const filter = { email: userEmail };
      const updateDoc = {
        $set: {
          lastSignIn: userLastSignIn,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //for google
    app.put("/users", async (req, res) => {
      const user = req.body;
      const userName = user.name;
      const userEmail = user.email;
      const lastsignInTime = user.lastSignIn;
      const filter = { email: userEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: userName,
          email: userEmail,
          lastSignIn: lastsignInTime,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //for github(two put operations using same '/users' ,to make identical use '/users/github')
    app.put("/users/github", async (req, res) => {
      const user = req.body;
      console.log(user);

      const userName = user.name;
      const lastsignInTime = user.lastSignInTime;
      const filter = { name: userName };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: userName,
          lastSignIn: lastsignInTime,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to NaturaVoyage");
});

app.listen(port);
