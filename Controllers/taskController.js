const express = require('express');
const router = express.Router();
const moment = require('moment');
const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = (db) => {
    router.post('/addTask', async (req, res) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const { u_id, task_name, task_desc } = req.body;

            if (!u_id || !task_name || !task_desc) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const sqlStmt = `INSERT INTO user_task (u_id, task_name, task_desc, created_at) VALUES (?, ?, ?, ?)`;

            console.log("Executing SQL:", sqlStmt, [u_id, task_name, task_desc, currentDate]);

            const [result] = await connection.query(sqlStmt, [u_id, task_name, task_desc, currentDate]);

            if (result.affectedRows !== 1) {
                await connection.rollback(); 
                return res.status(500).json({ message: "Internal server error." });
            }

            await connection.commit();
            return res.status(200).json({ message: "Task data added successfully." });
        } catch (err) {
            await connection.rollback();
            console.error("Error adding task data:", err.message);
            return res.status(500).json({ message: "Failed to add task data." });
        } finally {
            connection.release(); 
        }
    });

    router.get('/getTaskData', async (req, res) => {
        const connection = await db.getConnection();
        try {
            const sqlStmt = `SELECT u.u_name,t.* FROM users_master u INNER JOIN user_task t ON u.u_id = t.u_id`;
            const [result] = await connection.query(sqlStmt);
    
            if (result.length === 0) {
                return res.status(404).json({ message: "No task data found." });
            }
    
            return res.status(200).json(result);
        } catch (err) {
            console.error("Error fetching task data:", err.message); 
            return res.status(500).json({ message: "Failed to retrieve task data." });
        } finally {
            connection.release(); 
        }
    });


    router.put('/updateTask/:t_id', async(req,res)=>{
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try{
            const tId = req.params.t_id;
            const { task_name, task_desc} = req.body;
           
            if (!task_name || !task_desc) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const sqlStmt = `UPDATE user_task SET task_name = ?, task_desc = ?, updated_at = ? WHERE t_id = ?`;
            const [result] = await connection.query(sqlStmt,[task_name, task_desc,currentDate,tId]);
            
            if(result.affectedRows !== 1){
                await connection.rollback();
                return res.status(500).json({message:"Internal server error."})
            }
            
            await connection.commit();
            return res.status(200).json({message:"Task data updated successfully."})
        }catch(err){
            await connection.rollback();
            console.log("Error failed to update task data.",err.message);
            return res.status(500).json({message:"Failed to update task data."})
        }finally{
            connection.release();
        }
    });


    router.delete('/deleteTask/:t_id', async (req, res) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const tId = req.params.t_id;
    
            if (!tId) {
                return res.status(400).json({ message: "Task ID is required." });
            }
    
            const sqlStmt = `DELETE FROM user_task WHERE t_id = ?`;
            const [result] = await connection.query(sqlStmt, [tId]);
    
            if (result.affectedRows !== 1) {
                await connection.rollback();
                return res.status(404).json({ message: "Task not found or already deleted." });
            }
    
            await connection.commit();
            return res.status(200).json({ message: "Task data deleted successfully." });
        } catch (err) {
            await connection.rollback();
            console.error("Error deleting task data:", err.message);
            return res.status(500).json({ message: "Failed to delete task data." });
        } finally {
            connection.release();
        }
    });

    return router;
};
