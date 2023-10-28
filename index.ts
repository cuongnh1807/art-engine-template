import sharp from "sharp";
import { layerPandopes } from "./config";
import * as crypto from "crypto-js";

let myMap: Map<string, number> = new Map();

class Pandope {
  body: string = "";
  glass: string = "";
  shirt: string = "";
  hat: string = "";
  wing: string = "";

  constructor() {
    this.body = "";
    this.glass = "";
    this.shirt = "";
    this.hat = "";
    this.wing = "";
  }

  updateResult = (key = "", result = "") => {
    switch (key) {
      case "body":
        this.body = result;
        break;
      case "glass":
        this.glass = result;
        break;
      case "shirt":
        this.shirt = result;
        break;
      case "hat":
        this.hat = result;
        break;
      case "wing":
        this.wing = result;
        break;
      default:
        break;
    }
  };

  private getResult = (key = ""): string => {
    if (key === "body") return this.body;
    if (key === "glass") return this.glass;
    if (key === "shirt") return this.shirt;
    if (key === "hat") return this.hat;
    if (key === "wing") return this.wing;

    return "";
  };

  private getSelectionFile = (): Array<string> => {
    let ans: Array<string> = [];

    const layers = layerPandopes.sort((a, b) => a.position - b.position);
    for (let index = 0; index < layers.length; index++) {
      const layer = layers[index];
      const key = layer.key;

      const result = this.getResult(key);
      if (result === "none") continue;

      const item = layer.items.find((item) => item.name === result);
      // console.log(key + " : " + item?.path);
      if (item && item?.path) ans.push(item.path);
    }

    return ans;
  };

  drawImage = async (path = "") => {
    const selection = this.getSelectionFile();
    // console.log("selection : ", selection);

    await sharp({
      create: {
        width: 1500,
        height: 1500,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(
        selection.map((item) => ({
          input: item,
          left: 0,
          top: 0,
        }))
      )
      .toFile(path);
  };

  getHash = (): string => {
    const ans =
      "body_" +
      this.body +
      "_glass_" +
      this.glass +
      "_shirt_" +
      this.shirt +
      "_hat_" +
      this.hat +
      "_wing_" +
      this.wing;

    return crypto.MD5(ans).toString();
  };

  printResult = () => {
    console.log("\nPandope Item : ");
    console.log("body : " + this.body);
    console.log("glass : " + this.glass);
    console.log("shirt : " + this.shirt);
    console.log("hat : " + this.hat);
    console.log("wing : " + this.wing);
  };
}

const checkExist = (hash: string) => {
  return myMap.get(hash) === 1;
};

const randomNFT = (): Pandope => {
  let ans = new Pandope();

  for (let index = 0; index < layerPandopes.length; index++) {
    const number = Math.random() * 100;
    let result = "none";
    const layer = layerPandopes[index];

    let cnt = 0;
    for (let i = 0; i < layer.items.length; i++) {
      const item = layer.items[i];
      if (number > cnt && number <= cnt + item.percent) {
        result = item.name;
        break;
      }

      cnt += item.percent;
    }

    ans.updateResult(layer.key, result);
  }

  return ans;
};

const main = async () => {
  for (let index = 0; index < 24; index++) {
    let ans = randomNFT();
    while (checkExist(ans.getHash())) ans = randomNFT();

    await ans.drawImage(`output/item_${index}.png`);
    myMap.set(ans.getHash(), 1);
    ans.printResult();
  }

  // let ans = new Pandope();
  // ans.updateResult("body", "default");
  // ans.updateResult("glass", "urban");
  // ans.updateResult("shirt", "none");
  // ans.updateResult("hat", "futuristic");
  // ans.updateResult("wing", "mythic");
  // await ans.drawImage("output/test.png");
};

main();
