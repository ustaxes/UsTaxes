/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import fc, { Parameters } from 'fast-check'
import { Information } from 'ustaxes/core/data'
import { insertFormDataToPdfs } from '../../irsForms'
import F1040 from '../../irsForms/F1040'
import Form from '../../irsForms/Form'
import { create1040 } from '../../irsForms/Main'
import { isRight } from 'ustaxes/core/util'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import { localPDFs } from './LocalForms'
import fs from 'fs/promises'
import path from 'path'
import { PDFDocument } from 'pdf-lib'

export const log1040Err = async (
  [, forms]: [F1040, Form[]],
  info: Information,
  err: any
): Promise<void> => {
  try {
    const pdfs = await insertFormDataToPdfs(forms, localPDFs)
    const saveDirName = `Errors ${new Date().getUTCHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
    const saveRoot = path.resolve(__dirname, '../../../logs/errors')
    const saveDir = path.resolve(saveRoot, saveDirName)
    await fs.mkdir(saveDir, { recursive: true })
    await Promise.all(
      pdfs.map(async (pdf, i) => {
        fs.writeFile(
          path.resolve(saveDir, pdf.getTitle() ?? `Form ${i}`),
          await pdf.save()
        )
      })
    )
    await fs.writeFile(
      path.resolve(saveDir, 'info.json'),
      JSON.stringify(info, null, 2)
    )
    await fs.writeFile(path.resolve(saveDir, 'error.txt'), err.toString())
  } catch (e) {
    console.info('Got another error trying to log testing error')
    console.error(e)
    console.error('Giving up!')
    throw e
  }
}

/**
 * Run a property test on generated PDFs
 * **Must** be awaited
 */
export const with1040Pdfs = async (
  f: (pdfs: PDFDocument[], info: Information) => void,
  logErr: (
    f1040: [F1040, Form[]],
    info: Information,
    err: any
  ) => Promise<void> = log1040Err,
  params: Parameters<[Information]> = {
    // This might take a long time as many pdfs have to be rendered
    // So by default just run for 1 minute max and hope
    interruptAfterTimeLimit: 60 * 1000
  }
): Promise<void> =>
  await with1040Assert(
    async ([, forms], info) => {
      const pdfs = await insertFormDataToPdfs(forms, localPDFs)
      f(pdfs, info)
    },
    logErr,
    params
  )

export const with1040Property = (
  f: (f1040: [F1040, Form[]], info: Information) => Promise<void>,
  year = 2020
): fc.IAsyncPropertyWithHooks<[Information]> =>
  fc.asyncProperty(
    new arbitraries.Arbitraries(year).information(),
    async (information): Promise<void> => {
      const f1040Res = create1040(information)
      if (isRight(f1040Res)) {
        await f(f1040Res.right, information)
      } else {
        const errs = f1040Res.left
        expect(errs).not.toEqual([])
      }
    }
  )

/**
 * Run a property test on 1040 data.
 * **Must** be awaited.
 */
export const with1040Assert = async (
  f: (f1040: [F1040, Form[]], info: Information) => Promise<void>,
  logErr: (
    f1040: [F1040, Form[]],
    info: Information,
    err: any
  ) => Promise<void> = log1040Err,
  params: Parameters<[Information]> = {}
): Promise<void> => {
  let lastCallWith1040: [F1040, Form[]] | undefined
  let lastCallWithInfo: Information | undefined
  await fc
    .assert(
      with1040Property(async (f1040, info) => {
        await f(f1040, info).catch((e) => {
          // Save the last failing test info for logging/
          lastCallWith1040 = f1040
          lastCallWithInfo = info
          // Hand it back to fc's assert.
          throw e
        })
      }),
      params
    )
    .catch(async (e) => {
      console.error('Trying to log errors.')
      if (lastCallWith1040 !== undefined && lastCallWithInfo !== undefined) {
        await logErr(lastCallWith1040 ?? [], lastCallWithInfo, e)
      } else {
        console.error('trying to log error but no info is available')
      }
      throw e
    })
}

interface Access<A, B> {
  [k: string]: A | (() => B)
}

export const showForm = (f: Access<unknown, number>): string => {
  return Object.keys(f)
    .filter((k) => k.startsWith('l'))
    .map((k) => {
      if (typeof f[k] === 'function') {
        return `${k}=${(f[k] as () => number)()}`
      }
    })
    .join('\n')
}
