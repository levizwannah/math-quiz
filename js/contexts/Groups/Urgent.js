class Global extends OpenScript.Context {
    score;
    highScore;
    question;
    lives;
    timer;
    given;
    max;
    timeLimit;
    input;
    scoreIncrement;
    
    constructor(){
        super();

        this.has('timeLimit').value = 10;
        this.has('score').value = 0;
        this.has('question').value = {numbers: {first: 0, second: 0}, operator: 'plus'};
        this.has('lives').value = 10;
        this.has('timer').value = this.timeLimit.value;
        this.has('given').value = 0;
        this.has('max').value = 200;
        this.has('input').value = 0;
        this.has('highScore').value = localStorage.getItem('highScore') ?? 0;
        this.has('scoreIncrement').value = 5;
    }
}