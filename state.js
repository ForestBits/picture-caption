class State
{
    constructor()
    {
        this.loopInterval = null;
        this.name = null;
        this.brokenSessions = [];
    }

    onSessionDisconnect(session)
    {
        throw new Error("method not implemented");
    }

    onSessionMessage(session, message)
    {
        throw new Error("method not implemented");
    }

    onEnter()
    {

    }

    onExit()
    {

    }

    //when debugging a single state, this lets the state populate fake data to account for
    //missed states before the current one
    onDebugInit()
    {

    }

    loop()
    {
        throw new Error("method not implemented");
    }
}

module.exports = State;