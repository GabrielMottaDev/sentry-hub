import { FontSource, useFonts as expoUseFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { Asset, useAssets } from "expo-asset";

export const useFontsNative: (
  map: string | Record<string, FontSource>
) => [boolean, Error | null] = (map) => {
  return expoUseFonts(map);
};

// =====

const fontVariants: string[] = [
  "Bold",
  "BoldItalic",
  "ExtraLight",
  "ExtraLightItalic",
  "Italic",
  "Light",
  "LightItalic",
  "Regular",
  "SemiBold",
  "SemiBoldItalic",
  "SemiLight",
  "SemiLightItalic",
];

interface FontObject {
  [key: string]: any; // Allows dynamic keys for font variants
}

export const getFontVariants = async (
  fontName: string,
  fontPath: string
): Promise<FontObject> => {
  let fontObject: FontObject = {};

  // Loop through each variant and attempt to load the corresponding .ttf file
  for (let variant of fontVariants) {
    // -?
    const fontFilePath = `${fontPath}${variant}.ttf`;
    console.log("FONT FILE PATH", fontFilePath);
    try {
      // Dynamically require the font file if it exists
      // fontObject[`${fontName}-${variant}`] = require(`${fontFilePath}`);

      const ass = await Asset.fromModule(fontFilePath);
      await ass.downloadAsync();
      console.log(ass);
    } catch (error) {
      console.error(error);
      console.warn(`Font variant ${fontName}-${variant} not found.`);
    }
  }

  // Load all the valid fonts
  // await Font.loadAsync(fontObject);

  return fontObject;
};


const useStaticFonts = (map: [
  [string, string[]]
]): [boolean, Error | null | unknown] => {
  // loadAsync(map);
  return [false, null];
}

const useRuntimeFonts = (
  map: [
    [string, string[]]
  ]
): [boolean, Error | null | unknown] => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState<Error | unknown | null>(null);

  // useAssets
  useEffect(() => {
    const loadFonts = async () => {
      try {
        for (let fontCluster of map) {
          const [fontBase, subFonts] = fontCluster;
          var fontName = fontBase.split('/').at(-1)?.replace('-','')||"None";

          console.log("[FONT-BASE]", fontBase);
          for(let subFont of subFonts) {
            const assetPath = fontBase+subFont+".ttf";
            console.log("[FONT-PATH]", assetPath);
            // await Font.loadAsync(assetPath);
            // const assetModule = await Asset.fromModule(assetPath);
            // await assetModule.downloadAsync();
            // console.log("ASSET-MODULE", assetModule);
            // await Font.loadAsync({ [fontName]: assetPath });
            const tst = await Asset.fromURI(assetPath).downloadAsync();
            console.log(tst);
          }
          // console.log("[SUB-FONT]", subFonts);
          // const fontObject = await getFontVariants(fontName, map[fontName]);
          // console.log("[FONT]", fontName, "=>", fontObject);
          // await Font.loadAsync(fontObject);
        }

        setFontsLoaded(true);
      } catch (err) {
        console.error("[FONT] Error loading fonts:", err);
        setError(err);
      }
    };

    loadFonts();
  }, [map]);

  // Return the status of fonts loading and any potential error
  console.log("TYPE", typeof window === "undefined" ? "STATIC" : "RUNTIME");
  return [fontsLoaded, error];
};

// : (map: Record<string, FontSource>) => [boolean, Error | null]
export const useFonts = (
  map: [
    [string, string[]]
  ]
): [boolean, Error | null | unknown] => typeof window === "undefined" ? useStaticFonts(map) : useRuntimeFonts(map);

// typeof window === 'undefined' ? useStaticFonts : useRuntimeFonts;
