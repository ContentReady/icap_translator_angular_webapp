import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { DbService } from '../services/db.service';
import { ActivatedRoute } from '@angular/router';
import { first } from "rxjs/operators";
import {environment} from '../../environments/environment';
import { AudioRecordingService } from '../services/audiorecording.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {
  availableLanguages = [];
  selectedLanguage = {};
  selectedFontSize = 40;
  selectedFontColor = '#000000';
  video = {};
  frames = {};
  frameNumbers = [];
  currentOSTFrame = 0;
  originalVoiceovers = {};
  voiceoverStarts = [];
  isRecording = false;
  recordedTime;
  currentVoiceoverStart;
  recordedVoiceovers = {};
  safeAudioUrl: SafeUrl;
  objectKeys = Object.keys;
  frameDimensions = [1920,1080]; // Actual dimensions of the frame. Used in scaling.

  @ViewChild('ostCleanImage', {static:false}) ostCleanImage:ElementRef;
  constructor(
    private db: DbService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private audioRecordingService: AudioRecordingService,
  ) { 
    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
      this.currentVoiceoverStart = null;
    });

    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
      this.recordedVoiceovers[this.currentVoiceoverStart] = {
        blob: data.blob,
        safeUrl: safeUrl
      }
      this.currentVoiceoverStart = null;
    });
  }

  async ngOnInit() {
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.getLanguages();
        this.getVideoData(params.id);

      }
    });
  }

  async getLanguages() {
    this.availableLanguages = (await this.db.getAvailableLanguages())['message'];
    console.log(this.availableLanguages);
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
          'text': `Text ${i+1}`
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

  startRecording(start) {
    if (!this.isRecording) {
      this.currentVoiceoverStart = start;
      this.isRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
    }
  }
  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  deleteRecording(start) {
    // this.safeAudioUrl = null;
    delete this.recordedVoiceovers[start];
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }

}
