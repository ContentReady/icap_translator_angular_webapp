import { TestBed } from '@angular/core/testing';

import { AudioRecordingService } from './audiorecording.service';

describe('AudiorecordingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AudioRecordingService = TestBed.get(AudioRecordingService);
    expect(service).toBeTruthy();
  });
});
