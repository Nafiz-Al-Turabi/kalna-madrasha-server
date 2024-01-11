const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken')



app.use(cors())
app.use(express.json())


// verify JWT
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v94js04.mongodb.net/?retryWrites=true&w=majority`;

// const uri = "mongodb+srv://doctorServiceBD:kgOP8NEZMZLVvQfg@cluster0.v94js04.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const studentCollection = client.db('KalnaMadrasha').collection('students')
    const teacherCollection = client.db('KalnaMadrasha').collection('teachers')
    const committeeCollection = client.db('KalnaMadrasha').collection('committee')

    app.post('/poststudent',async(req,res)=>{
      const request=req.body;
      console.log(request);
      const result=await studentCollection.insertOne(request)
      res.send(result)
    })

    app.post('/postteacher',async(req,res)=>{
      const request=req.body;
      console.log(request);
      const result=await teacherCollection.insertOne(request)
      res.send(result)
    })
    app.post('/postcommittee',async(req,res)=>{
      const request=req.body;
      console.log(request);
      const result=await committeeCollection.insertOne(request)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Madrasha server is running')
})

app.listen(port, () => {
  console.log(`Madrasha server listening on port ${port}`)
})