import { ThisReceiver } from '@angular/compiler';
import { Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Product } from '../world';



@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})

export class ProductComponent implements OnInit {
  server ="http://localhost:8080/";
  lastupdate = 0;
  progressbarvalue :number=0;
  product: Product = new Product;
  quantitemax=0;

  _qtmulti:string="";
  @Input()
  set qtmulti(value:string){
    this._qtmulti=value;
    //console.log(this._qtmulti);
    if(this._qtmulti  && this.product) this.calcMaxCanBuy();
  }

  _money:number=0;
  @Input()
  set money(value:number){
    this._money=value;
    //console.log(this._money);
    if(this._money && this.product) this.calcMaxCanBuy();
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
    //console.log(this.product);
    //console.log("hello");
  }

  @Output() 
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  
  constructor() { }
  
  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
    this.progressbarvalue=0;
  }

  calcScore() {
    if(this.product.timeleft!=0){
      this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
      if (this.product.timeleft <= 0){
        this.product.timeleft=0;
        this.progressbarvalue=0;
        this.notifyProduction.emit(this.product);
      }
      else if (this.product.timeleft>0){
        this.progressbarvalue=((this.product.vitesse - this.product.timeleft)/this.product.vitesse)*100;
      }
    }
  }

  startFabrication(){
    this.product.timeleft=this.product.vitesse;
    this.lastupdate=Date.now();
  } 
  calcMaxCanBuy(){
    /* let sommeMax=0;
    let i=0;
    while(sommeMax < this.money){
        sommeMax = this.product.cout *(1 - (this.product.croissance **  i) )/(1  - this.product.croissance);
        i=+1;
    }
    console.log(i); */
    console.log(this._money);
    let qtemax = (Math.log(1 - ((this._money * (1 - this.product.croissance))/ this.product.cout))/Math.log(this.product.croissance))+1;
    this.quantitemax = Math.floor(qtemax);
  }

}
