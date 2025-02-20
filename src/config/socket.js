const socketIO = require("socket.io");
const { verifyToken } = require("../middlewares/authMiddleware");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");

let io;

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.id);
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", async (socket) => {
        console.log(`User connected: ${socket.user._id}`);

        const projects = await Project.find({ team: socket.user.team });
        const tasks = await Task.find({ assignee: socket.user._id });
        socket.emit("initialData", { projects, tasks });

        socket.on("subscribeProject", async (projectId) => {
            socket.join(`project_${projectId}`);
            console.log(`User ${socket.user._id} joined project ${projectId}`);
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user._id}`);
        });
    });
};

const emitProjectUpdate = async (projectId) => {
    const project = await Project.findById(projectId);
    io.to(`project_${projectId}`).emit("projectUpdated", project);
};

const emitTaskUpdate = async (taskId) => {
    const task = await Task.findById(taskId);
    io.emit("taskUpdated", task);
};

module.exports = { initSocket, emitProjectUpdate, emitTaskUpdate };
