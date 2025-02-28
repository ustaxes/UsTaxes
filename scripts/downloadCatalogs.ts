import fs from 'fs'
import path from 'path'
import axios, { AxiosResponse } from 'axios'
import type { Readable } from 'stream'

interface Catalogs {
  latest: {
    irs: {
      [form: string]: string
    }
  }
}

const catalogsPath = path.join(__dirname, '../public', 'catalogs.json')
const outputDir = path.join(__dirname, '../public', 'forms', 'latest', 'irs')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const downloadFile = async (url: string, outputPath: string): Promise<void> => {
  const writer = fs.createWriteStream(outputPath)
  const response: AxiosResponse<Readable> = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

const downloadCatalogs = async (): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const catalogs: Catalogs = JSON.parse(fs.readFileSync(catalogsPath, 'utf-8'))

  for (const [form, url] of Object.entries(catalogs.latest.irs)) {
    const outputPath = path.join(outputDir, `${form}.pdf`)
    console.log(`Downloading ${form} from ${url}...`)
    await downloadFile(url, outputPath)
    console.log(`${form} downloaded to ${outputPath}`)
  }
}

downloadCatalogs().catch(console.error)
