const State = require("./state.js");
const Timer = require("./timer.js");
const config = require("./config.json");
const namesFile = require("./names.json");

class NameSelectionState extends State
{
    constructor()
    {
        super();

        this.name = "NAME_SELECTION_STATE";
        this.loopInterval = 500;
        this.timer = new Timer();
    }

    _assignRandomNames()
    {
        let names = namesFile.names.slice();

        for (const session of this.room.session)
            if (!session.username)
            {
                const nameIndex = Math.round(Math.random()*(names.length - 1));

                const name = names[nameIndex];

                //remove name from pool
                names.splice(nameIndex, 1);

                session.username = name;
            }
    }

    onSessionDisconnect(session)
    {
        console.log("session disconnected");
    }

    onSessionMessage(session, message)
    {
        if (message.type === "NAME_SELECTION")
            session.username = message.name;
    }

    onEnter()
    {
        this.timer.restart();
    }

    onExit()
    {

    }

    loop()
    {
        if (this.timer.elapsedSeconds() >= config.name_selection_duration + config.name_selection_duration_extra)
        {
            //assign random names to everybody who didn't finish in time
            this._assignRandomNames();
        }
    }

}

module.exports = NameSelectionState;