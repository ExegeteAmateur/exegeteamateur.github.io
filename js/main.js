$(document).ready(function () {
  'use strict';

  var location = window.location;
  var url_nosdeputes_photo = 'http://www.nosdeputes.fr/depute/photo/';
  var deputes_json = $.when($.ajax('/data/deputes-vote.json'));
  var depute_tplt = $('#depute');
  var search_result_tplt = $('#search-result');
  var result_field = $('#results');
  var circos = $('.circo');

  var msg_vote = {
    'pour': {
      'color': '#FC4349',
      'msg': 'Ce député <span style="color: {{color}}">a voté pour</span>' +
        ' lors du vote du 5 mai',
    },
    'contre': {
      'color': '#79BDE0',
      'msg': 'Ce député <span style="color: {{color}}">a voté contre' +
        '</span> lors du vote du 5 mai'
    },
    'absent': {
      'color': '#818f9d',
      'msg': 'Ce député était <span style="color: {{color}}">absent</span>' +
        ' lors du vote du 5 mai'
    },
    'abstention': {
      'color': '#293540',
      'msg': 'Ce député <span style="color: {{color}}">s\'est abstenu' +
        '</span> lors du vote du 5 mai'
    },
    'non-votant': {
      'color': '#818f9d',
      'msg': 'Ce député était <span style="color: {{color}}">non votant' +
        '</span> lors du vote du 5 mai'
    }
  };
  $.each(msg_vote, function (_, elt) {
    elt.msg = $('<div>').append(elt.msg).render(elt, false);
  });

  var depute_email = function (depute) {
    var email = depute.emails[0];
    if (email)
      email = email.email;
    else
      email = [
        depute.prenom[0].toLowerCase(), depute.nom.toLowerCase(),
        '@assemblee-nationale.fr'
      ].join('');

    return email;
  }

  var deputes_promise = deputes_json.then(function (data) {
    var deputes = {};
    $.each(data.deputes, function (_, depute) {
      var circo, email;

      depute = depute.depute; // bad API design Yay!
      circo = deputes[depute.num_deptmt] || {};

      depute.url = '/#' + depute.slug;
      depute.photo_url = url_nosdeputes_photo + depute.slug + '/160';
      depute.email = depute_email(depute);

      circo[depute.num_circo] = depute;
      deputes[depute.num_deptmt] = circo;
      deputes[depute.slug] = depute;
    });


    circos.each(function (_, circo) {
      get_depute(circo.id).then(function (depute) {
        if (!depute) return;
        depute.nom_dept = $(circo).children('title').html();
        $(circo).attr('class', 'circo ' + depute.votePJL);
      });
    });
    console.log(deputes['claude-bartolone']);
    return deputes;
  });

  var get_depute = function (id) {
    var dept, circ;
    id = id.split('-');

    dept = id[0].toUpperCase();
    circ = parseInt(id[1]);

    // need to trim starting 0 if exists
    dept = dept[0] === '0' && dept.length === 3 ? dept.slice(1, 3): dept;

    return deputes_promise.then(function (deputes){
      return deputes[dept][circ];
    });
  }

  var display_depute = window.display_depute = function (depute_slug) {
    deputes_promise.then(function (deputes) {
      display_modal(deputes[depute_slug]);
    });
  }

  var display_modal = function (depute) {
    var modal, vote;
    if (!depute) return;

    vote = msg_vote[depute.votePJL];
    depute.message_vote = vote.msg;
    depute.color = vote.color;

    modal = depute_tplt.render(depute).appendTo('body')
    modal.on($.modal.OPEN, function () { location.replace('#'+depute.slug); });
    modal.on($.modal.CLOSE, function () { location.replace('#'); });
    modal.modal({'zIndex':20});
  }


  //this trick avoids click event on draggable
  circos.on('mousedown', function (evt) {
    circos.on('mouseup mousemove', function handler(evt) {
      if (evt.type === 'mouseup') {
        get_depute(this.id).then(display_modal);
      }
      circos.off('mouseup mousemove', handler);
    });
  });

  $('#search').keyup(function (){
    var searchField = $('#search').val();
    var regex = new RegExp(searchField, "i");

    $('#results').empty();
    if (searchField === '') return;

    deputes_json.then(function(data){
      $.each(data.deputes, function (_, depute) {
        depute = depute.depute;
        if (depute.nom.search(regex) != -1 ||
            depute.num_deptmt.search(regex) != -1) {
          result_field.append(search_result_tplt.render(depute));
        }
      });
    });
  });

  // load zoom and pane on svg
  $('svg').svgPan('France');

  if (location.hash) display_depute(location.hash.slice(1));
});

