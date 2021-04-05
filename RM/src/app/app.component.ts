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
  server: string = "";
  qtmulti: string = "X1";
  showUnlocks = false;
  showManagers = false;
  badgeManagers = 0;
  badgeCashUpgrades = 0;
  username = "";
  tousProduits = "Tous";//Tous les produits Up


  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer();
    this.username = localStorage.getItem("username") || 'Captain' + Math.floor(Math.random() * 10000);
    this.service.user = this.username;
    service.getWorld().then(
      world => {
        this.world = world;
      });
  }

  onProductionDone(product: Product) {
    let nbUpgrades = 0;//nb d'upgrades
    this.world.money += product.quantite * product.revenu;
    this.world.score += product.quantite * product.revenu;
    this.badgeUpgradesManager();
  }

  onPurchaseDone(cout_total_achat: number) {
    let nbUpgrades = 0;//nb d'upgrades
    console.log("avant" + this.world.money)
    this.world.money -= cout_total_achat;
    this.world.score -= cout_total_achat;
    console.log("après" + this.world.money)
    //calcul du nombre à afficher dans le badge Manager
    this.badgeUpgradesManager();
    //calcul du nombre à afficher dans le badge Upgrade
    this.badgeCashUpgrades = 0;
    for (let upgrade of this.world.upgrades.pallier) {
      if (!upgrade.unlocked && this.world.money >= upgrade.seuil) {
        this.badgeCashUpgrades += 1;
      }
    }
    this.unlock();
    this.allUnlock();
  }

  getUpgrade(pallier: Pallier) {
    pallier.unlocked = true;
    if (pallier.idcible == 0){
      this.produits.forEach((produit) => {
        produit.calcUpgrade(pallier);
      });
      this.popMessage("Unlocked : " + pallier.name + " pour tous les produits");
    }
    else {
      for(let produit of this.produits){
        if(pallier.idcible==produit.product.id){
        console.log('numa'+produit.product.name);
        produit.calcUpgrade(pallier);
        this.tousProduits = produit.product.name;
        this.popMessage("Unlocked : "  + this.tousProduits +' '+ pallier.name);}
      }
    }
    this.service.putUpgrade(pallier);
  }
  cycle() {
    console.log(this.showManagers);
    switch (this.qtmulti) {
      case "X1":
        this.qtmulti = "X10";
        break;
      case "X10":
        this.qtmulti = "X100";
        break;
      case "X100":
        this.qtmulti = "XMAX";
        break;
      case "XMAX":
        this.qtmulti = "X1";
        break;
    }
  }

  hireManager(manager: Pallier) {
    if (this.world.money >= manager.seuil && this.world.products.product[manager.idcible - 1].quantite > 0) {
      this.world.products.product[manager.idcible - 1].managerUnlocked = true;
      manager.unlocked = true;
      this.world.money -= manager.seuil;
      this.popMessage(manager.name + " est engagé");
      this.service.putManager(manager);
    }
  }


  popMessage(message: string): void {
    this.snackBar.open(message, "", { duration: 2000 })
  }

  onUsernameChanged() {
    localStorage.setItem("username", this.username);
    this.service.user = this.username;
  }

  //calcul du nombre à afficher dans le badge Manager
  badgeUpgradesManager() {
    this.badgeManagers = 0;
    for (let manager of this.world.managers.pallier) {
      if (manager.seuil <= this.world.money && !manager.unlocked) {
        this.badgeManagers++;
      }
    }
  }

  unlock(){
    //MAJ des unlocks simples pas encore débloquées
    for (let produit of this.world.products.product) {
      for (let i = 0; i < 2; i++) {
        if (!produit.palliers.pallier[i].unlocked && produit.quantite >= produit.palliers.pallier[i].seuil) {
          this.getUpgrade(produit.palliers.pallier[i]);
        }
      }
    }
  }
  
  allUnlock(){
    //MAJ des unlocks globales
    for (let pallier of this.world.allunlocks.pallier) {
      let quantite_totale = 0;
      for (let produit of this.world.products.product) {
        if (produit.quantite >= pallier.seuil){
          quantite_totale += 1;
        }
      }
      if (!pallier.unlocked && quantite_totale == 8) {
        this.getUpgrade(pallier);
      }
    };
  }
}