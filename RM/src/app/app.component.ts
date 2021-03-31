import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'RM';
  world: World = new World();
  server: string="";
  qtmulti:string="X1";
  showManagers=false;
  badgeManagers=0;
  username= "";

  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer();
    this.username= localStorage.getItem("username") || 'Captain' + Math.floor(Math.random() * 10000);
    this.service.user = this.username;
    service.getWorld().then(
      world => {
        this.world = world;
        this.badgeUpgrades();
      });
  }

  onProductionDone(product: Product){
    this.world.money+= product.quantite * product.revenu;
    this.world.score+= product.quantite * product.revenu;
    this.badgeUpgrades();
  }

  onPurchaseDone(cout_total_achat: number){
    console.log("avant"+this.world.money)
    this.world.money -= cout_total_achat;
    this.world.score -= cout_total_achat;
    console.log("après"+this.world.money)
    this.badgeUpgrades();
  }

  cycle(){
    console.log(this.showManagers);
    switch(this.qtmulti){
        case "X1":
          this.qtmulti="X10";
          break;
        case "X10":
          this.qtmulti="X100";
          break;
        case "X100":
          this.qtmulti="XMAX";
          break;
        case  "XMAX":
          this.qtmulti="X1";
          break;
    }
  }

  hireManager(manager:Pallier){
    if (this.world.money >= manager.seuil && this.world.products.product[manager.idcible-1].quantite>0){
      this.world.products.product[manager.idcible-1].managerUnlocked = true;
      manager.unlocked = true;
      this.world.money -= manager.seuil;
      this.popMessage(manager.name+" est engagé");
      this.service.putManager(manager);
    }
  }

  popMessage(message : string) : void { 
    this.snackBar.open(message,"", { duration : 2000 })
  }

  badgeUpgrades(){
    this.badgeManagers=0;
    for (let manager of this.world.managers.pallier){
        if (manager.seuil <= this.world.money){
          this.badgeManagers++;
        }
    }
  }

  onUsernameChanged(){
    localStorage.setItem("username", this.username);
    this.service.user = this.username;
  }
}
