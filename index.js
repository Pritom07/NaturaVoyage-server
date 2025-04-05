const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const usersCollection = client.db("NaturaVoyage").collection("users");
    const spotsCollection = client.db("NaturaVoyage").collection("spots");

    //for signup users
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    //for signin users
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

    //for google signin
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

    //for github signin(two put operations using same '/users' ,to make identical use '/users/github')
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

    //for adding spots
    app.post("/spots", async (req, res) => {
      const spotDetails = req.body;
      const result = await spotsCollection.insertOne(spotDetails);
      res.send(result);
    });

    //for getting all spot
    app.get("/spots", async (req, res) => {
      const cursor = spotsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //for getting specific spot
    app.get("/spots/:id", async (req, res) => {
      const spotId = req.params.id;
      const query = { _id: new ObjectId(spotId) };
      const result = await spotsCollection.findOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to NaturaVoyage");
});

app.listen(port);
