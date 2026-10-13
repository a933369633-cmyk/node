'use strict';

require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Не задана обязательная переменная окружения: ${name}`);
  }
  return value.trim();
}

const config = {
  inputFile: required('INPUT_FILE'),
  outputFile: required('OUTPUT_FILE'),
  minAge: Number(required('MIN_AGE')),
  cityFilter: required('CITY_FILTER'),
};

if (Number.isNaN(config.minAge)) {
  throw new Error('MIN_AGE должен быть числом');
}

module.exports = config;