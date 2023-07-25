class Component extends OpenScript.Component {}

class KeyPad extends Component {

    render(...args) {

        let rows = [];

        for(let i = 9; i >= 0; i -= 3){
            let buttons = [];

            for(let j = 2; j >= 0; j--){
                if(i == 0) break;
                buttons.push(
                    h.div(                        
                        {class: "col-4"},
                        h.button(
                            {
                                class: "btn btn-outline-dark btn-number",
                                data_number: i - j,
                                onclick: this.method('click', [i - j])
                            },
                            i - j
                        )
                    )
                );
            }

            if(i === 0) {
                buttons.push(
                    h.div(                        
                        {class: "col-4"},
                        h.button(                            
                            {
                                class: "btn btn-danger btn-clear",
                                onclick: this.method('clear')
                            },
                            h.i({ class: "fa-solid fa-xmark"})
                        )
                    ), 
                    h.div(                        
                        {class: "col-4"},
                        h.button(
                            {
                                class: "btn btn-outline-dark btn-number",
                                data_number: "0",
                                onclick: this.method('click', [0])
                            },
                            0
                        )
                    ), 
                    h.div(                        
                        {class: "col-4"},
                        h.button(                            
                            {
                                class: "btn btn-success btn-clear",
                                onclick: this.method('submit')
                            },
                            h.i({class: "fa-solid fa-check"})
                        )
                    )
                );
            }

            rows.push(
                h.div(                    
                    {class: "row mt-2-"},
                    buttons
                ), 
            );

            buttons = [];
        }

        return h.div(
            {class: 'row row-keypad mt-5'},

            h.div(
                {class: 'col-12'},
                rows
            ),
            ...args
        )
    }

    click(number){
        this.emit('keyInput', [number]);
    }

    submit(){
        this.emit('keySubmit')
    }

    clear(){
        this.emit('keyClear');
    }

}

class Question extends Component {

    render(question, ...args){
        let q = question.value;
        return h.div(        
            {class: "d-flex mb-2 text-center justify-content-center align-items-center"},
            h.div(            
                {class: "box-op-number border rounded"},
                h.span(
                    {
                        class: "fs-4 fw-bold text-dark",
                        id: "num-1"
                    },
                    q?.numbers?.first
                )
            ),
            h.div(            
                {class: "box-op-sign border px-2 rounded-circle fs-5 fw-bold mx-4"},
                h.i({
                        class: `fas fa-${q?.operator}`,
                        id: "operator"
                    })
            ), 
            h.div(            
                {class: "box-op-number border rounded"},
                h.span(
                    {
                        class: "fs-4 fw-bold text-dark",
                        id: "num-2"
                    },
                    q?.numbers?.second
                )
            ),
            ...args
        );
    }


}

class Index extends Component {
    gc;

    constructor(){
        super();

        fetchContext(['global'], 'Groups.Urgent');
        this.gc = context('global');

        this.gc.states({
            question: {},
            timer: 0,
            score: 0,
            lives: 0,
            given: 0,
            max: 0,
            input: 0
        });
    }

    render(...args){
        
        return h.div(    
            {class: "container"},
            h.div(        
                {class: "row-scores d-flex gap-2 fw-bolder mb-2 justify-content-center"},
                h.div(            
                    {class: "border px-3 py-1 text-center rounded-pill shadow-sm"},
                    h.span("Score:"), 
                    h.span(
                        {id: 'score'}, " ",
                        v(this.gc.score)
                    )
                ), 
                 
                h.div(            
                    {class: "border px-3 py-1 text-center rounded-pill shadow-sm"},
                    h.span("High:"), 
                    h.span(
                        {id: 'high-score'}, " ",
                        v(this.gc.highScore)
                    )
                ),

                h.div(            
                    {
                        class: "border px-3 py-1 text-center text-danger rounded-pill shadow-sm",
                        onclick: 'broker.send("gameOver")'
                    },
                    h.i({class: 'fa-solid fa-xmark'})
                ),

                h.div(            
                    {
                        class: "border px-3 py-1 text-center text-success rounded-pill shadow-sm",
                        onclick: 'broker.send("startGame")'
                    },
                    h.i({class: 'fas fa-play'})
                )
            ), 
            h.div(        
                {class: "row row-lives mb-2"},
                h.div(            
                    {class: "col col-9"},
                    h.div(                
                        {
                            class: "lives",
                            id: "lives"
                        },
                        v(this.gc.lives, (lives) => {
                            let hearts = [];

                            for(let i = 0; i < lives.value; i++){
                                hearts.push(h.i({class: 'fas fa-heart mx-1'}))
                            }

                            return hearts;
                        })
                    )
                ), 
                h.div(            
                    {class: "col col-3 text-end"},
                    h.div(                
                        {class: "box-timer border rounded-circle text-center"},
                        v(this.gc.timer)
                    )
                )
            ),
            h.div(
                {class: 'row-questions text-center text-muted text-sm mb-1'},
                v(this.gc.given), ' / ', v(this.gc.max), ' questions.'
            ),

            h.Question(this.gc.question),
            h.div(        
                {class: "mb-2 text-center"},
                h.div(            
                    {
                        class: "border rounded-pill w-50 mx-auto",
                        id: "answer-input"
                    },
                    h.h1(v(this.gc.input))
                )
            ), 
            h.KeyPad()
        )
    }

    $_rendered_rerendered(){
        broker.send('startGame');
    }

    $_keyInput$KeyPad(component, event, number){
        this.gc.input.value = Number(this.gc.input.value + `${number}`);
    }

    $_keySubmit$KeyPad(...args){
        broker.send("answerSubmitted", eData({}, this.getSubmission()));
    }

    $_keyClear$KeyPad(...args){
        this.clearInput();
    }

    getSubmission(){
        const answer = Number(this.gc.input.value);
        const question = this.gc.question.value;

        this.clearInput(true);

        return {answer, question};
    }

    $$timeElapsed(){
        if(this.gc.gameOver.value === true) return;

        broker.send("answerSubmitted", eData({}, this.getSubmission()));
    }

    $$answerCorrect(){
        
        let elem = document.querySelector('#answer-input');
        elem.classList.add('border-success');

        setTimeout(() => {
            elem.classList.remove('border-success');
        }, 1000);
    }

    $$answerWrong(){

        let elem = document.querySelector('#answer-input');
        elem.classList.add('border-danger');

        setTimeout(() => {
            elem.classList.remove('border-danger');
        }, 1000);

    }

    clearInput(all = false){
        if(all) return this.gc.input.value = 0;

        let curr = "" + this.gc.input.value;
        if(curr.length === 1) curr = 0;
        else curr = curr.substring(0, curr.length - 1);

        this.gc.input.value = curr;
    }
}