const express = require('express');
const router = express.Router();
const moment = require('moment');
const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = (db) => {
    router.post('/saveUsers', async (req, res) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const { u_name, u_mobile, u_email, u_address } = req.body;
           
            if (!u_name || !u_mobile || !u_email || !u_address) {
                return res.status(400).json({ message: "All fields are required" });
            }
 
            const sqlStmt = `INSERT INTO users_master (u_name, u_mobile, u_email, u_address, created_at) VALUES (?, ?, ?, ?, ?)`;

            const [result] = await connection.query(sqlStmt, [u_name, u_mobile, u_email, u_address, currentDate]);

            if (result.affectedRows !== 1) {
                await connection.rollback();
                return res.status(500).json({ message: "Internal server error." });
            }
            await connection.commit();
            return res.status(200).json({ message: "User data added successfully." });
        } catch (err) {
            await connection.rollback();
            console.error("Error adding user data:", err.message); 
            return res.status(500).json({ message: "Failed to add user data." });
        } finally {
            connection.release();
        }
    });


    router.get('/getUserData', async (req, res) => {
        const connection = await db.getConnection();
        try {
            const sqlStmt = `SELECT * FROM users_master`;
            const [result] = await connection.query(sqlStmt);
    
            if (result.length === 0) {
                return res.status(404).json({ message: "No user data found." });
            }
    
            return res.status(200).json(result);
        } catch (err) {
            console.error("Error fetching user data:", err.message); 
            return res.status(500).json({ message: "Failed to retrieve user data." });
        } finally {
            connection.release(); 
        }
    });


    router.put('/updateUser/:u_id', async(req,res)=>{
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try{
            const uId = req.params.u_id;
            const { u_name, u_mobile, u_email, u_address } = req.body;
           
            if (!uId || !u_name || !u_mobile || !u_email || !u_address) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const sqlStmt = `UPDATE users_master SET u_name = ?, u_mobile = ?, u_email = ?, u_address = ?, updated_at = ? WHERE u_id = ?`;
            const [result] = await connection.query(sqlStmt,[u_name, u_mobile, u_email, u_address,currentDate,uId]);
            
            if(result.affectedRows !== 1){
                await connection.rollback();
                return res.status(500).json({message:"Internal server error."})
            }
            
            await connection.commit();
            return res.status(200).json({message:"User data updated successfully."})
        }catch(err){
            await connection.rollback();
            console.log("Error failed to update user data.",err.message);
            return res.status(500).json({message:"Failed to update user data."})
        }finally{
            connection.release();
        }
    });
    

    router.delete('/deleteUser/:u_id', async (req, res) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const uId = req.params.u_id;
    
            if (!uId) {
                return res.status(400).json({ message: "User ID is required." });
            }
    
            const sqlStmt = `DELETE FROM users_master WHERE u_id = ?`;
            const [result] = await connection.query(sqlStmt, [uId]);
    
            if (result.affectedRows !== 1) {
                await connection.rollback();
                return res.status(404).json({ message: "User not found or already deleted." });
            }
    
            await connection.commit();
            return res.status(200).json({ message: "User data deleted successfully." });
        } catch (err) {
            await connection.rollback();
            console.error("Error deleting user data:", err.message);
            return res.status(500).json({ message: "Failed to delete user data." });
        } finally {
            connection.release();
        }
    });
    

    return router;
};
