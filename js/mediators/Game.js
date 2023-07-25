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

    multiply(num1, num2) {
        return Number(num1) * Number(num2);
    }

    getAnswer(num1, num2, operator){
        return this[operator](num1, num2);
    }

    generateQuestion(maxNumber){
        const operators = ['plus', 'minus', 'divide', 'times'];

        const random = (max, digits = 2) => {
            return Math.floor(Math.random() * Math.pow(10, digits)) % (max + 1);
        }

        let first = random(maxNumber);
        let second = random(maxNumber);
        let operator = operators[random(3, 1)];

        [first, second] = [Math.min(first, second), Math.max(first, second)];

        if(operator === 'divide'){
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

        if(given > 150) digitsLimit = 50, limit(25), increment(20);
        else if(given > 100) digitsLimit = 25, limit(20), increment(15);
        else if(given > 50) digitsLimit = 20, limit(15), increment(13);
        else if(given > 20) digitsLimit = 15, limit(13), increment(10);
        else if(given > 10) digitsLimit = 12, increment(7);

        gc.question.value = this.generateQuestion(digitsLimit);
        gc.given.value++;
        this.send("questionShown");
    }

    async $$startGame(){

        context('global').timer.value = context('global').timeLimit.value;
        this.send('showQuestion');
    }

    async $$answerSubmitted(data){
        let ed = EventData.parse(data);
    
        const question  = ed.message.question;
        const answer = ed.message.answer;
        const {first, second} = question.numbers;

        let expected = this.getAnswer(first, second, question.operator) - 0;
        let correct = answer == expected;

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

        if(!correct && gc.timer.value != 0) return;
        
        if(!correct && gc.timer.value == 0) {
            gc.lives.value--;
        }

        if(correct) {
            gc.score.value += gc.scoreIncrement.value;
        }

        gc.timer.value = gc.timeLimit.value;
        this.send('showQuestion');
    }

    async $$questionShown(){
        this.send('startTimer');
    }

    async $$startTimer(){
        let timer = context('global').timer;

        const changeTime = () => {
            if(timer.value <= 0) {
                return this.send('timeElapsed');
            }

            timer.value--;
            setTimeout(changeTime, 1000);
        }

        setTimeout(changeTime.bind(this), 1000);
    }

}