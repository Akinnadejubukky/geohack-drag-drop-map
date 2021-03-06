import { Parser as CsvParser } from 'papaparse'
import { parse as parseWkt } from 'wellknown'

export default class CSV {
  constructor(csvContent) {
    this.csvContent = csvContent
  }

  geojson() {
    const csvParser = new CsvParser({
      delimiter: ';',
      header: true,
    })
    const parsedCsv = csvParser.parse(this.csvContent)
    const headerRow = parsedCsv.data.slice(0, 1)[0]
    const dataRows = parsedCsv.data.slice(1)
    const wktColIdx = headerRow.findIndex((text) => text.match(/^wkt$/i))
    let features
    if (wktColIdx > -1) {
      features = dataRows
        .map((dataRow) => {
          return dataRow.length > wktColIdx && dataRow[0] !== ''
            ? {
                type: 'Feature',
                properties: {},
                geometry: parseWkt(dataRow[wktColIdx]),
              }
            : undefined
        })
        .filter((geometry) => !!geometry)
    } else {
      console.error(
        `CSV processor requires one column headed 'wkt' with WKT geometry`,
      )
      features = []
    }
    return {
      type: 'FeatureCollection',
      features: features,
    }
  }
}
