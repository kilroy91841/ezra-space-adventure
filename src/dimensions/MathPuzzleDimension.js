import { Dimension, DimensionType } from './Dimension.js';

export class MathPuzzleDimension extends Dimension {
    constructor(number, name) {
        super(number, DimensionType.PUZZLE, name);
        this.problems = [];
        this.currentProblemIndex = 0;
        this.userAnswer = '';
        this.feedback = '';
        this.feedbackColor = '#fff';
        this.correctCount = 0;
        this.requiredCorrect = 5; // Need to solve 5 problems
        this.showingFeedback = false;
        this.feedbackTimer = 0;
    }

    onEnter(gameState) {
        this.currentProblemIndex = 0;
        this.userAnswer = '';
        this.feedback = '';
        this.correctCount = 0;
        this.showingFeedback = false;

        // Generate story-based math problems!
        this.problems = this.generateProblems(gameState);
    }

    generateProblems(gameState) {
        const problems = [];
        const powerups = Math.floor(Math.random() * 10 + 5); // Random power-ups for problems

        // Problem 1: Addition with story
        problems.push({
            question: "You collected " + Math.floor(Math.random() * 20 + 10) + " power-ups in Dimension 1 and " + Math.floor(Math.random() * 30 + 20) + " in Dimension 2. How many total?",
            answer: null // Will calculate
        });
        const p1_a = parseInt(problems[0].question.match(/\d+/g)[0]);
        const p1_b = parseInt(problems[0].question.match(/\d+/g)[1]);
        problems[0].answer = p1_a + p1_b;

        // Problem 2: Multiplication
        const shots = Math.floor(Math.random() * 10 + 5);
        const seconds = Math.floor(Math.random() * 8 + 3);
        problems.push({
            question: `The alien can shoot ${shots} times per second. If he shoots for ${seconds} seconds, how many total shots?`,
            answer: shots * seconds
        });

        // Problem 3: Subtraction
        const needed = Math.floor(Math.random() * 50 + 100);
        const have = Math.floor(Math.random() * 40 + 30);
        problems.push({
            question: `You need ${needed} power-ups to defeat the dragon. You have ${have}. How many more do you need?`,
            answer: needed - have
        });

        // Problem 4: Multiplication (harder)
        const heads = Math.floor(Math.random() * 4 + 3);
        const fireballs = Math.floor(Math.random() * 10 + 8);
        problems.push({
            question: `The dragon has ${heads} heads and each head shoots ${fireballs} fireballs. How many fireballs total?`,
            answer: heads * fireballs
        });

        // Problem 5: Mixed (harder)
        const weapons = Math.floor(Math.random() * 3 + 3);
        const damage = Math.floor(Math.random() * 8 + 5);
        const bonus = powerups > 0 ? powerups : Math.floor(Math.random() * 10 + 5);
        problems.push({
            question: `Your robot has ${weapons} weapons. Each does ${damage} damage. You have ${bonus} power-ups adding +${bonus} damage. What's your TOTAL damage with all weapons?`,
            answer: (weapons * damage) + bonus
        });

        return problems;
    }

    update(deltaTime, gameState, player) {
        if (this.showingFeedback) {
            this.feedbackTimer += deltaTime;
            if (this.feedbackTimer > 60) { // 1 second
                this.showingFeedback = false;
                this.feedbackTimer = 0;

                // Move to next problem if correct
                if (this.feedback.includes('Correct')) {
                    this.currentProblemIndex++;
                    this.userAnswer = '';
                    this.feedback = '';

                    // Check if done
                    if (this.correctCount >= this.requiredCorrect) {
                        this.complete();
                    }
                } else {
                    // Wrong answer - clear and try again
                    this.userAnswer = '';
                    this.feedback = '';
                }
            }
        }
    }

    handleKeyPress(key) {
        if (this.showingFeedback || this.completed) return;

        // Number keys
        if (key >= '0' && key <= '9') {
            this.userAnswer += key;
        }
        // Backspace
        else if (key === 'Backspace') {
            this.userAnswer = this.userAnswer.slice(0, -1);
        }
        // Enter - submit answer
        else if (key === 'Enter') {
            this.checkAnswer();
        }
    }

    checkAnswer() {
        if (this.userAnswer === '' || this.currentProblemIndex >= this.problems.length) return;

        const problem = this.problems[this.currentProblemIndex];
        const userNum = parseInt(this.userAnswer);

        if (userNum === problem.answer) {
            this.feedback = 'Correct! 🎉';
            this.feedbackColor = '#00ff00';
            this.correctCount++;
            this.showingFeedback = true;
        } else {
            this.feedback = `Not quite! Try again. (Hint: The answer is ${problem.answer > userNum ? 'bigger' : 'smaller'})`;
            this.feedbackColor = '#ff6666';
            this.showingFeedback = true;
        }
    }

    render(ctx) {
        if (this.currentProblemIndex >= this.problems.length) {
            // All done!
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 48px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('MATH MASTER!', 400, 250);

            ctx.fillStyle = '#fff';
            ctx.font = '24px Courier New';
            ctx.fillText(`You solved ${this.correctCount} problems!`, 400, 320);
            return;
        }

        const problem = this.problems[this.currentProblemIndex];

        // Title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ MATH PUZZLE DIMENSION ⚡', 400, 80);

        // Progress
        ctx.fillStyle = '#fff';
        ctx.font = '20px Courier New';
        ctx.fillText(`Problem ${this.currentProblemIndex + 1} of ${this.problems.length}`, 400, 120);
        ctx.fillText(`Correct: ${this.correctCount}`, 400, 145);

        // Question box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 180, 700, 120);

        ctx.fillStyle = '#fff';
        ctx.font = '22px Courier New';
        ctx.textAlign = 'center';

        // Wrap text if needed
        const words = problem.question.split(' ');
        let line = '';
        let y = 225;
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 650 && line !== '') {
                ctx.fillText(line, 400, y);
                line = word + ' ';
                y += 30;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, 400, y);

        // Answer box
        ctx.fillStyle = '#333';
        ctx.fillRect(250, 340, 300, 60);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(250, 340, 300, 60);

        // User's answer
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(this.userAnswer || '_____', 400, 380);

        // Instructions
        ctx.fillStyle = '#aaa';
        ctx.font = '18px Courier New';
        ctx.fillText('Type your answer and press ENTER', 400, 440);

        // Feedback
        if (this.showingFeedback && this.feedback) {
            ctx.fillStyle = this.feedbackColor;
            ctx.font = 'bold 28px Courier New';
            ctx.fillText(this.feedback, 400, 500);
        }

        // Hint text
        if (!this.showingFeedback) {
            ctx.fillStyle = '#888';
            ctx.font = '16px Courier New';
            ctx.fillText('(Use Backspace to delete)', 400, 550);
        }
    }
}
