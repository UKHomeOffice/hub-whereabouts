var $ = jQuery

// when the html document is ready
$(document).ready(function () {
  /*
  * send request to server to update a specific member's location
  * @param memberId  string  the monogo document id of the member we wish to update
  * @param date      string  date in ISO format
  * @param where     string  single char representing the new location we're recording
  */
  var updateMember = function (memberId, date, where) {
    // send a request to the server
    $.ajax({
      type: 'PUT',
      url: '/team_members',
      data: {member: memberId, date: date, where: where},
      success: function (res) {
        // we have a result
        console.log('result', res)
      }
    })
  }

  /*
  * given a single char reference create the html to display that state
  * @param    string reference code
  * @returns  string html of a location marker
  */
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

  // update the team member table
  var addTeamMemberWhereabouts = function (data) {
    // adjust the raw data from the server to match our requirements
    data = data.map(function (d) {
      return {
        id: d._id,
        name: d.member,
        location: d.whereabouts.map(function (location) {
          return location.location
        })
      }
    })

    // select the html table element in which to write out our new rows
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

      // apply the click actions to the newly created links
      $('.update').click(function (e) {
        // stop the normal browser action when a link is clicked
        e.preventDefault()
        var when = $(this).closest('td').data().date
        var memberId = $(this).closest('tr').data().id
        var loc = $(this).data().loc
        updateMember(memberId, when, loc)
      })
    }

    // loop through the members list and add each one to the person list
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
