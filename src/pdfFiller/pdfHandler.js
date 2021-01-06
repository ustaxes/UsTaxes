import { promisified } from 'tauri/api/tauri';
import { save } from 'tauri/api/dialog';
import { encodeToBase64 } from 'pdf-lib';


/*
 * Remove this after next release of Tauri with this PR:
 * https://github.com/tauri-apps/tauri/pull/1136
 */
async function writeBinaryFile({ path, contents }, options = {}) {
  return await promisified({
    cmd: 'writeBinaryFile',
    path: path,
    contents: encodeToBase64(contents),
    options
  });
}

export async function savePdf(contents) {
  if (window.__TAURI__ === undefined) {
    const blob = new Blob([contents], { type: 'application/pdf' });
    const blobURL = URL.createObjectURL(blob);
    window.open(blobURL);
  } else {
    const path = await save();
    writeBinaryFile({ contents, path }, {});
  }
};
