const State = require("./state.js");

class NamesSelectedState extends State
{
    constructor()
    {
        super();

        this.name = "NAMES_SELECTED_STATE";
        this.loopInterval = 500;
    }

    onSessionDisconnect(session)
    {

    }

    onSessionMessage(session, message)
    {

    }

    onExit()
    {

    }

    loop()
    {
  
    }
}

module.exports = NamesSelectedState;