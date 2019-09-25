import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

interface Font {
  size: Number;
  color: String;
}

@Component({
  selector: 'app-fontpicker',
  templateUrl: './fontpicker.component.html',
  styleUrls: ['./fontpicker.component.css']
})
export class FontpickerComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public font: Font
  ) { }

  ngOnInit() {
  }

}
