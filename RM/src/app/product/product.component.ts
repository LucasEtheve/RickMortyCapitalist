import { ThisReceiver } from '@angular/compiler';
import { Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { RestserviceService } from "../restservice.service";
import { Pallier, Product } from '../world';



@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})

export class ProductComponent implements OnInit {
  server = "http://localhost:8080/";
  lastupdate = 0;
  progressbarvalue: number = 0;
  product: Product = new Product;
  quantitemax = 0;
  prix_actuel= 0;
  cout_total_achat=0;
  true="false";
  progressbar: any;

  _qtmulti: string = "";
  @Input()
  set qtmulti(value: string) {
    this._qtmulti = value;
    //console.log(this._qtmulti);
    if (this._qtmulti && this.product) this.calcMaxCanBuy();
  }

  _money: number = 0;
  @Input()
  set money(value: number) {
    this._money = value;
    //console.log(this._money);
    if (this._money && this.product) this.calcMaxCanBuy();
  }
 
  @Input()
  set prod(value: Product) {
    this.product = value;
    this.prix_actuel = this.product.cout;
    if (this.product && this.product.timeleft > 0) {
      this.lastupdate = Date.now();
      let progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.progressbar.set(progress);
      this.progressbar.animate(1, { duration: this.product.timeleft });
    }
  }

  @Output()
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  @Output()
  notifyPurchase: EventEmitter<number> = new EventEmitter<number>();

  
  constructor(private service: RestserviceService) { }

  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
    this.progressbarvalue = 0;
  }

  calcUpgrade(unlock: Pallier) {
    switch (unlock.typeratio) {
      case "vitesse":
        if (this.product.timeleft > 0) {
          this.product.timeleft = this.product.timeleft / 2;
        }
        this.product.vitesse = this.product.vitesse / unlock.ratio;
        break;
      case "gain":
        this.product.revenu = this.product.revenu * unlock.ratio;
        break;
    }
  }
  
  calcScore() {
    if(this.product.managerUnlocked && this.product.timeleft==0){
      this.startFabrication();
    }
    if (this.product.timeleft != 0) {
      this.product.timeleft = this.product.vitesse - (Date.now() - this.lastupdate);
      if (this.product.timeleft <= 0) {
          this.product.timeleft = 0;
        this.progressbarvalue = 0;
        this.notifyProduction.emit(this.product);
        this.true="false";
      }
      else if (this.product.timeleft > 0) {
        this.progressbarvalue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) * 100;
      }
    }
  }

  startFabrication() {
    if(this.product.quantite !=0 && this.true!="true"){
      this.true="true";
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
    }
  }
  calcMaxCanBuy() {
    /* let sommeMax=0;
    let i=0;
    while(sommeMax < this.money){
        sommeMax = this.product.cout *(1 - (this.product.croissance **  i) )/(1  - this.product.croissance);
        i=+1;
    }
    console.log(i); */
    console.log(this.prix_actuel);
    let qtemax = ((Math.log(1 - ((this._money * (1 - this.product.croissance)) / this.product.cout)) / Math.log(this.product.croissance)));
    if (qtemax < 0) {
      this.quantitemax = 0;
    }
    else {
      this.quantitemax = Math.floor(qtemax);
    }
    console.log(this.product.name+" : "+this.quantitemax);
  }

  achat() {
    console.log("achat: "+this.product.name);
    switch (this._qtmulti) {
      case "X1":
        this.cout_total_achat = this.product.cout;
        this.product.cout = this.product.croissance * this.product.cout;
        console.log("le cout"+this.product.cout);
        this.product.quantite += 1;
        console.log(this._money);
        break;
      case "X10":
        this.cout_total_achat = this.product.cout *((1 - (this.product.croissance ** 10))/(1  - this.product.croissance));
        this.product.cout = (this.product.croissance ** 10) * this.product.cout;
        this.product.quantite += 10;
        break;
      case "X100":
        this.cout_total_achat = this.product.cout *((1 - (Math.pow(this.product.croissance,100)) )/(1  - this.product.croissance));
        this.product.cout = (this.product.croissance ** 100) * this.product.cout;
        this.product.quantite += 100;
        break;
      case "XMAX":
        this.cout_total_achat = this.product.cout *((1 - Math.pow(this.product.croissance,this.quantitemax))/(1  - this.product.croissance));
        this.product.cout = (this.product.croissance ** this.quantitemax) * this.product.cout;
        this.product.quantite += this.quantitemax;
        break;
    }
    console.log("total: "+this.cout_total_achat);
    this.notifyPurchase.emit(this.cout_total_achat);
    this.service.putProduct(this.product);
  }
}
