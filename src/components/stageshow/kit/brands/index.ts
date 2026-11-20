/** Local product artwork. No network lookup or runtime icon service. */
export type BrandAsset = {
  name: string
  category: 'Payments' | 'Banks' | 'Apps' | 'Crypto'
  light: string
  dark: string
  tileArtwork?: string
  tileBackground?: string
  proportion: number
  scale: number
}


/** Product artwork is not bundled in this app: the landing page draws no other company's marks. */
export const brandMarks: Record<string, BrandAsset> = {}

export type BrandName = string
