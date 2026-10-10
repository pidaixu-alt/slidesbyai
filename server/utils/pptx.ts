import PptxGenJS from 'pptxgenjs'
import type { SlidePage } from './slides.ts'

export type BuildPptxOptions = {
  watermark: boolean
  brand: string
}

export async function buildPptxBuffer(
  pages: SlidePage[],
  { watermark, brand }: BuildPptxOptions,
): Promise<Buffer> {
  const pptx = new PptxGenJS()
  pptx.author = brand
  pptx.title = brand

  for (const page of pages) {
    const slide = pptx.addSlide()
    slide.addText(page.title || 'Untitled', {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '1F2937',
    })
    if (page.bullets?.length) {
      slide.addText(
        page.bullets.map((text) => ({ text, options: { bullet: true, breakLine: true } })),
        {
          x: 0.7,
          y: 1.4,
          w: 8.6,
          h: 5,
          fontSize: 18,
          color: '374151',
          valign: 'top',
        },
      )
    }
  }

  if (watermark) {
    const slide = pptx.addSlide()
    slide.addText(`Created with ${brand} — upgrade to remove watermark`, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: 22,
      color: '6B7280',
      align: 'center',
      valign: 'middle',
    })
  }

  const result = await pptx.write({ outputType: 'nodebuffer' })
  return Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer)
}
