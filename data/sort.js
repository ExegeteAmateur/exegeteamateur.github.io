var _ = require('lodash');
var fs = require('fs');

var deputes = require('./deputes.json');
var votes = require('./votes.json');

function slugMe (value) {
  var rExps=[
  {re:/[\xC0-\xC6]/g, ch:'A'},
  {re:/[\xE0-\xE6]/g, ch:'a'},
  {re:/[\xC8-\xCB]/g, ch:'E'},
  {re:/[\xE8-\xEB]/g, ch:'e'},
  {re:/[\xCC-\xCF]/g, ch:'I'},
  {re:/[\xEC-\xEF]/g, ch:'i'},
  {re:/[\xD2-\xD6]/g, ch:'O'},
  {re:/[\xF2-\xF6]/g, ch:'o'},
  {re:/[\xD9-\xDC]/g, ch:'U'},
  {re:/[\xF9-\xFC]/g, ch:'u'},
  {re:/[\xC7-\xE7]/g, ch:'c'},
  {re:/[\xD1]/g, ch:'N'},
  {re:/[\xF1]/g, ch:'n'} ];

  // converti les caractères accentués en leurs équivalent alpha
  for(var i=0, len=rExps.length; i < len; i++)
    value=value.replace(rExps[i].re, rExps[i].ch);

  // 1) met en bas de casse
  // 2) remplace les espace par des tirets
  // 3) enleve tout les caratères non alphanumeriques
  // 4) enlève les doubles tirets
  return value.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\'/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/\-{2,}/g,'-');
};

var slug_deputes = {};
_.each(deputes.deputes, function (depute) {
  depute = depute.depute;
  slug_deputes[depute.slug] = depute;
});

_.each(votes, function (party) {
  _.each(party, function (deputes_name, choice) {
    choice = slugMe(choice);
    _.each(deputes_name, function (depute_name) {
      var depute = slug_deputes[slugMe(depute_name)];
      if (!depute) {
        console.log(slugMe(depute_name));
        return;
      }
      depute.votePJL = choice;
    });
  });
});

fs.writeFileSync('./deputes-vote.json', JSON.stringify(deputes));
