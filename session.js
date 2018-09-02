const uuid = require("uuid/v4");
const EventEmitter = require("events");

class Session extends EventEmitter
{
    constructor(socket)
    {
        super();

        this.socket = socket;
        this.token = Session.getSessionToken();

        socket.on("error", (error) => {this.emit("socketError", error);});
        socket.on("close", (close) => {this.emit("socketClose", close);});
        socket.on("message", (message) => {this.emit("socketMessage", message)});
    }

    sendPacket(packet)
    {
        this.socket.send(JSON.stringify(packet), (error) =>
        {
            if (error)
                this.emit("socketError", error);
        });
    }

    static getSessionToken()
    {
        return uuid();
    }
}

module.exports = Session;