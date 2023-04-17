const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env')});
const Translate = require('../models/translate');
const Language = require('../models/language');

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '..', 'translate-383814-3b4c07f87743.json')

const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
const projectId = process.env.PROJECT_ID;
const location = 'global';

const translationClient = new TranslationServiceClient({
  projectId: projectId,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

async function translateText(text, targetLanguage) {
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain', // MIME type of the source text
    targetLanguageCode: targetLanguage,
  };

  const [response] = await translationClient.translateText(request);

  return response.translations[0].translatedText;
}

const addTranslated = async (word, languageId, target) => {
    const [language, translated] = await Promise.all([
      Language.find({_id: languageId}),
      translateText(word, target)
    ]) 

    let word_trim = word.trim().replace(/\s\s+/g, ' ').toLowerCase();
    let translated_trim = translated.trim().replace(/\s\s+/g, ' ').toLowerCase();
    // nếu dịch sang tiếng hàn
    if(target === 'ko') {
      [word_trim, translated_trim] = [translated_trim, word_trim] // swap 2 đối số này
    }
    if (word_trim == "" || translated_trim == "") {
        return res.redirect('/create');
    }
    const TranslateText = await Translate.findOne({ korea: word_trim, foreign_languages: translated_trim, language: languageId });
    
    if(word_trim !== translated_trim) {
      if (!TranslateText) {
        const newTranslate = new Translate({
            korea: word_trim,
            foreign_languages: translated_trim,
            language: languageId,
            language_name: language.name,
            target
        });
        try {
            await newTranslate.save();
        } catch (error) {}
    }
    }
 
}

module.exports.addTranslated = addTranslated;


