import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-translated-video',
  templateUrl: './translated-video.component.html',
  styleUrls: ['./translated-video.component.css']
})
export class TranslatedVideoComponent implements OnInit {
  video = {};
  cleanVideoUrl = '';
  translatedVideoUrl = '';
  constructor(
    private db: DbService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.pipe(first()).subscribe(async params => {
      if (params.id) {
        this.video = (await this.db.getTranslatedVideo(params.id))['data'];
        if (this.video['clean_video']) {
          this.cleanVideoUrl = `${environment.cmsEndpoint}${this.video['clean_video']}`;
        }
        if (this.video['video']) {
          this.translatedVideoUrl = `${environment.cmsEndpoint}${this.video['video']}`;
        }
        // console.log(this.cleanVideoUrl);
      }
      console.log(this.video);
    });
  }

}
