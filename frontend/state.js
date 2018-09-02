State = (() => {
    
class State
{
    constructor()
    {
        this.loopInterval = null;
        this.name = null;
        this.element = null;
    }

    onEnter()
    {

    }

    onExit()
    {
        
    }

    loop()
    {
        throw new Error("method not implemented");
    }
}

return State;

})();