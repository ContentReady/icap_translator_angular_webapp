import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { isNullOrUndefined } from 'util';

interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}


@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {
  private stream;
  private recorder;
  private interval;
  private startTime;
  private _recorded = new Subject < any > ();
  private _recordingTime = new Subject < moment.Duration > ();
  private _recordingFailed = new Subject < string > ();

  constructor() {}
  
  getRecordedBlob(): Observable < RecordedAudioOutput > {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable < moment.Duration > {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable < string > {
    return this._recordingFailed.asObservable();
  }

  private toString(value) {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }

  private record() {

    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/webm'
    });

    this.recorder.record();
    this.startTime = moment();
    this.interval = setInterval(
      () => {
        const currentTime = moment();
        const diffTime = moment.duration(currentTime.diff(this.startTime));
        const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
        // this._recordingTime.next(time);
        this._recordingTime.next(diffTime);
      },
      1000
    );
  }

  startRecording() {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }
    this._recordingTime.next(moment.duration(0));
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(s => {
      this.stream = s;
      this.record();
    }).catch(error => {
      this._recordingFailed.next();
    });
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop((blob) => {
        if (this.startTime) {
          const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
          this.stopMedia();
          this._recorded.next({
            blob: blob,
            title: mp3Name
          });
        }
      }, () => {
        this.stopMedia();
        this._recordingFailed.next();
      });
    }
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }

  abortRecording() {
    this.stopMedia();
  }
}
