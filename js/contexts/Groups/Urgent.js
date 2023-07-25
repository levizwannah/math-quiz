class Global extends OpenScript.Context {
    score;
    highScore;
    question;
    lives;
    maxLives;
    timer;
    given;
    max;
    timeLimit;
    input;
    scoreIncrement;
    timerId;
    gameOver;
    penalty;
    
    constructor(){
        super();

        this.has('timeLimit').value = 10;
        this.has('score').value = 0;
        this.has('question').value = {numbers: {first: 0, second: 0}, operator: 'plus'};
        this.has('maxLives').value = 5;
        this.has('lives').value = this.maxLives.value;
        this.has('timer').value = this.timeLimit.value;
        this.has('given').value = 0;
        this.has('max').value = 1000;
        this.has('input').value = 0;
        this.has('highScore').value = localStorage.getItem('highScore') ?? 0;
        this.has('scoreIncrement').value = 5;
        this.has('timerId').value = null;
        this.has('gameOver').value = false;
        this.has('penalty').value = 2;
    }
}