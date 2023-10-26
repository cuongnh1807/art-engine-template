import {
  ArtEngine,
  inputs,
  generators,
  renderers,
  exporters,
} from "@hashlips-lab/art-engine"
const BASE_PATH = __dirname;

class ArtHashlipEngine {
  private ae: ArtEngine
  constructor() {
    this.ae = new ArtEngine({
      cachePath: `${BASE_PATH}/pandope-cache`,
      outputPath: `${BASE_PATH}/pandope-output`,
      useCache: false,

      inputs: {
        [`pandore`]: new inputs.ImageLayersInput({
          assetsBasePath: `${BASE_PATH}/pandope`,
        }),
      },
      generators: [
        new generators.ImageLayersAttributesGenerator({
          dataSet: `pandore`,
          startIndex: 1,
          endIndex: 2,
        }),
      ],
      renderers: [
        new renderers.ItemAttributesRenderer({
          name: (itemUid: string) => `Pandore ${itemUid}`
        }),
        new renderers.ImageLayersRenderer({
          width: 1500,
          height: 1500,
        }),
      ],
      exporters: [
        new exporters.ImagesExporter(),
      ]
    })
  }

  generateNFT = async () => {
    await this.ae.run()
    await this.ae.printPerformance()
  }
}

(async () => {
  const ae = new ArtHashlipEngine()
  await ae.generateNFT();
})()