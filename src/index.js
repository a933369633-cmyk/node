'use strict';

const path = require('path');
const fs = require('fs');
const config = require('./config');
const { readCsvStream, createCsvWriteStream } = require('./utils/csv');

async function main() {
  const inputPath = path.resolve(process.cwd(), config.inputFile);
  const outputPath = path.resolve(process.cwd(), config.outputFile);

  // Проверка существования входного файла
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Входной файл не найден: ${inputPath}`);
  }

  // Гарантируем наличие папки для выходного файла
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let processed = 0;
  const passedRows = []; // сюда собираем прошедшие фильтр строки

  const { header, total } = await readCsvStream(inputPath, (cells) => {
    processed += 1;

    const age = Number(cells[2]);
    const city = cells[3];

    const ageOk = !Number.isNaN(age) && age >= config.minAge;
    const cityOk = city === config.cityFilter;

    if (ageOk && cityOk) {
      passedRows.push(cells.join(','));
    }
  });

  // Записываем результат в выходной файл с сохранением заголовка
  const writer = createCsvWriteStream(outputPath);

  if (header) {
    await writer.write(header.join(',') + '\n');
  }
  for (const row of passedRows) {
    await writer.write(row + '\n');
  }
  await writer.close();

  console.log('--- Статистика ---');
  console.log(`Обработано строк: ${processed} (из ${total} прочитанных)`);
  console.log(`Прошло фильтр:    ${passedRows.length}`);
  console.log(`Результат записан: ${outputPath}`);
  console.log(`Условия: age >= ${config.minAge}, city = "${config.cityFilter}"`);
}

main().catch((err) => {
  console.error('Ошибка:', err.message);
  process.exit(1);
});