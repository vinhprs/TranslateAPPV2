const Translate = require('../models/translate');
const Language = require('../models/language');
const Admins = require('../models/auth');
const { addTranslated } = require('../config/ggTranslate');

const translate = async (req, res) => {
  const history = req.session.history;
  let languages = await Language.find({});
  res.render('find_word', { languages, history });
}

const findHistory = (word, session) => {
  let history = []
  const now = new Date();
  const date = now.getDate() + '/0' + now.getMonth() + '/' + now.getFullYear();
  const historyFind = { word, date };
  if (session.history) {
    history = [...session.history];
    if (!history.includes(historyFind)) {
      history.push(historyFind);
    }
  } else {
    history.push(historyFind);
  }
  session.history = history;
}

// write function api_find_word(req, res) 
const api_find_word = async (req, res) => {
  let { type, word, language } = req.query;
  let list_anouce = [];
  if (type == 1) {
    if (language == 0) {
      list_anouce = await Translate.find({ korea: word });
    } else {
      await addTranslated(word, language, 'vi');
      list_anouce = await Translate.find({ korea: word, language: language })
                                  .sort({vote_up: -1});
      list_anouce = list_anouce.filter(anouce => anouce.target === "vi");
    }
  } else {
    word = word.toLowerCase();
    await addTranslated(word, language, 'ko')
    list_anouce = await Translate.find({ foreign_languages: word, language: language })
                                .sort({vote_up: -1});
    list_anouce.map((item) => {
      item.foreign_languages = item.korea;
    });
    list_anouce = list_anouce.filter(anouce => anouce.target === "ko");
  }
  findHistory(word, req.session);
  res.send(list_anouce);
}

const sendNoti = async (vote) => {
  const admin = (await Admins.find({}))[0];
  admin.notifications = [vote, ...admin.notifications];
  await Admins.findByIdAndUpdate('6379b99ca9a9995c771782a2', {
    notifications: admin.notifications
  });
}

// add new value to Korean and Foreign_language 

const vote = async (req, res) => {  
  // get id from url params
  let { id } = req.params;
  let getData = await Translate.findById(id);
  if (getData) {
    res.render('vote', { getData });
  } else {
    res.redirect('/');
  }
}

const addVote = async (req, res) => {
  let { id, vote, description } = req.body;
  try {
    let getData = await Translate.findById(id);
    if (getData) {
      if (vote == 'like') {
        getData.vote_up += 1;
      } else {
        getData.vote_down += 1;
      }
      const voteToTal = {
        vote: vote,
        description: description,
        time: `${new Date()}`
      }
      getData.votes = [voteToTal, ...getData.votes];
    }
    await Promise.all([
      sendNoti({vote, id}),
      Translate.findByIdAndUpdate(id, {
        vote_up: getData.vote_up,
        vote_down: getData.vote_down,
        votes: getData.votes
      })
    ])
    res.redirect(`/thankiu/${id}`);
  } catch (error) {
    res.redirect(`/thankiu/${id}`);
  }

}
const thankiu = (req, res) => {
  // get id from url params
  let { id } = req.params;
  return res.render('thankiu', { id });
}


module.exports = {
  thankiu,
  addVote,
  translate,
  api_find_word,
  vote
}
