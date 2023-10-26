import crypto from "crypto"
import sharp from "sharp";
import path from "path";
import { MersenneTwister19937, bool, real } from "random-js"
import fs from "fs"

export type TAttribute = {
  trait_type: string;
  value: string
}

export type TOption = {
  name: string,
  file: string,
  weight: number
}

export type TLayer = {
  name: string,
  probability: number,
  zIndex: number,
  options: TOption[]
}

export type TOptionSelection = {
  images: { zIndex: number, filename: string }[],
  selectedTraits: TAttribute[]
}

export class ArtNFTEngine {

  private calculateDna(attributes: TAttribute[]) {
    const dnaSource = attributes
      .sort((a, b) => {
        const nameA = a['trait_type'].toUpperCase();
        const nameB = b['trait_type'].toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    return crypto
      .createHash("sha1")
      .update(JSON.stringify(dnaSource))
      .digest("hex");
  }

  private pickWeighted(mt: MersenneTwister19937, options: TOption[]) {
    const weightSum = options.reduce((acc, option) => {
      return acc + (option.weight ?? 1.0)
    }, 0)

    // random a number from 0 => weightSum theo 1 cái seed đã định (nên có seed để việc randomly diễn ra theo đúng phân phối)
    const r = real(0.0, weightSum, false)(mt)

    // for lần lượt các option, nếu số random < tổng weight đến tại 1 options nào đó thì chọn
    let summedWeight = 0.0;
    for (const option of options) {
      summedWeight += option.weight ?? 1.0
      if (r <= summedWeight) {
        return option
      }
    }
  }

  private randomlySelectLayers(layersPath: string, layers: TLayer[]) {
    const mt = MersenneTwister19937.autoSeed()

    let images = []
    let selectedTraits: TAttribute[] = []

    for (const layer of layers) {
      if (bool(layer.probability)(mt)) {
        let selected = this.pickWeighted(mt, layer.options)
        if (selected) {
          selectedTraits.push({ trait_type: layer.name, value: selected.name })
          images.push({ zIndex: layer.zIndex, filename: path.join(layersPath, selected.file) })
        }
      }
    }
    return {
      images: images.sort((a, b) => a.zIndex - b.zIndex),
      selectedTraits
    }
  }

  async mergeLayersAndSave(images: string[], outputFile: string) {
    await sharp({
      create: {
        width: 1500,
        height: 1500,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }).composite(images.map(item => ({
      input: item,
      left: 0,
      top: 0,
    }))).toFile(outputFile)
  }

  async generateNFTTraits(layersPath: string) {
    if (!fs.existsSync(layersPath)) {
      throw new Error(`Not exist folder: ${layersPath}`)
    }
    const content = require(layersPath + "/config.ts")
    const selection = this.randomlySelectLayers(layersPath, content.layers)
    const dna = this.calculateDna(selection.selectedTraits);
    return {
      dna,
      selection
    }
  }
}

(async () => {
  const layersPath = path.join(process.cwd(), 'pandope')
  const outputPath = path.join(process.cwd(), 'pandope-output')
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  const ae = new ArtNFTEngine();

  // check dna gen trung
  const dnaSet = new Set()
  const numberGen = 10
  const count = 0

  while (count < numberGen) {
    console.log(`Generate NFT ${count}`)
    let { dna, selection } = await ae.generateNFTTraits(layersPath);
    while (dnaSet.has(dna)) {
      console.log(`Duplicate NFT ${count}......`)
      const result = await ae.generateNFTTraits(layersPath);
      dna = result.dna;
      selection = result.selection
    }
    dnaSet.add(dna)

    await ae.mergeLayersAndSave(
      selection.images.map(item => item.filename),
      path.join(outputPath, `${dna}.png`)
    )

    // save the dna data
    fs.writeFileSync(path.join(outputPath, `${dna}.json`), JSON.stringify(selection.selectedTraits))
  }
})()