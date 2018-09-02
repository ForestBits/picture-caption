class Timer
{
    constructor()
    {
        this.restart();
    }

    restart()
    {
        this.start = Date.now();
    }

    elapsedSeconds()
    {
        return (Date.now() - this.start)/1000;
    }
}