import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  videos: [];

  constructor(
    private db: DbService,
  ) { }

  async ngOnInit() {
    try {
      this.videos = (await this.db.getSourceVideos())['data'];
    } catch(e) {
      console.trace(e);
    }
    // console.log(this.videos);
  }

}
