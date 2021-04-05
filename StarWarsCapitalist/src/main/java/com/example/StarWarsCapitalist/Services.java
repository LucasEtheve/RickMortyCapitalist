/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.StarWarsCapitalist;

import com.example.StarWarsCapitalist.generated.PallierType;
import com.example.StarWarsCapitalist.generated.ProductType;
import com.example.StarWarsCapitalist.generated.World;
import com.example.StarWarsCapitalist.generated.TyperatioType;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 *
 * @author lucasetheve
 */
public class Services {

    World world = new World();

    String path = "./src/main/resources";

    public World readWorldFromXml(String username) {
        JAXBContext jaxbContext;
        try {
            jaxbContext = JAXBContext.newInstance(World.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            InputStream input = getClass().getClassLoader().getResourceAsStream(username + "-StarWars.xml");
            System.out.println("eeeekejjhdhjdhdhdhhdhdhdhdhdhdhdhdhdhhdhdhdhdhhdhdhd");
            System.out.println(input);
            if (input == null) {
                input = getClass().getClassLoader().getResourceAsStream("StarWars.xml");
            }
            world = (World) jaxbUnmarshaller.unmarshal(input);
        } catch (Exception ex) {
            System.out.println("Erreur lecture du fichier:" + ex.getMessage());
            ex.printStackTrace();
        }
        return world;
    }

    public void saveWorldToXml(World world, String username) {
        JAXBContext jaxbContext;
        try {
            jaxbContext = JAXBContext.newInstance(World.class);
            System.out.println(username + "ghdggdgdgdgdg");
            Marshaller march = jaxbContext.createMarshaller();
            OutputStream output = new FileOutputStream(path + "/" + username + "-StarWars.xml");
            //march.marshal(world, new File(path + "/"+ username + "-StarWars.xml"));
            march.marshal(world, output);
        } catch (Exception ex) {
            System.out.println("Erreur écriture du fichier:" + ex.getMessage());
            ex.printStackTrace();
        }
    }

    //@GET
    //Path("world")
    World getWorld(String username) {
        World world = this.readWorldFromXml(username);
        this.updateScore(world);
        saveWorldToXml(world, username);
        return readWorldFromXml(username);
    }

    public Boolean updateProduct(String username, ProductType newproduct) {
        // aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
        // trouver dans ce monde, le produit équivalent à celui passé // en paramètre
        ProductType product = findProductById(world, newproduct.getId());
        if (product == null) {
            return false;
        }
        // calculer la variation de quantité. Si elle est positive c'est 
        // que le joueur a acheté une certaine quantité de ce produit
        // sinon c’est qu’il s’agit d’un lancement de production.
        int qtchange = newproduct.getQuantite() - product.getQuantite();
        if (qtchange > 0) {
            double achat = product.getCout() * ((1 - Math.pow(product.getCroissance(), qtchange)) / (1 - product.getCroissance()));
            world.setMoney(world.getMoney() - achat);
            //double newcout = Math.pow(product.getCroissance(), qtchange) * product.getCout();
            product.setQuantite(newproduct.getQuantite());
            //product.setCout(newcout);
            product.setCout(newproduct.getCout());
            // soustraire de l'argent du joueur le cout de la quantité
            // achetée et mettre à jour la quantité de product
            for (PallierType pallier : product.getPalliers().getPallier()) {
                if (!pallier.isUnlocked() && product.getQuantite() > pallier.getSeuil()) {
                    pallier.setUnlocked(true);
                    if (pallier.getTyperatio() == TyperatioType.VITESSE) {
                        if (product.getTimeleft() > 0) {
                            product.setTimeleft(product.getTimeleft() / 2);
                        }
                        product.setVitesse((int) (product.getVitesse() / pallier.getRatio()));
                    }
                    if (pallier.getTyperatio() == TyperatioType.GAIN) {
                        product.setRevenu(product.getRevenu() * pallier.getRatio());
                    }
                }
            }
        } else {
            product.setTimeleft(product.getVitesse());
            // initialiser product.timeleft à product.vitesse 
            // pour lancer la production
        }
        // sauvegarder les changements du monde
        saveWorldToXml(world, username);
        return true;
    }

    // prend en paramètre le pseudo du joueur et le manager acheté.
    // renvoie false si l’action n’a pas pu être traitée
    public Boolean updateManager(String username, PallierType newmanager) {
        // aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
        // trouver dans ce monde, le manager équivalent à celui passé
        // en paramètre
        PallierType manager = findManagerByName(world, newmanager.getName());
        if (manager == null) {
            return false;
        }
        // débloquer ce manager
        manager.setUnlocked(true);
        // trouver le produit correspondant au manager
        ProductType product = findProductById(world, manager.getIdcible());
        if (product == null) {
            return false;
        }
        // débloquer le manager de ce produit
        product.setManagerUnlocked(true);
        // soustraire de l'argent du joueur le cout du manager
        world.setMoney(world.getMoney() - manager.getSeuil());
        // sauvegarder les changements au monde
        saveWorldToXml(world, username);
        return true;
    }

    public Boolean updateUpgrade(String username, PallierType newpallier) {
        // aller chercher le monde qui correspond au joueur
        World world = getWorld(username);
        // trouver dans ce monde, le pallier équivalent à celui passé en paramètre
        PallierType pallier = findUpgradeByName(world, newpallier.getName());
        if (pallier == null) {
            return false;
        }
        pallier.setUnlocked(true);
        if (pallier.getIdcible() > 0) {
            ProductType product = findProductById(world, pallier.getIdcible());
            if (pallier.getTyperatio() == TyperatioType.VITESSE) {
                if (product.getTimeleft() > 0) {
                    product.setTimeleft(product.getTimeleft() / 2);
                }
                product.setVitesse((int) (product.getVitesse() / pallier.getRatio()));
            }
            if (pallier.getTyperatio() == TyperatioType.GAIN) {
                product.setRevenu(product.getRevenu() * pallier.getRatio());
            }
        } //upgarde pour tous les produits (allunlock)
        else {
            for (ProductType product : world.getProducts().getProduct()) {
                if (pallier.getTyperatio() == TyperatioType.VITESSE) {
                    if (product.getTimeleft() > 0) {
                        product.setTimeleft(product.getTimeleft() / 2);
                    }
                    product.setVitesse((int) (product.getVitesse() / pallier.getRatio()));
                }
                if (pallier.getTyperatio() == TyperatioType.GAIN) {
                    product.setRevenu(product.getRevenu() * pallier.getRatio());
                }
            }
        }
        saveWorldToXml(world, username);
        return true;
    }

    private ProductType findProductById(World world, int id) {
        for (ProductType product : world.getProducts().getProduct()) {
            if (product.getId() == id) {
                return product;
            }
        }
        return null;
    }

    private PallierType findManagerByName(World world, String name) {
        for (PallierType manager : world.getManagers().getPallier()) {
            if (manager.getName().equals(name)) {
                return manager;
            }
        }
        return null;
    }

    private PallierType findUpgradeByName(World world, String name) {
        for (PallierType pallier : world.getUpgrades().getPallier()) {
            if (pallier.getName().equals(name)) {
                return pallier;
            }
        }
        return null;
    }

    private void updateScore(World world) {
        long tempsEcoule = System.currentTimeMillis() - world.getLastupdate();
        for (ProductType product : world.getProducts().getProduct()) {
            if (!product.isManagerUnlocked()) {
                if (product.getTimeleft() != 0 && tempsEcoule > product.getTimeleft()) {
                    world.setMoney(world.getMoney() + product.getQuantite() * product.getRevenu());
                    world.setScore(world.getScore() + product.getQuantite() * product.getRevenu());
                } else {
                    long tps = product.getTimeleft() - tempsEcoule;
                    if (tps < 0) {
                        product.setTimeleft(0);
                    } else {
                        product.setTimeleft(tps);
                    }
                }
            } else {
                //on divise  le temps écoulé par le temps de production pour obtenir la quatite fabriqué durant le temps écoulé 
                double qtefabriquee = Math.floor(tempsEcoule / product.getVitesse());
                world.setScore(world.getScore() + product.getQuantite() * product.getRevenu() * qtefabriquee);
                world.setMoney(world.getMoney() + product.getQuantite() * product.getRevenu() * qtefabriquee);
                long tps = product.getTimeleft() - tempsEcoule;
                if (tps < 0) {
                    product.setTimeleft(0);
                } else {
                    product.setTimeleft(tps);
                }
            }
        }
        world.setLastupdate(System.currentTimeMillis());
    }
}
