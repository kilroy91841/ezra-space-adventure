// src/scenes/MathPuzzleScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { DIMENSION_ORDER } from '../config/dimensions';
import { GameData } from '../config/types';

interface MathProblem {
  question: string;
  answer: number;
}

export class MathPuzzleScene extends Phaser.Scene {
  private problems: MathProblem[] = [];
  private currentProblemIndex: number = 0;
  private userAnswer: string = '';
  private correctCount: number = 0;
  private requiredCorrect: number = 5;
  private feedbackText?: Phaser.GameObjects.Text;
  private answerText?: Phaser.GameObjects.Text;
  private questionText?: Phaser.GameObjects.Text;
  private progressText?: Phaser.GameObjects.Text;
  private gameData!: GameData;

  constructor() {
    super({ key: 'MathPuzzleScene' });
  }

  create(): void {
    this.gameData = this.registry.get('gameData') as GameData;
    this.cameras.main.setBackgroundColor('#000000');

    // Reset state
    this.currentProblemIndex = 0;
    this.userAnswer = '';
    this.correctCount = 0;
    this.problems = this.generateProblems();

    // Stars
    for (let i = 0; i < 60; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2), 0xffffff
      );
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 60, 'MATH PUZZLE DIMENSION', {
      fontFamily: 'Courier New', fontSize: '36px', color: '#00ffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Progress
    this.progressText = this.add.text(GAME_WIDTH / 2, 110, '', {
      fontFamily: 'Courier New', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);

    // Question box border
    this.add.rectangle(GAME_WIDTH / 2, 250, 800, 140).setStrokeStyle(3, 0x00ff00);

    // Question text
    this.questionText = this.add.text(GAME_WIDTH / 2, 250, '', {
      fontFamily: 'Courier New', fontSize: '22px', color: '#ffffff',
      align: 'center', wordWrap: { width: 750 },
    }).setOrigin(0.5);

    // Answer box
    this.add.rectangle(GAME_WIDTH / 2, 400, 300, 60, 0x333333).setStrokeStyle(3, 0x00ff00);

    // Answer text
    this.answerText = this.add.text(GAME_WIDTH / 2, 400, '_____', {
      fontFamily: 'Courier New', fontSize: '36px', color: '#ffff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Instructions
    this.add.text(GAME_WIDTH / 2, 460, 'Type your answer and press ENTER', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 490, '(Use Backspace to delete)', {
      fontFamily: 'Courier New', fontSize: '16px', color: '#888888',
    }).setOrigin(0.5);

    // Feedback text (initially hidden)
    this.feedbackText = this.add.text(GAME_WIDTH / 2, 550, '', {
      fontFamily: 'Courier New', fontSize: '28px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Keyboard input
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyPress(event.key);
    });

    // Show first problem
    this.showProblem();
  }

  private generateProblems(): MathProblem[] {
    const problems: MathProblem[] = [];

    // Problem 1: Addition
    const p1a = Phaser.Math.Between(10, 30);
    const p1b = Phaser.Math.Between(20, 50);
    problems.push({
      question: `You collected ${p1a} power-ups in the first dimension and ${p1b} in the second dimension. How many total?`,
      answer: p1a + p1b,
    });

    // Problem 2: Multiplication
    const shots = Phaser.Math.Between(5, 15);
    const seconds = Phaser.Math.Between(3, 10);
    problems.push({
      question: `The alien can shoot ${shots} times per second. If he shoots for ${seconds} seconds, how many total shots?`,
      answer: shots * seconds,
    });

    // Problem 3: Subtraction
    const needed = Phaser.Math.Between(100, 150);
    const have = Phaser.Math.Between(30, 70);
    problems.push({
      question: `To defeat the dragon you need ${needed} power-ups total. You have ${have} power-ups. How many more do you need?`,
      answer: needed - have,
    });

    // Problem 4: Multiplication (harder)
    const heads = Phaser.Math.Between(3, 6);
    const fireballs = Phaser.Math.Between(8, 18);
    problems.push({
      question: `The dragon has ${heads} heads and each head shoots ${fireballs} fireballs. How many fireballs total?`,
      answer: heads * fireballs,
    });

    // Problem 5: Mixed
    const weapons = Phaser.Math.Between(3, 5);
    const damage = Phaser.Math.Between(5, 12);
    const bonus = Phaser.Math.Between(5, 15);
    problems.push({
      question: `Your robot has ${weapons} weapons. Each does ${damage} damage. You have ${bonus} power-ups adding +${bonus} damage. What's your TOTAL damage with all weapons?`,
      answer: (weapons * damage) + bonus,
    });

    return problems;
  }

  private showProblem(): void {
    if (this.currentProblemIndex >= this.problems.length) {
      this.showComplete();
      return;
    }

    const problem = this.problems[this.currentProblemIndex]!;
    this.progressText?.setText(`Problem ${this.currentProblemIndex + 1} of ${this.problems.length}  |  Correct: ${this.correctCount}`);
    this.questionText?.setText(problem.question);
    this.answerText?.setText('_____');
    this.feedbackText?.setText('');
    this.userAnswer = '';
  }

  private handleKeyPress(key: string): void {
    if (this.currentProblemIndex >= this.problems.length) return;

    if (key >= '0' && key <= '9') {
      this.userAnswer += key;
      this.answerText?.setText(this.userAnswer);
    } else if (key === 'Backspace') {
      this.userAnswer = this.userAnswer.slice(0, -1);
      this.answerText?.setText(this.userAnswer || '_____');
    } else if (key === 'Enter') {
      this.checkAnswer();
    }
  }

  private checkAnswer(): void {
    if (this.userAnswer === '' || this.currentProblemIndex >= this.problems.length) return;

    const problem = this.problems[this.currentProblemIndex]!;
    const userNum = parseInt(this.userAnswer);

    if (userNum === problem.answer) {
      this.feedbackText?.setText('Correct!').setColor('#00ff00');
      this.correctCount++;
      this.gameData.score += 100;
      this.registry.set('gameData', this.gameData);

      // Advance after delay
      this.time.delayedCall(1000, () => {
        this.currentProblemIndex++;
        this.showProblem();
      });
    } else {
      const hint = problem.answer > userNum ? 'bigger' : 'smaller';
      this.feedbackText?.setText(`Not quite! Try again. (Hint: ${hint})`).setColor('#ff6666');
      this.userAnswer = '';

      this.time.delayedCall(1000, () => {
        this.answerText?.setText('_____');
        this.feedbackText?.setText('');
      });
    }
  }

  private showComplete(): void {
    this.questionText?.setText('');
    this.answerText?.setText('');
    this.feedbackText?.setText('');
    this.progressText?.setText('');

    this.add.text(GAME_WIDTH / 2, 300, 'MATH MASTER!', {
      fontFamily: 'Courier New', fontSize: '48px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 370, `You solved ${this.correctCount} problems!`, {
      fontFamily: 'Courier New', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    // Advance to next dimension after 3 seconds
    this.time.delayedCall(3000, () => {
      this.gameData.currentDimension++;
      this.registry.set('gameData', this.gameData);
      const nextDim = DIMENSION_ORDER[this.gameData.currentDimension];
      if (nextDim) {
        this.cameras.main.fade(500, 0, 0, 0, false, (_cam: unknown, progress: number) => {
          if (progress === 1) {
            this.scene.start(nextDim.sceneKey, { dimensionIndex: this.gameData.currentDimension });
          }
        });
      } else {
        this.scene.start('VictoryScene');
      }
    });
  }
}
