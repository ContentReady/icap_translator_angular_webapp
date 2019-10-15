import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { DbService } from '../services/db.service';
import { ActivatedRoute } from '@angular/router';
import { first } from "rxjs/operators";
import {environment} from '../../environments/environment';
import { AudioRecordingService } from '../services/audiorecording.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FontpickerComponent } from '../common/fontpicker/fontpicker.component';

interface TranslationRequest {
  email?: String;
  source_video: String;
  frames: Array<Frame>;
  voiceovers: Array<Voiceover>;
  language: String;
  video_mode: String;
}

interface Frame {
  number: Number;
  boxes: String;
  clean_image?: String;
  final_image?: String;
}

interface Voiceover {
  start: Number;
  end?: Number;
  duration: Number;
  wav?: String;
  transcript?: String;
  original_duration: Number;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy {
  email = '';
  availableLanguages = [];
  video = {};
  frames = {};
  frameNumbers = [];
  originalVoiceovers = {};
  voiceoverStarts = [];
  isRecording = false;
  recordedTime;
  currentVoiceoverStart;
  recordedVoiceovers = {};
  scaleX = 0;
  scaleY = 0;
  request:TranslationRequest = {
    email: '',
    language: 'English',
    source_video: '',
    frames: [],
    voiceovers: [],
    video_mode: 'pause_frame'
  };
  videoModeOptions = {
    'slow_down_video': 'Slow Down Video',
    'speed_up_video': 'Speed Up Video',
    'slow_down_audio': 'Slow Down Audio',
    'speed_up_audio': 'Speed Up Audio',
    'pause_frame': 'Pause Frame',
  };
  pageIndex = 0;
  pageSize = 50;
  canSubmit = true;
  objectKeys = Object.keys;
  frameDimensions = [1920,1080]; // Actual dimensions of the frame. Used in scaling.

  @ViewChild('ostCleanImage', {static:false}) ostCleanImage:ElementRef;
  constructor(
    private db: DbService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private audioRecordingService: AudioRecordingService,
    private dialog: MatDialog
  ) { 
    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
      this.currentVoiceoverStart = null;
    });

    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time.asSeconds();
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
      this.recordedVoiceovers[this.currentVoiceoverStart] = {
        blob: data.blob,
        safeUrl: safeUrl,
        start: this.currentVoiceoverStart,
        duration: this.recordedTime
      }
      this.currentVoiceoverStart = null;
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async ngOnInit() {
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.request.source_video = params.id;
        this.getLanguages();
        this.getVideoData(params.id);
      }
    });
  }

  async getLanguages() {
    this.availableLanguages = (await this.db.getAvailableLanguages())['message'];
    //this.request.language = this.availableLanguages[0].title;
  }

  async getVideoData(video_ref) {
    this.video = (await this.db.getVideoByRef(video_ref))['data'];
    this.video['frames'].map(frame => {
      const temp_frame = {
        number: frame.number,
        boxes: [],
        cleanImage: `${environment.cmsEndpoint}${frame.clean_image}`,
        finalImage: `${environment.cmsEndpoint}${frame.final_image}`
      };
      const boxes = JSON.parse(frame.boxes);
      const tempBoxes = {};
      const distances = [];
      boxes.map((coords, i) => {
        const dist = coords[0]*coords[1]; // diagonal distance from top left; used to number boxes
        tempBoxes[dist] = coords;
        distances.push(dist);
      });
      distances.sort((a,b) => a-b);
      distances.forEach((dist,i) => {
        temp_frame.boxes.push({
          'coords': tempBoxes[dist],
          'text': `Text ${i+1}`,
          'fontsize': 40,
          'fontcolor': '#000000'
        });
      });
      if (temp_frame.boxes.length > 0) {
        this.frames[frame.number] = temp_frame;
        this.frameNumbers.push(frame.number);
      }
    });
    this.frameNumbers.sort((a, b) => a - b);
    this.video['voiceovers'].map(voiceover => {
      this.originalVoiceovers[voiceover.start] = {
        wav: voiceover.wav ? `${environment.cmsEndpoint}${voiceover.wav}`: '',
        start: voiceover.start,
        duration: voiceover.duration,
        end: voiceover.end,
        transcript: voiceover.transcript,
      };
      this.voiceoverStarts.push(voiceover.start);
    });
    this.voiceoverStarts.sort((a, b) => a - b);
  }

  getCoords(frameNumber,boxNumber) {
    let top = 0;
    let left = 0;
    let tempScaleX = 1;
    let tempScaleY = 1;
    const standardFontSize = 16; // pt
    let fontsize = 40; // pt
    let color = '#FF0000';
    if (this.ostCleanImage) {
		if(this.scaleX == 0) {
				tempScaleX = this.ostCleanImage.nativeElement.offsetWidth/this.frameDimensions[0];
				if (tempScaleX > 0) {
					this.scaleX = tempScaleX;
				}
		}
		if(this.scaleY == 0) {
				tempScaleY = this.ostCleanImage.nativeElement.offsetHeight/this.frameDimensions[1];
				if (tempScaleY > 0) {
					this.scaleY = tempScaleY;
				}
		}
      left = this.frames[frameNumber].boxes[boxNumber].coords[0]*this.scaleX; 
      top = this.frames[frameNumber].boxes[boxNumber].coords[1]*this.scaleY;
      fontsize = this.frames[frameNumber].boxes[boxNumber].fontsize;
      color = this.frames[frameNumber].boxes[boxNumber].fontcolor;
    }
    const style = {
      top: `${top}px`,
      left: `${left}px`,
      'font-size': `${fontsize/standardFontSize*this.scaleY}rem`,
      color: color
    }
    return style;
  }

  onPageChange(evt) {
    this.pageIndex = evt.pageIndex;
  }

  ignoreFrame(frameNumber){
    delete this.frames[frameNumber];
    this.frameNumbers.splice(this.frameNumbers.indexOf(frameNumber),1);
  }

  copyPreviousFrame(frameNumber, prevIndex){
    const prevFrameNumber = this.frameNumbers[prevIndex];
    // this.frames[frameNumber] = this.frames[prevFrameNumber];
    this.frames[frameNumber].boxes.forEach((box,i) => {
      box.text = this.frames[prevFrameNumber].boxes[i].text;
      box.fontsize = this.frames[prevFrameNumber].boxes[i].fontsize;
      box.fontcolor = this.frames[prevFrameNumber].boxes[i].fontcolor;
    });
  }

  openFontDialog(frameNumber,boxNumber){
    let font = {
      size: this.frames[frameNumber].boxes[boxNumber].fontsize,
      color: this.frames[frameNumber].boxes[boxNumber].fontcolor,
    }
    const dialogRef = this.dialog.open(FontpickerComponent, {
      width: '800px',
      data: {
        size: this.frames[frameNumber].boxes[boxNumber].fontsize,
        color: this.frames[frameNumber].boxes[boxNumber].fontcolor,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.frames[frameNumber].boxes[boxNumber].fontsize = result.size;
        this.frames[frameNumber].boxes[boxNumber].fontcolor = result.color;
      }
    }, e => {
      console.error(e);
    });
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
    delete this.recordedVoiceovers[start];
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }

  async sendRequestToFrappe() {
    if (!confirm("Are you sure you want to submit this video for processing?")) {
      return false;
    } else {
      this.canSubmit = false;
      const msg = 'Submitting translation request. This is a time consuming process.';
      console.log(msg);
      alert(msg);
    }
    // reset before populating
    this.request.frames = [];
    this.request.voiceovers = [];
    Object.values(this.frames).map(frame => {
      const tempFrame: Frame = {
        number: frame['number'],
        boxes: JSON.stringify(frame['boxes'])
      }
      this.request.frames.push(tempFrame);
    });
    Object.values(this.recordedVoiceovers).map(voiceover => {
      const tempVoiceover: Voiceover = {
        start: voiceover['start'],
        duration: voiceover['duration'],
        end: voiceover['start'] + voiceover['duration'],
        original_duration: this.originalVoiceovers[voiceover['start']].duration
      }
      this.request.voiceovers.push(tempVoiceover);
    });
    const translationRequest = (await this.db.uploadTranslationRequest(this.request))['data'];
    if (translationRequest.name) {
      this.db.uploadVoiceovers(this.recordedVoiceovers,translationRequest);
    } else {
      const msg = 'Something went wrong. Please try again after some time.';
      console.log(msg);
      alert(msg);
    }
    await this.sleep(10000);
    alert(`Your request has been submitted successfully with the ID: ${translationRequest.name}. \nIf you entered your email, you will be notified once the video is ready to view.`);
    this.canSubmit = true;
  }

  resetAll(){
    // Behaviour to be defined. Empty text boxes? 
  }

}
