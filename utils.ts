import fs from "fs";
import path from "path";
class Utils {
  private readDir(dir: string) {
    return fs.readdirSync(dir).filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
  }

  getLayersFromFolders(dir: string) {
    const layers: { [key: string]: any } = {};
    this.readDir(dir).forEach((fileName) => {
      const currentFilePath = path.join(dir, fileName);
      if (!fs.statSync(currentFilePath).isDirectory()) {
        return;
      }
      const params = this.getParams(fileName);
      layers[params.name] = {
        name: params.name,
        baseXOffset: params.x,
        baseYOffset: params.y,
        baseZOffset: params.z,

        options: this.getOptions(currentFilePath, fileName),
      };
    });
    return layers;
  }

  getParams(fileName: string) {
    const [name, ...rawParamsArray] = fileName.split(".")[0].split("__");
    const rawParamsMap = new Map();
    for (const param of rawParamsArray) {
      const type = param.charAt(0);
      const value = param.slice(1);
      rawParamsMap.set(type, value);
    }
    const rawWeight = rawParamsMap.get("w");
    const rawProbality = rawParamsMap.get('p');
    const normalizedParams = {
      name: name,
      x: parseInt(rawParamsMap.get("x") ?? "0"),
      y: parseInt(rawParamsMap.get("y") ?? "0"),
      z: parseInt(rawParamsMap.get("z") ?? "0"),
      w: rawWeight === undefined ? undefined : Number(rawWeight),
      p: rawProbality === undefined ? 1 : Number(rawProbality),
      t: rawParamsMap.get("t"),
      v: rawParamsMap.get("v"),
    };
    if (!Number.isFinite(normalizedParams.x)) {
      throw new Error(`Invalid X offset value "${normalizedParams.x}" found in "${fileName}".`);
    }
    if (!Number.isFinite(normalizedParams.y)) {
      throw new Error(`Invalid Y offset value "${normalizedParams.y}" found in "${fileName}".`);
    }
    if (!Number.isFinite(normalizedParams.z)) {
      throw new Error(`Invalid Z offset value "${normalizedParams.z}" found in "${fileName}".`);
    }
    if (normalizedParams.w !== undefined &&
      (!Number.isFinite(normalizedParams.w) || normalizedParams.w <= 0)) {
      throw new Error(`Invalid weight value "${normalizedParams.w}" found in "${fileName}".`);
    }
    return normalizedParams;
  }
  getOptions(dir: string, layerName: string) {
    const options: { [key: string]: any } = {};
    for (const fileName of this.readDir(dir)) {
      const currentFilePath = path.join(dir, fileName);
      if (!fs.statSync(currentFilePath).isFile()) {
        continue;
      }
      const params = this.getParams(fileName);
      const filePath = path.join(dir, fileName);
      const stats = fs.statSync(filePath);
      if (options[params.name] === undefined) {
        options[params.name] = {
          name: params.name,
          weight: 1,
          assets: [],
          edgeCases: {},
        };
      }
      if (params.w !== undefined) {
        // TODO: Distinguish between default values and explicit ones...
        if (options[params.name].weight !== 1) {
          throw new Error(`You can specify the weight on a group of options only once: "${params.name}" (${layerName})`);
        }
        options[params.name].weight = params.w;
      }
      options[params.name].assets.push({
        path: path.join(layerName, fileName),
        relativeXOffset: params.x,
        relativeYOffset: params.y,
        relativeZOffset: params.z,
        lastModifiedTime: stats.mtime.getTime(),
        size: stats.size,
      });
    }
    if (Object.keys(options).length < 1) {
      throw new Error(`Could not find any options for the current layer: "${layerName}"`);
    }
    return options
  }
}