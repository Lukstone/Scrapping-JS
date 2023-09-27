const readline = require('readline');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Digite a URL que deseja fazer o scraping: ', async (url) => {
  rl.question('Digite o tipo de dado que deseja extrair (texto, imagem, link, tabela, metadados): ', async (tipo) => {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let dados;
    switch (tipo) {
      case 'texto':
        dados = $('body').text();
        break;
      case 'imagem':
        dados = $('img').attr('src');
        break;
      case 'link':
        dados = $('a').attr('href');
        break;
      case 'tabela':
        dados = $('table').html();
        break;
      case 'metadados':
        dados = $('head').html();
        break;
      default:
        console.log('Tipo de dado inválido.');
        rl.close();
        return;
    }
    let nomeArquivo;
    let caminhoArquivo;
    do {
      nomeArquivo = await new Promise((resolve) => {
        rl.question('Digite o nome do arquivo para salvar os dados: ', (nome) => {
          resolve(nome);
        });
      });
      caminhoArquivo = path.join(__dirname, 'src/scrappings', nomeArquivo);
      if (fs.existsSync(caminhoArquivo)) {
        console.error(`O arquivo ${caminhoArquivo} já existe.`);
      }
    } while (fs.existsSync(caminhoArquivo));
    fs.writeFile(caminhoArquivo, dados, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Os dados foram salvos em ${caminhoArquivo}`);
      }
      rl.close();
    });
  });
});