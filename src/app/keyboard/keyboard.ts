import { Component, Output, EventEmitter, input, signal } from '@angular/core';

@Component({
  selector: 'app-keyboard',
  imports: [],
  templateUrl: './keyboard.html',
  styleUrl: './keyboard.css',
})
export class Keyboard {
  @Output() keyPress = new EventEmitter<string>();

  onKeyClick(key: string) {
    this.keyPress.emit(key);
  } 

  possibleLetters = input.required<Set<string>>();
  sureLetters = input.required<Set<string>>();
  rejectedLetters = input.required<Set<string>>();
  fixedLetters = input.required<Map<string, number>>();
  
  rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];
  
  // special row for Czech accents
  czechKeys = [
    ['Ž', 'Š', 'Č', 'Ř', 'Ď', 'Ť', 'Ň'],
    ['Á','É','Ě', 'Í', 'Ó', 'Ú', 'Ů',  'Ý']
  ];
}

