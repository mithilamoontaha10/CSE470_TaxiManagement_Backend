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
        const BookRides = client.db("taxiManagement").collection("rides");
        const PaymentCollections = client.db("taxiManagement").collection("payments");
        const vehicleStatus = client.db("taxiManagement").collection("vehicleStatus");





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
        
// check driverRole
        app.get("/user/driver/:email", async (req, res) => {
            // req.params.email ==> making a request body to the server for specific information
            const emailOfDriver = req.params.email
            // now with the request body ,run a query to the Database
            const query = { email: emailOfDriver }
            // get a result from the database (userCollections) based on query request in the server
            const result = await userCollections.findOne(query)

            // check the admin role 

            let driver = false
            if (result) {
                driver = result.role === "driver" 

            }
            // if the role is driver, then it pass a response to the client side
            res.send({ driver })
// check passengerRole
        app.get("/user/passenger/:email", async (req, res) => {
            // req.params.email ==> making a request body to the server for specific information
            const emailOfPassenger = req.params.email
            // now with the request body ,run a query to the Database
            const query = { email: emailOfPassenger }
            // get a result from the database (userCollections) based on query request in the server
            const result = await userCollections.findOne(query)

            // check the admin role 

            let passenger = false
            if (result) {
                passenger = result.role === "passenger"

            }
            // if the role is driver, then it pass a response to the client side
            res.send({ passenger })

        })
        })
        // Taxi Service Request is posting to databse  for the owner Side:
        app.post("/owner/serviceRequest", async(req,res)=>{
            const body = req.body;
            const result = await TaxiServiceRequestCollections.insertOne(body);
            res.send(result)
        })

        // owner see the service Request status
        app.get("/owner/serviceReqStatus/:email", async(req,res)=>{
            const emailofOwner = req.params.email;
            const query= {email: emailofOwner}
            const result = await TaxiServiceRequestCollections.find(query).toArray()
            res.send(result);

        })

        // owner withdrow the service Request:
        app.delete("/owner/withdrowRequest/:id", async(req,res)=>{
            const vehicleId = req.params.id
            const query={_id:new ObjectId(vehicleId)}
            // delete the item based on query
            const result = await TaxiServiceRequestCollections.deleteOne(query)
            res.send(result)
        })

         // owner AssignDrivers
        app.post("/owner/assignDriver", async(req,res)=>{
            const body= req.body
            const result = await AssignDriversCollections.insertOne(body)
            res.send(result)

        })
        // owner see the vehicle Status
        // /owner/vehicleStatus
        app.get("/owner/vehicleStatus/:email", async (req, res) => {
            const emailofOwner = req.params.email;
          
            const query = { ownerEmail:emailofOwner }
            const result = await vehicleStatus.find(query).toArray()
            console.log("vs",result);
            res.send(result);

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


        // Driving request is sent to the database for the driver side
          app.post("/driver/drivingReq", async(req,res)=>{
            const body = req.body;
            const result = await DrivingRequestCollections.insertOne(body);
            res.send(result)
        })

        // Driver see the Driving Request status
        app.get("/driver/driveReqStatus/:email", async(req,res)=>{
            const emailofDriver = req.params.email;
            const query= {email: emailofDriver}
            const result = await DrivingRequestCollections.find(query).toArray()
            res.send(result);

        })
        // DriverRide 
        app.get("/driverRide/getInfo/:userEmail", async(req,res)=>{
            const email = req.params.userEmail;
            const query = {driverEmail:email}
            const result = await BookRides.find(query).toArray()
            
            res.send(result);
        })

        // DriverCancel the Ride
       
        app.patch("/driver/cancelRide/:dt", async(req,res)=>{
           
            const time = req.params.dt
            const query = {currentDate:time}
            const data = req.body;

            // delete the request 
            const updatedData = {
                $set: {
                    isdriverAccepted: data.isdriverAccepted

                }
            }
            
            const options = { upsert: true }
            
            const result = await BookRides.updateOne(query, updatedData, options)
            
            res.send(result)

        })

        // driver accept the ride
        app.patch("/driver/acceptRide/:dt", async(req,res)=>{
           
            const time = req.params.dt
            const query = {currentDate:time}
            const data = req.body;

            // delete the request 
            const updatedData = {
                $set: {
                    isdriverAccepted: data.isdriverAccepted

                }
            }
            
            const options = { upsert: true }
            
            const result = await BookRides.updateOne(query, updatedData, options)
            
            res.send(result)

        })
//driver Update the vehicle Status
        app.post("/driver/vehicleStatus", async(req,res)=>{
            const body = req.body;
            const result = await vehicleStatus.insertOne(body);
            res.send(result) 
        })
        // -----------------------------------------------


        // Avaiable Service
        // Here,we Perform aggregation between two tables.(serviceRequest and assignDriver)
        // By aggregating two tables , we create a new tables 

        app.get("/showService", async (req, res) => {
            const result = await AssignDriversCollections.aggregate([

                {
                    $addFields: {
                        ServiceReqIds: {
                            $convert: {
                                input: "$serviceId",
                                to: "objectId"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "serviceRequest",
                        localField: "ServiceReqIds",
                        foreignField: "_id",
                        as: "rides"
                    }
                },
                {

                    $unwind: '$rides'

                },
                {
                    $lookup:{
                        from:"drivingRequest",
                        localField:"driverEmail",
                        foreignField:"email",
                        as:"driverInfo"
                        

                    }

                },
                {
                    $unwind: '$driverInfo' 
                },
                {
                    $project:{
                        "businessName":"$rides.businessName",
                        "email":"$rides.email",
                        "transportType":"$rides.transportType",
                        "route":"$rides.route",
                        "fareRate":"$rides.fareRate",
                        "brta":"$rides.brta",
                        "photo":"$rides.photo",
                        "status":"$rides.status",
                        "driverEmail":"$driverEmail",
                        "driverPhoto": "$driverInfo.photo",
                        "driverStatus":"$driverInfo.status",
                        "driverName":"$driverInfo.name"
                        
                        
                    }
                }
            ]).toArray()
            res.send(result)
        })

// Ride
        app.post("/ride", async(req,res)=>{
            const body= req.body;
            const result = await BookRides.insertOne(body);
            res.send(result)
        })
// get the Rides Info from the passengerSide:
        app.get("/passengerRide/getInfo/:userEmail", async(req,res)=>{
            const email = req.params.userEmail;
            const query = {passengerEmail:email}
            const result = await BookRides.find(query).toArray()
            res.send(result);
        })
// pasenger Cancel the Riding Request:
        app.patch("/passenger/cancelRide/:brta", async(req,res)=>{
          
            const brtaVehicle = req.params.brta
            const query = {brta:brtaVehicle}
            const data = req.body;

            // delete the request 
            const updatedData = {
                $set: {
                    ispassengerBooked: data.ispassengerBooked

                }
            }
            
            const options = { upsert: true }
            
            const result = await BookRides.updateOne(query, updatedData, options)
            
            res.send(result)

        })
        // payment

        // passenger Make Payment:

        app.post("/passenger/makePayment", async(req,res)=>{
            const data = req.body;
            
            const result = await PaymentCollections.insertOne(data)
            res.send(result)
        })
         // get the payment Info from the driverSide:

        app.get("/driverPayment/:email", async(req,res)=>{
            const email = req.params.email
            const result = await PaymentCollections.aggregate([
                {
                    $addFields: {
                        rideIds: {
                            $convert: {
                                input: "$rideId",
                                to: "objectId"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "rides",
                        localField: "rideIds",
                        foreignField: "_id",
                        as: "paymentsInfo"
                    }
                },
                {

                    $unwind: '$paymentsInfo'

                },
                
                {
                    $match: {
                        "paymentsInfo.driverEmail": email
                    }
                },
                {
                    $project:{
                        "vehiclePhoto":"$paymentsInfo.photo",
                        "driverEmail":"$paymentsInfo.driverEmail",
                        "route":"$paymentsInfo.route",
                        "amount":"$paymentsInfo.amount",
                        "passengerEmail":"$paymentsInfo.passengerEmail",
                        "passengerPhoto":"$paymentsInfo.passengerPhoto",
                        "currentDateTime":1
                       


                    }
                }

            ]).toArray()
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

