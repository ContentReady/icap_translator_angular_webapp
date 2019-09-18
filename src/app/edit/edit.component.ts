import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DbService } from '../services/db.service';
import { ActivatedRoute } from '@angular/router';
import { first } from "rxjs/operators";
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  video = {};
  frames = {};
  frameNumbers = [];
  currentOSTFrame = 0;
  objectKeys = Object.keys;
  frameDimensions = [1920,1080]; // Actual dimensions of the frame. Used in scaling.

  @ViewChild('ostCleanImage', {static:false}) ostCleanImage:ElementRef;
  constructor(
    private db: DbService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.getFrames(params.id); 
      }
    });
  }

  async getFrames(video_ref) {
    this.video = (await this.db.getVideoByRef(video_ref))['data'];
    this.video['frames'].map(frame => {
      this.frames[frame.number] = {
        boxes: [],
        cleanImage: `${environment.cmsEndpoint}${frame.clean_image}`,
        finalImage: `${environment.cmsEndpoint}${frame.final_image}`
      };
      const boxes = JSON.parse(frame.boxes);
      boxes.map((coords, i) => {
        this.frames[frame.number].boxes.push({
          'coords': coords,
          'text': `Box ${i+1}`
        });
      });
      this.frameNumbers.push(frame.number);
    });
    this.frameNumbers.sort((a, b) => a - b);
  }

  getCoords(boxNumber) {
    let top = 0;
    let left = 0;
    let scaleX = 1;
    let scaleY = 1;
    if (this.ostCleanImage) {
      scaleX = this.ostCleanImage.nativeElement.offsetWidth/this.frameDimensions[0];    
      scaleY = this.ostCleanImage.nativeElement.offsetHeight/this.frameDimensions[1];
      left = this.frames[this.currentOSTFrame].boxes[boxNumber].coords[0]*scaleX; 
      top = this.frames[this.currentOSTFrame].boxes[boxNumber].coords[1]*scaleY;
    }
    const style = {
      top: `${top}px`,
      left: `${left}px`,
      // 'font-size': `${scaleX}rem`
    }
    return style;
  }

}
