import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
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
  canRecord = false;
  originalVoiceovers = {};
  voiceoverStarts = [];
  isRecording = false;
  recordedAudio = [];
  stream: any;
  mediaRecorder: MediaRecorder;
  tempAudioUrl = '';
  safeAudioUrl: SafeUrl;
  objectKeys = Object.keys;
  frameDimensions = [1920,1080]; // Actual dimensions of the frame. Used in scaling.

  @ViewChild('ostCleanImage', {static:false}) ostCleanImage:ElementRef;
  constructor(
    private db: DbService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.getVideoData(params.id);
      }
    });
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setupRecorder(this.stream);
      this.canRecord = true;
    } catch(e) {
      console.error(e);
    }
    
  }

  async getVideoData(video_ref) {
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
    // console.log(this.video);
    this.video['voiceovers'].map(voiceover => {
      this.originalVoiceovers[voiceover.start] = {
        wav: `${environment.cmsEndpoint}${voiceover.wav}`,
        start: voiceover.start,
        duration: voiceover.duration,
        end: voiceover.end,
        transcript: voiceover.transcript,
      };
      this.voiceoverStarts.push(voiceover.start);
    });
    this.voiceoverStarts.sort((a, b) => a - b);
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
  
  wait(delayInMS) {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
  }

  setupRecorder(stream) {
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = event => this.recordedAudio.push(event.data);
  
    let stopped = new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = resolve;
      this.mediaRecorder.onerror = event => reject(event['name']);
    });
  
    return Promise.all([
      stopped,
    ])
    .then(() => this.recordedAudio);

  }

  startRecording() {
    this.isRecording = true;
    this.mediaRecorder.start();
  }

  stopRecording() {
    this.isRecording = false;
    this.stream.getTracks().forEach(track => track.stop());
    console.log(this.recordedAudio);
    console.log(typeof(this.recordedAudio));
    const blob = new Blob(this.recordedAudio, {'type':'audio/ogg; codecs=opus'});
    // this.recordedAudio = [];
    const tempAudioUrl = window.URL.createObjectURL(blob);
    console.log(tempAudioUrl);
    this.safeAudioUrl = this.sanitizer.bypassSecurityTrustUrl(tempAudioUrl);
    console.log(this.safeAudioUrl);
  }

  deleteRecording() {
    this.recordedAudio = [];
  }

}
