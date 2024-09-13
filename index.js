const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_ENV_KEY)
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
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
    await client.connect();
    const db = client.db('Estatein');
    const propertiesCollection = db.collection('properties');
    const usersCollection = db.collection('users');
    const questionCollection = db.collection('question');
    const reviewsCollection = db.collection('reviews');
    const makeOrderCollection = db.collection('makeOrder');
    const addCardCollection = db.collection('addCard');
    const priceOrderCollection = db.collection('priceOrder');
    const paymentCollection = db.collection('payments')
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })
    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const id = req.body.id;
      const email = req.body.email;
      const query = { id: id, email: email };
      const ExistingPayment = await paymentCardCollection.findOne(query);
      if (payment) {
        return res.send({ message: "payment  is already done..", insertedId: null });
      }
      const paymentResult = await paymentCollection.insertOne(payment)
      res.send(paymentResult)

    })
    app.get('/payments', async (req, res) => {
    
      const paymentResult = await paymentCollection.find().toArray()
      res.send(paymentResult)

    })
    app.get('/priceOrder', async(req,res)=>{
      const result = await priceOrderCollection.find().toArray()
      res.send(result)
    })
    app.post('/priceOrder', async (req, res) => {
      const query = req.body;
       
      const result = await priceOrderCollection.insertOne(query);
      res.send(result);
    });
    // Properties with search and filters
    app.get('/properties', async (req, res) => {
      try {
        const { location, propertyType, priceRange, size, buildYear, search } = req.query;
        
        

        // Create filter object for MongoDB query
        let filter = {};

        if (location) {
          filter.location = location;
        }
        if (propertyType) {
          filter.title = propertyType;
        }
        if (priceRange) {
          const [minPrice, maxPrice] = priceRange.split('-').map(Number);
          filter.price = { $gte: minPrice, $lte: maxPrice };
        }
        if (size) {
          const [minSize, maxSize] = size.split('-');
          filter.property_size = { $gte: minSize, $lte: maxSize };
         
        }
        if (buildYear) {
          const [minYear, maxYear] = buildYear.split('-').map(Number);
          filter.build_year = { $gte: minYear, $lte: maxYear };
        }
        if (search) {


          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];


        }

        // Query MongoDB with filter
        const properties = await propertiesCollection.find(filter).toArray();
        //  console.log(properties);
        res.json(properties);
      } catch (error) {
        res.status(500).send('Error fetching properties');
      }
    });

    // Other routes
    app.get('/addCard/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await addCardCollection.find(query).toArray();
      res.send(result);
    });
    app.get('/addCards/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id:new ObjectId(id) };
      const result = await addCardCollection.findOne(query);
      res.send(result);
    });

    app.delete('/addCard/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addCardCollection.deleteOne(query);
      res.send(result);
    });

    app.post('/addCard', async (req, res) => {
      const property = req.body;
      const id = req.body.id;
      const email = req.body.email;
      const query = { id: id, email: email };
      const existCard = await addCardCollection.findOne(query);
      if (existCard) {
        return res.send({ message: "property is already exist", insertedId: null });
      }
      const result = await addCardCollection.insertOne(property);
      res.send(result);
    });

    app.get('/addCard', async (req, res) => {
      const result = await addCardCollection.find().toArray();
      res.send(result);
    });

    app.get('/makeOrder', async (req, res) => {
      const result = await makeOrderCollection.find().toArray();
      res.send(result);
    });

    app.get('/makeOrder/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await makeOrderCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/makeOrder', async (req, res) => {
      const query = req.body;
      
      const result = await makeOrderCollection.insertOne(query);
      res.send(result);
    });

    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.get('/question', async (req, res) => {
      const result = await questionCollection.find().toArray();
      res.send(result);
    });

    app.post('/properties', async (req, res) => {
      const body = req.body;
      const result = await propertiesCollection.insertOne(body);
      res.send(result);
    });

    app.get('/property/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.findOne(query);
      res.send(result);
    });

    app.get('/propertyUp/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.findOne(query);
      res.send(result);
    });

    app.patch('/propertyUpdate/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProperty = req.body;
      const updated = {
        $set: {
          image: [
            updateProperty.image[0],
            updateProperty.image[1],
            updateProperty.image[2],
            updateProperty.image[3]
          ],
          location: updateProperty.newLocation,
          bathrooms: updateProperty.newBathrooms,
          bedrooms: updateProperty.newBedrooms,
          title: updateProperty.newTitle,
          property_size: updateProperty.newProperty_size,
          build_year: updateProperty.newBuild_year,
          price: updateProperty.newPrice,
          description: updateProperty.newDescription
        }
      };
      const result = await propertiesCollection.updateOne(query, updated, options);
      res.send(result);
    });

    app.delete('/propertyDelete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.delete('/userDelete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.patch('/userUpdate/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const userRole = req.body;
      const updated = {
        $set: {
          role: userRole.role
        }
      };
      const result = await usersCollection.updateOne(query, updated, options);
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const email = req.body.email;
      const query = { email: email };
      const ExistingUser = await usersCollection.findOne(query);
      if (ExistingUser) {
        return res.send({ message: "user is already exist", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get('/api/dashboard', async (req, res) => {
      const totalUsers = await usersCollection.countDocuments();
      const totalProperties = await propertiesCollection.countDocuments();
      const totalOrders = await makeOrderCollection.countDocuments();
      const data = {
        totalUsers,
        totalSales: 5,
        totalOrders,
        totalProperties,
        chartData: [
          { name: 'Total Users', value: totalUsers },
          { name: 'Total Sales', value: 5 },
          { name: 'Total Orders', value: totalOrders },
          { name: 'Total Properties', value: totalProperties }
        ]
      };
      res.json(data);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('estatein server is running');
});

app.listen(port, () => {
  console.log(`estatein server is running on port ${port}`);
});
