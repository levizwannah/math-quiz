class Game extends OpenScript.Mediator {
    
    plus(num1, num2) {
        return Number(num1) + Number(num2);
    }

    minus(num1, num2) {
        return Number(num1) - Number(num2);
    }

    divide(num1, num2) {
        return Math.floor(Number(num1) / Number(num2));
    }

    times(num1, num2) {
        return Number(num1) * Number(num2);
    }

    getAnswer(num1, num2, operator){
        if(this[operator]) return this[operator](num1, num2);
        return null;
    }

    generateQuestion(maxNumber){
        const operators = ['plus', 'minus', 'divide', 'times'];

        const random = (max, digits = 2, min = 0) => {
            return (Math.floor(Math.random() * Math.pow(10, digits)) % (max + 1)) + min;
        }

        let first = random(maxNumber);
        let second = random(maxNumber);
        let operator = operators[random(3, 1)];
        let numbers = [first, second];
        
        first = Math.max(numbers[0], numbers[1]);
        second = Math.min(numbers[0], numbers[1]);

        if(operator === 'divide'){
            if(second === 0) second = random(maxNumber, 2, 1);
            first = random(15) * second;
        }

        return {numbers: {first, second}, operator};
    }

    async $$showQuestion(){

        let digitsLimit = 9;
        const gc = context('global');
        const given = gc.given.value;

        const limit = (number) => gc.timeLimit.value = number;
        const increment = (number) => gc.scoreIncrement.value = number;
        const penalty = (number) => gc.penalty.value = number;

        if(given > 150) digitsLimit = 100, limit(25), increment(20), penalty(10);
        else if(given > 100) digitsLimit = 75, limit(20), increment(15), penalty(7);
        else if(given > 50) digitsLimit = 50, limit(15), increment(13), penalty(6);
        else if(given > 20) digitsLimit = 25, limit(13), increment(10), penalty(5);
        else if(given > 10) digitsLimit = 15, increment(7), penalty(3);

        gc.question.value = this.generateQuestion(digitsLimit);
        gc.given.value++;
        this.send("questionShown");
    }

    async $$startGame(){
        const gc = context('global');

        gc.timer.value = gc.timeLimit.value;
        gc.given.value = 0;
        gc.lives.value = gc.maxLives.value;
        gc.score.value = 0;
        gc.gameOver.value = false;
        gc.penalty.value = 2;

        this.send('startTimer');
        this.send('showQuestion');
    }

    async $$answerSubmitted(data){

        if(context('global').gameOver.value !== false) return;

        let ed = EventData.parse(data);
    
        const question  = ed.message.question;
        const answer = ed.message.answer;
        const {first, second} = question.numbers;

        let expected = this.getAnswer(first, second, question.operator) - 0;
        let correct = Number(answer) == expected;

        ed.message.correct = correct;

        if(correct){
            return this.send('answerCorrect', eData(ed.meta, ed.message));
        }

        return this.send('answerWrong', eData(ed.meta, ed.message));
    }

    async $$answerCorrect_answerWrong(data){
        let ed = EventData.parse(data);

        const {correct} = ed.message;
        const gc = context('global');

        if(!correct && gc.timer.value != 0) return gc.score.value -= gc.penalty.value;
        
        if(!correct && gc.timer.value == 0) {
            gc.lives.value--;
        }

        if(correct) {
            gc.score.value += (gc.scoreIncrement.value + Math.max(gc.timer.value - 7, 0));

            if(gc.given.value % 20 === 0 && gc.lives.value < gc.maxLives.value){
                gc.lives.value++;
            }
        }

        if(gc.lives.value <= 0 || gc.given.value >= gc.max.value){
            return this.send('gameOver');
        }

        gc.timer.value = gc.timeLimit.value;
        this.send('showQuestion');
    }

    async $$startTimer(){

        const changeTime = () => {
            let timer = context('global').timer;

            if(timer.value <= 0) {
                timer.value = 0;
                return broker.send('timeElapsed');
            }

            timer.value--;
        }

        context('global').timerId.value = setInterval(changeTime.bind(this), 1000);

    }

    async $$gameOver(){
        const gc = context('global');
        gc.gameOver.value = true;
        gc.timer.value = 0;

        clearInterval(gc.timerId.value);

        gc.highScore.value = Math.max(Number(gc.score.value), Number(gc.highScore.value));
        localStorage.setItem('highScore', gc.highScore.value);
    }

}