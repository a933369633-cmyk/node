'use strict';

const fs = require('fs');
const readline = require('readline');
const { once } = require('events');

/**
 * Читает CSV-файл построчно через Readable stream (readline).
 * @param {string} filePath
 * @param {(row: string[], index: number) => void} onRow
 * @returns {Promise<{ header: string[], total: number }>}
 */
async function readCsvStream(filePath, onRow) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let header = null;
  let total = 0;
  let lineIndex = 0;

  try {
    for await (const line of rl) {
      if (line.trim() === '') continue;

      const cells = line.split(',').map((c) => c.trim());

      if (header === null) {
        header = cells;
        continue;
      }

      onRow(cells, lineIndex);
      lineIndex += 1;
      total += 1;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Входной файл не найден: ${filePath}`);
    }
    throw err;
  } finally {
    rl.close();
    stream.destroy();
  }

  return { header, total };
}

/**
 * Создаёт Writable stream для записи CSV.
 */
function createCsvWriteStream(filePath) {
  const stream = fs.createWriteStream(filePath, { encoding: 'utf8' });

  const write = (chunk) =>
    new Promise((resolve, reject) => {
      const ok = stream.write(chunk, (err) => (err ? reject(err) : resolve()));
      if (!ok) stream.once('drain', resolve);
    });

  const close = () =>
    new Promise((resolve, reject) => {
      stream.end((err) => (err ? reject(err) : resolve()));
    });

  return { write, close, stream };
}

module.exports = { readCsvStream, createCsvWriteStream, once };