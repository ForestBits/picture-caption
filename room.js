class Room
{
    constructor()
    {
        this.sessions = [];

        this.state = null;
        this.loopIntervalID = null;
    }

    //runs loop of internal state, but also runs hooks
    _setState(newState)
    {
        //this function runs right after the previous loop exit

        if (this.state)
            this.state.onExit();

        this.state = newState;
        this.state.room = this;
        this.state.sessions = this.sessions;

        this.state.onEnter();

        if (!(this.state.loop && this.state.loopInterval))
            throw new Error(`Loop function or interval undefined for state ${this.state.name}`);

        //make "this" in the loop function behave as an instance method
        const boundLoop = this.state.loop.bind(this.state);

        this.loopIntervalID = setInterval(boundLoop, this.state.loopInterval);

        this.state.onEnter();
    }

    broadcast(packet)
    {
        for (const session of this.sessions)
            session.sendPacket(packet);
    }

    broadcastToAllExcept(packet, ignored)
    {
        const recipients = [];

        for (const session of this.sessions)
            if (ignored.indexOf(session) > -1)
                recipients.push(session);

        for (const session of recipients)
            session.sendPacket(packet);
    }

    setState(newState)
    {
        //now we need to transition over to the next state, but before we do
        //we want to make sure the current state is no longer running
        //for example, the state's loop might have called setState, and will
        //actually still be running once this method exits
        //to avoid this, we add the actual state change code to run right after
        //the call stack unwinds

        //but we can still cancel the interval now, in case it somehow gets ahead
        //in the queue again
        if (this.state)
            clearInterval(this.loopIntervalID);

        setTimeout(() => this._setState(newState), 0);
    }

    onSessionError(session, error)
    {
        //this.state.onSessionDisconnect(session);
        this.state.brokenSessions.push(session);
    }

    onSessionClose(session, close)
    {
        //this.state.onSessionDisconnect(session);
        this.state.brokenSessions.push(session);
    }

    onSessionMessage(session, message)
    {
        this.state.onSessionMessage(session, message);
    }
}

module.exports = Room;