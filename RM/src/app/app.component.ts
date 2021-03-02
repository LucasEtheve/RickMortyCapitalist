import { Component } from '@angular/core';
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
  
  onProductionDone(product: Product){
    this.world.money+= product.quantite * product.revenu;
    this.world.score+= product.quantite * product.revenu;
  }

  onPurchaseDone(cout_total_achat: number){
    this.world.money -= cout_total_achat;
    this.world.score -= cout_total_achat;
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
    if (this.world.money >= manager.seuil){
      this.world.products.product[manager.idcible-1].managerUnlocked = true;
      manager.unlocked = true;
      this.world.money -= manager.seuil;
    }
    
  }

  constructor(private service: RestserviceService) {
    this.server = service.getServer(); 
    service.getWorld().then(
      world => {
        this.world = world;
      });
  }
}
