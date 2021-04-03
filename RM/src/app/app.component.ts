import { Component, QueryList, ViewChildren } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductComponent } from './product/product.component';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChildren(ProductComponent)
  public produits!: QueryList<ProductComponent>;
  title = 'RM';
  world: World = new World();
  server: string="";
  qtmulti:string="X1";
  showUnlocks=false;
  showManagers=false;
  badgeManagers=0;
  badgeCashUpgrades=0;
  username= "";
  tousProduits="Tous";//Tous les produits Up

  
  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer();
    this.username= localStorage.getItem("username") || 'Captain' + Math.floor(Math.random() * 10000);
    this.service.user = this.username;
    service.getWorld().then(
      world => {
        this.world = world;
      });
  }

  onProductionDone(product: Product){
    let nbManagers=0;//nb de managers
    let nbUpgrades=0;//nb d'upgrades
    this.world.money+= product.quantite * product.revenu;
    this.world.score+= product.quantite * product.revenu;
    this.world.managers.pallier.forEach((manager) => {
      if (this.world.money >= manager.seuil && !manager.unlocked) {
        nbManagers += 1;
      }
    });
    this.badgeManagers = nbManagers;  
  }

  onPurchaseDone(cout_total_achat: number){
    let nbManagers=0;//nb de managers
    let nbUpgrades=0;//nb d'upgrades
    console.log("avant"+this.world.money)
    this.world.money -= cout_total_achat;
    this.world.score -= cout_total_achat;
    console.log("après"+this.world.money)
    //calcul du nombre à afficher dans le badge Manager
    this.world.managers.pallier.forEach((manager) => {
      if (this.world.money >= manager.seuil && !manager.unlocked) {
        nbManagers += 1;
      }
    });
    this.badgeManagers = nbManagers;
    //calcul du nombre à afficher dans le badge Upgrade
    this.world.upgrades.pallier.forEach((upgrade) => {
      if (this.world.money >= upgrade.seuil && !upgrade.unlocked) {
        nbUpgrades += 1;
      }
    });
    this.badgeCashUpgrades = nbUpgrades;
    //MAJ des unlocks simples pas encore débloquées
    this.world.products.product.forEach((produit) => {
      produit.palliers.pallier.forEach((unlock) => {
        if (produit.quantite >= unlock.seuil && !unlock.unlocked) {
          this.getUpgrade(unlock);
        }
      });
    });
    //MAJ des unlocks globales
    this.world.allunlocks.pallier.forEach((allunlock) => {
      let qte = 0;
      this.world.products.product.forEach((product) => {
        qte += product.quantite;
      });
      if (qte >= allunlock.seuil && !allunlock.unlocked) {
        this.getUpgrade(allunlock);
      }
    });    
  }

  getUpgrade(upgrade: Pallier) {
    upgrade.unlocked=true;
    if(upgrade.idcible!=0){
      this.produits.forEach((produit)=> {
        if (produit.product.id == upgrade.idcible) {
          produit.calcUpgrade(upgrade);
          this.tousProduits = produit.product.name;
        }
      });
    } else {
      this.produits.forEach((produit) => {
        produit.calcUpgrade(upgrade);
      });
    }
    this.popMessage(
      "Unlocked " +
        upgrade.name +
        ", " +
        this.tousProduits+
        " " +
        upgrade.typeratio +
        " x" +
        upgrade.ratio +
        "!!"
    );

    this.service.putUpgrade(upgrade);
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

  onUsernameChanged(){
    localStorage.setItem("username", this.username);
    this.service.user = this.username;
  }
}
