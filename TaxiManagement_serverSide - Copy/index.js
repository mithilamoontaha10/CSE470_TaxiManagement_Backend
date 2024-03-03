const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// MiddleWare:
app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("ServerSide ofTaxiManagement system  is developing ")
})



const uri = "mongodb+srv://mithilamun101:ngWkRMvZHiKBkuzb@cluster1.ty6w35p.mongodb.net/?retryWrites=true&w=majority";

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
        await client.connect();

        // databaseCollections
        const userCollections = client.db("taxiManagement").collection("users");
        const TaxiServiceRequestCollections = client.db("taxiManagement").collection("serviceRequest");
        const DrivingRequestCollections = client.db("taxiManagement").collection("drivingRequest");
        const AssignDriversCollections = client.db("taxiManagement").collection("assignDriver");






        // Transfer UserInformation to the mongoDb
        // req ==> request to the server for specific task
        // res ==> server response to the request
        app.post("/registerUser", async (req, res) => {
            // body is a information array which is coming from the client side and letter pass to the database
            const body = req.body;
            // userInformation is going to the database
            const result = await userCollections.insertOne(body);
            // server response is going to the client side.
            res.send(result)

        })


        // for Dashboard access, we need to check the  user role from the database and based on roles , we shows the different dashboard.

        // for get the data from the database , we perform app.get oparation and at the mean time we perform a query .
        // from the clientside , it comes like this /user/owner/${user.email}, here user.email is dynamic part.
        // in node .js to describe the dynamic part for making query,it takes colon(:) before the dynamic part name.
        // check Role for Owner
        app.get("/user/owner/:email", async (req, res) => {
            // req.params.email ==> making a request body to the server for specific information
            const emailOfOwner = req.params.email
            // now with the request body ,run a query to the Database
            const query = { email: emailOfOwner }
            // get a result from the database (userCollections) based on query request in the server
            const result = await userCollections.findOne(query)

            // check the ownership role 

            let owner = false
            if (result) {
                owner = result.role === "owner"
            }

            // if the role is owner, then it pass a response to the client side
            res.send({ owner })



        })
        // check role for admin
        app.get("/user/admin/:email", async (req, res) => {
            // req.params.email ==> making a request body to the server for specific information
            const emailOfAdmin = req.params.email
            // now with the request body ,run a query to the Database
            const query = { email: emailOfAdmin }
            // get a result from the database (userCollections) based on query request in the server
            const result = await userCollections.findOne(query)

            // check the admin role 

            let admin = false
            if (result) {
                admin = result.role === "admin" && result.security==="adminTrueForTaxiManagement"

            }
            // if the role is admin, then it pass a response to the client side
            res.send({ admin })

        })

       

        //get taxi service request from the database for the admin panel
        app.get("/serviceReq", async(req,res)=>{
            const result = await TaxiServiceRequestCollections.find().toArray();
            res.send(result)
        })
        //get  driving request from the database for the admin panel
        app.get("/drivingReq", async(req,res)=>{
            const result = await DrivingRequestCollections.find().toArray();
            res.send(result)
        })

        // admin accept the service Request
        // patch is use to update the information which is stored in database, initially when an owner request for a service, their status is pending, but when admin accept their request, the status should be accepted!
        app.patch("/admin/acceptRequest/:id", async(req,res)=>{
            // we do a query based on vehicle's Id to update their information
            const requestedVehicleId = req.params.id
            // do query
            const query ={_id:new ObjectId(requestedVehicleId)}
            // data body is requested to the server
            const data = req.body;
            // update the data
            const updatedData={
                $set:{
                    status:data.status

                }
            }
            // upsert ==> if data is already in updatedData Formate, then no change, otherwise change the data
            const options = {upsert: true}
            // taking an actions to updata data 
            const result = await TaxiServiceRequestCollections.updateOne(query,updatedData,options)
            // server send response to the client
            res.send(result)
        })
        // Admin reject the service Request
        app.patch("/admin/rejectRequest/:id", async(req,res)=>{
            const requestedVehicleId= req.params.id
            const query={_id:new ObjectId(requestedVehicleId)}
            const data = req.body;

            // delete the request 
           const updatedData={
                $set:{
                    status:data.status

                }
            }
            // upsert ==> if data is already in updatedData Formate, then no change, otherwise change the data
            const options = {upsert: true}
            // taking an actions to updata data 
            const result = await TaxiServiceRequestCollections.updateOne(query,updatedData,options)
            // server send response to the client
            res.send(result)

        })

        // admin accept the driving Request
        app.patch("/admin/acceptDrivingRequest/:id", async(req,res)=>{
            // we do a query based on vehicle's Id to update their information
            const requestedDrivingRequestedId = req.params.id
            // do query
            const query ={_id:new ObjectId(requestedDrivingRequestedId)}
            // data body is requested to the server
            const data = req.body;
            // update the data
            const updatedData={
                $set:{
                    status:data.status

                }
            }
            // upsert ==> if data is already in updatedData Formate, then no change, otherwise change the data
            const options = {upsert: true}
            // taking an actions to updata data 
            const result = await DrivingRequestCollections.updateOne(query,updatedData,options)
            // server send response to the client
            res.send(result)
        })

        // admin Reject the Driving Request
        
        app.patch("/admin/rejectDrivingRequest/:id", async(req,res)=>{
            const requestedVehicleIdForDelete= req.params.id
            const query={_id:new ObjectId(requestedVehicleIdForDelete)}
            const data = req.body;

            // delete the request 
           const updatedData={
                $set:{
                    status:data.status

                }
            }
            // upsert ==> if data is already in updatedData Formate, then no change, otherwise change the data
            const options = {upsert: true}
            // taking an actions to updata data 
            const result = await DrivingRequestCollections.updateOne(query,updatedData,options)
            // server send response to the client
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


app.listen(port, () => {
    console.log(`Taxi Management is running at ${port}`);
})

