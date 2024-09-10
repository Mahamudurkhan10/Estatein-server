const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require("dotenv").config()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.6gwdl3v.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;

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
          //     await client.connect();
          const usersCollection = client.db('Estatein').collection('users')
          const propertiesCollection = client.db('Estatein').collection('properties')
          const questionCollection = client.db('Estatein').collection('question')
          const reviewsCollection = client.db('Estatein').collection('reviews')
        
          app.get('/reviews',async(req,res)=>{ 
               const result = await reviewsCollection.find().toArray()
               res.send(result)
          })
          app.get('/question',async(req,res)=>{ 
               const result = await questionCollection.find().toArray()
               res.send(result)
          })
          app.get('/properties',async(req,res)=>{ 
               const result = await propertiesCollection.find().toArray()
               res.send(result)
          })
          app.post('/properties', async(req,res)=>{
               const body = req.body;
               const result = await propertiesCollection.insertOne(body)
               res.send(result)
          })
          app.get('/property/:id', async(req,res)=>{
               const id = req.params.id
               const query = { _id: new ObjectId(id)};
               
               const result = await propertiesCollection.findOne(query)
               res.send(result)
          }) 
          app.delete('/propertyDelete/:id', async(req,res)=>{
               const id = req.params.id
               const query = { _id: new ObjectId(id)};
               
               const result = await propertiesCollection.deleteOne(query)
               res.send(result)
          }) 
          app.get('/users',async(req,res)=>{
               const result = await usersCollection.find().toArray()
               res.send(result)
          })
          app.post('/users',async(req,res)=>{
               const user = req.body;
               const email = req.body.email
               const query = {email: email}
               const ExistingUser = await usersCollection.findOne(query)
               if(ExistingUser){
                    return res.send({message:"user is already exist",insertedId:null})
               }
               const result = await usersCollection.insertOne(user)
               res.send(result)
          })
          app.get('/api/dashboard', async(req, res) => {
               const totalUsers = await usersCollection.countDocuments()
               const totalProperties = await propertiesCollection.countDocuments()
               const data = {
                 totalUsers,
                 totalSales: 5,
                 totalOrders: 10,
                 totalProperties,
                 chartData: [
                   { name: 'Total Users', value: totalUsers },
                   { name: 'Total Sales', value: 5 },
                   { name: 'Total Orders', value: 10 },
                   { name: 'Total Properties', value: totalProperties },

                 ]
               };
               res.json(data);
             });
             
               // Send a ping to confirm a successful connection
               await client.db("admin").command({ ping: 1 });
          console.log("Pinged your deployment. You successfully connected to MongoDB!");
     } finally {
          // Ensures that the client will close when you finish/error
          //     await client.close();
     }
}
run().catch(console.dir);

app.get('/', (req, res) => {
     res.send('estatein server is running')

})
app.listen(port, () => {
     console.log(`estatein server is running on port ${port}`);
})