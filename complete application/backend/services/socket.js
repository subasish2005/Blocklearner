let io;

module.exports = {
    init: (httpServer) => {
        io = require('socket.io')(httpServer);
        
        io.on('connection', (socket) => {
            console.log('New client connected');

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
        
        return io;
    },
    
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
