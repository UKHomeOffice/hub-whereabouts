var $ = jQuery
$(document).ready(function(){
console.log("hello were ready!")

var addTeamMemberWhereabouts = function(data) {
    var data = data.map(function(data){
        return {
            name: data.member,
            location: data.whereabouts.map(function(location) {
                return location.location
            })
        }
    })
var tab = $("#new-table")

var addPerson = function(person){
    var html = '<tr><td>'+person.name+'</td>'
    for(var i = 0; i < person.location.length; i++){
        html += '<td>'+getLoc(person.location[i])+'</td>'
        }
    html += '</tr>'
    tab.append(html)
}
var getLoc = function(ref){
    var col
    switch(ref){
    case 's': col = 'green'
    break;
    case 'l': col = 'red'
    break;
    case 'm': col = 'yellow'
    break;
    }
    return '<span class="loc '+col+'">'+ref.toUpperCase()+'</span>'

}

for(var i = 0; i < data.length; i++){
    addPerson(data[i])
}


}

$.get({
    url: "/team_members",
    success: addTeamMemberWhereabouts
})


//var data = [{name:"Greg", location:["s", "s", "s", "s", "l"]},
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
