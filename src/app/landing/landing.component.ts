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
    this.videos = (await this.db.getSourceVideos())['data'];
    // console.log(this.videos);
  }

}
