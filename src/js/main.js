var $ = jQuery
$(document).ready(function () {
  console.log('hello were ready!')

  var updateMember = function (memberId, date, where) {
    $.ajax({
      type: 'PUT',
      url: '/team_members',
      data: {member: memberId, date: date, where: where},
      success: function (res) {
        console.log('result', res)
      }
    })
  }

  var addTeamMemberWhereabouts = function (data) {
    var data = data.map(function (data) {
      return {
        id: data._id,
        name: data.member,
        location: data.whereabouts.map(function (location) {
          return location.location
        })
      }
    })
    var tab = $('#new-table')

    var addPerson = function (person) {
      var html = '<tr data-id="' + person.id + '"><td>' + person.name + '</td>'
      for (var i = 0; i < 5; i++) {
        var wc = new Date(2017, 8, 11 + i, 12)

        html += '<td data-date="' + wc.toISOString() + '"">'
        html += '<a href="#" class="update" data-loc="S">S</a> '
        html += '<a href="#" class="update" data-loc="L">L</a> '
        html += '<a href="#" class="update" data-loc="H">H</a> '
        if (person.location[i]) {
          html += getLoc(person.location[i])
        }
        html += '</td>'
      }
      html += '</tr>'
      tab.append(html)

      $('.update').click(function (e) {
        e.preventDefault()
        var when = $(this).closest('td').data().date
        var memberId = $(this).closest('tr').data().id
        var loc = $(this).data().loc
        updateMember(memberId, when, loc)
      })
    }
    var getLoc = function (ref) {
      var col
      switch (ref) {
        case 's': col = 'green'
          break
        case 'l': col = 'red'
          break
        case 'm': col = 'yellow'
          break
      }
      return '<span class="loc ' + col + '">' + ref.toUpperCase() + '</span>'
    }

    for (var i = 0; i < data.length; i++) {
      addPerson(data[i])
    }
  }

  $.get({
    url: '/team_members',
    success: addTeamMemberWhereabouts
  })

// var data = [{name:"Greg", location:["s", "s", "s", "s", "l"]},
//            {name:"James", location:["l", "s", "s", "l", "l"]},
//            {name:"Stuart", location:["s", "s", "m", "s", "s"]},
//            {name:"Will", location:["m", "s", "s", "s", "s"]},
//            {name:"Ash", location:["s", "s", "s", "s", "s"]},
//            {name:"Andy C", location:["s", "l", "l", "s", "s"]},
//            {name:"Lucy", location:["s", "s", "l", "s", "s"]},
//            {name:"Andy M", location:["s", "l", "s", "s", "s"]},
//            {name:"Tim", location:["s", "l", "s", "s", "s"]},
//            {name:"Tom", location:["s", "s", "s", "l", "l"]},
//            {name:"Guy", location:["l", "s", "s", "m", "s"]}]
})
