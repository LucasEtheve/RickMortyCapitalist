import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { World, Pallier, Product } from './world';

@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  server ="http://localhost:8080/"
  user=""
  constructor(private http: HttpClient) { }

  getUser() : string{
    return this.user;
  }

  setUser(user : string) : void{
    this.user=user;
  }

  getServer() : string{
    return this.server;
  }

  setServer(server : string) : void{
    this.server=server;
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error); 
  }

  getWorld(): Promise<World> {
    return this.http.get(this.server + "adventureisis/generic/world").toPromise().catch(this.handleError);
  };
}

