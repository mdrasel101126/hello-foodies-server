const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3m2j3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("HelloFoodies").collection("Services");
    const reviewCollection = client.db("HelloFoodies").collection("Reviews");
    // get services api
    /* app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    }); */
    app.get("/services", async (req, res) => {
      const query = {};
      const options = {
        sort: { publishedDate: -1 },
      };
      const cursor = serviceCollection.find(query, options);
      let services = [];
      if (req.query.amount) {
        services = await cursor.limit(3).toArray();
      } else {
        services = await cursor.toArray();
      }

      res.send(services);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    //get reviews by service id or user email api
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.id) {
        query = {
          service_id: req.query.id,
        };
      }
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const options = {
        sort: { comment_date: -1 },
      };
      const cursor = reviewCollection.find(query, options);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //post api
    //post service api
    app.post("/services", async (req, res) => {
      const service = req.body;
      console.log(service);
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //post jwt token api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      //console.log(user);
      res.send({ token });
    });
    //post review api
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    //delete api

    // review delete api
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
    //review update api
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const newComment = req.body.newComment;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          comment: newComment,
        },
      };
      const result = await reviewCollection.updateOne(query, updateDoc);
      res.send(result);
    });
  } finally {
    //never closed
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Foodies Server Running");
});
app.listen(port, () => {
  console.log("Hello Foodies Server is Running on Port ", port);
});
