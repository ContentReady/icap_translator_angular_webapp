import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-translated',
  templateUrl: './translated.component.html',
  styleUrls: ['./translated.component.css']
})
export class TranslatedComponent implements OnInit {

  videos: [];

  constructor(
    private db: DbService,
  ) { }

  async ngOnInit() {
    this.videos = (await this.db.getTranslatedVideos())['data'];
  }

}
