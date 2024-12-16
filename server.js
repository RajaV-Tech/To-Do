const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const port = 3001 ;
const app = express();
const fs = require('fs'); 
const path = require('path');

app.use(cors());
app.use(bodyparser.json());

const caPath = path.resolve(__dirname, './isrgrootx1.pem');


const db = mysql.createPool({
    host : 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port : '4000',
    user : '2K744B1HeEmDfWf.root',
    password : 'WBXUO7EdEZntXYmt',
    database : 'to_do',
    ssl: {
        ca: fs.readFileSync(caPath) 
    }
});


(async () => {
    try{
        const connection = await db.getConnection();
        console.log("Database connected successfully .");
        connection.release();
    }catch(err){
        console.log("Database is not connected.", err.message)
    }
}) ();

const userController = require('./Controllers/userController')(db) ;
app.use('/users',userController);
const taskController = require('./Controllers/taskController')(db) ;
app.use('/task',taskController);

app.listen(port, ()=>{
    console.log(`Server is running on ${port}...`)
})