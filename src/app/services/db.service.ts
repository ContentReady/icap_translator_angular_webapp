import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private httpHeaders;

  constructor(
    private http: HttpClient,
  ) {
    this.httpHeaders = new HttpHeaders({
      'Content-Type':'application/json',
      'Accept': 'application/json',
      'Authorization': `token ${environment.cmsApiKey}:${environment.cmsApiSecret}`
    });
   }

  getSourceVideos() {
    const url = `${environment.cmsEndpoint}/api/resource/Source Video/?fields=["name","title"]&filters=[["Source Video","is_published","=",true]]`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  getVideoByRef(video_ref) {
    const url = `${environment.cmsEndpoint}/api/resource/Source Video/${video_ref}`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  getFramesForVideo(video_ref) {
    const url = `${environment.cmsEndpoint}/api/method/icap.api.get_frames?video_ref=${video_ref}`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  getAvailableLanguages() {
    const url = `${environment.cmsEndpoint}/api/method/icap.api.get_languages`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }
}
