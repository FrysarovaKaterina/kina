import { Component } from '@angular/core';
import { Keyboard } from '../keyboard/keyboard';
import { signal } from "@angular/core";
import { HostListener } from '@angular/core';
import { afterNextRender } from '@angular/core';
import confetti from 'canvas-confetti';

declare const Audio: any;

@Component({
  selector: 'app-board',
  imports: [Keyboard],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  constructor() {
    afterNextRender(() => {
      this.loadRandomWord();
    });
  }

  board: string[][] = Array(10).fill(null).map(() => Array(5).fill(''));
  score: string[][] = Array(10).fill(null).map(() => Array(2).fill('?'));
  currentRow: number = 0;
  currentCol: number = 0;
  winner = signal<boolean>(false);
  loser = signal<boolean>(false);
  correctLetters: number = 0;
  correctPositions: number = 0;
  todayWord: string = '';
  allWords: string[] = [];
  sureLetters = signal<Set<string>>(new Set());
  possibleLetters = signal<Set<string>>(new Set());
  rejectedLetters = signal<Set<string>>(new Set());
  errorMessage = signal<string>('');
  winnerMessage: string = 'Dosáhli jste velkolepého vítězství!';
  fixedLetters = signal<Map<string, number>>(new Map());
  loserMessage: string = 'Bohužel jste prohráli. Zkuste to znovu zítra!';


  async loadRandomWord() {
    try {
      const response = await fetch('/slova.txt');
      const text = await response.text();
      this.allWords = text.split('\n').map(w => w.toUpperCase().trim()).filter(w => w.length > 0);

      if (this.allWords.length > 0) {
        // 1. Get the current date
        const now = new Date();

        // 2. Create a unique number for today (e.g., 20260123)
        const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + 1;

        // 3. Use modulo to pick an index based on the dates.tx
        const dailyIndex = (dateSeed * 123456 + 13) % this.allWords.length;

        this.todayWord = this.allWords[dailyIndex].toUpperCase();

        console.log("Dnešní slovo (seeded):", btoa(this.todayWord));
        this.loserMessage = 'Dnešní slovo bylo "' + this.todayWord.toString() + '". Snad budete mít víc štěstí zítra. :)';
      }
    } catch (error) {
      console.error("Error loading words:", error);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleHardwareKeyboard(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'Enter') {
      this.submitGuess();
      event.preventDefault();
    } else if (key === 'Backspace') {
      this.handleInput('⌫');
    } else if (key.length === 1 && key.match(/[a-zěščřžýáíéóúůďťň]/i)) {
      this.handleInput(key.toUpperCase());
    }
  }

  handleInput(key: string) {
    if (this.winner()) {
      return; // Ignore input if the game is already won
    }
    else if (key === '⌫') {
      this.removeLetter();
    } else if (key === 'ENTER') {
      this.submitGuess();
    } else {
      this.addLetter(key);
    }
  }

  removeLetter() {
    if (this.currentCol > 0) {
      // 1. Move the cursor back
      this.currentCol--;

      // 2. Set the value to an empty string
      this.board[this.currentRow][this.currentCol] = '';
    }

  }
  addLetter(letter: string) {
    if (this.currentCol < 5) {
      if (this.board[this.currentRow].includes(letter)) {
        this.notifyWrongLetter();
        return;
      }
      this.board[this.currentRow][this.currentCol] = letter;
      this.currentCol++;
    }
  }

  submitGuess() {
    if (this.currentCol === 5) {
      // Here we will check the guess against the target word
      let currentWord: string;
      currentWord = this.board[this.currentRow].join('');
      if (!this.isValidWord(currentWord)) {
        this.errorMessage.set("Neplatné slovo!");
        // Clear the message after 2 seconds
        setTimeout(() => {
          this.errorMessage.set('');
          console.log("Clearing error message");
        }, 2000);
        console.log("Invalid word guessed!");
        (document.getElementById('invalid-sound') as HTMLAudioElement).play();
        return;
      }
      this.correctLetters = 0;
      this.correctPositions = 0;

      for (let i = 0; i < 5; i++) {
        if (currentWord[i] === this.todayWord[i]) {
          this.correctPositions++;
        }
        if (this.todayWord.includes(currentWord[i])) {
          this.correctLetters++;
        }
      }
      this.score[this.currentRow][0] = this.correctLetters.toString();
      this.score[this.currentRow][1] = this.correctPositions.toString();
      if (this.correctPositions === 5) {
        (document.getElementById('victory-sound') as HTMLAudioElement).play();
        this.winner.set(true);
        this.showConfetti();
      } else if (this.currentRow === this.board.length - 1) {
        this.loser.set(true);
        (document.getElementById('loser-sound') as HTMLAudioElement).play();
      } else {
      (document.getElementById('success-sound') as HTMLAudioElement).play();
      }

      // Move to the next row 
      this.currentRow++;
      this.currentCol = 0;
    }
  }

  notifyWrongLetter() {
    this.errorMessage.set("Písmeno již bylo použito!");
    // Clear the message after 2 seconds
    setTimeout(() => {
      this.errorMessage.set('');
      console.log("Clearing error message");
    }, 2000);
    console.log("Letter already used in this guess!");
  }

  notifyInvalidWord() {
    this.errorMessage.set("Neplatné slovo!");
    // Clear the message after 2 seconds
    setTimeout(() => {
      this.errorMessage.set('');
      console.log("Clearing error message");
    }, 2000);
    console.log("Invalid word guessed!");
  }

  isValidWord(word: string): boolean {
    return this.allWords.includes(word);
  }

  toggleLetterStatus(letter: string, columnIndex: number) {
    if (this.possibleLetters().has(letter)) {
      this.possibleLetters().delete(letter);
      this.sureLetters().add(letter);
      this.fixedLetters().set(letter, columnIndex);
    } else if (this.sureLetters().has(letter)) {
      this.sureLetters().delete(letter);
      this.fixedLetters().delete(letter);
      this.rejectedLetters().add(letter);
    } else if (this.rejectedLetters().has(letter)) {
      this.rejectedLetters().delete(letter);
    } else {
      this.possibleLetters().add(letter);
    }
  }

  showConfetti() {
  const duration = 1.5 * 1000; // 1,5 seconds
  const end = Date.now() + duration;

  const frame = () => {
    // Launch confetti from the left
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 85,
      origin: { x: 0, y: 0.8 },
      colors: ['#f59760ff','#2ecc71', '#f1c40f', '#3498db']
    });
    // Launch confetti from the right
    confetti({
      particleCount: 2.2,
      shapes: ['circle', 'square'],
      angle: 110,
      spread: 95,
      origin: { x: 1, y: 0.75 },
      colors: ['#2ecc71', '#f1c40f', '#3498db']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

}