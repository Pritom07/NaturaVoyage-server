const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.Admin_PASS);

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

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

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
