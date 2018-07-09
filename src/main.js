let cboCohorts  = document.getElementById('cboCohorts');
let dataUsers=[];
cboCohorts.addEventListener("change", function(){
  //sendDataFilter()
});

function pushCohorts(arr){
  for(let i in arr)
  { 
    let option = document.createElement("option");
    cboCohorts.options.add(option, 0);
    cboCohorts.options[0].value = arr[i].id;
    cboCohorts.options[0].innerText = arr[i].id;
  }
}

function sendDataFilter () {
  let OrderBy         = document.getElementById('cboOrderBy').value;
  let OrderDirection  = document.getElementById('cboOrderDirection').value;
  let SearchName      = document.getElementById('SearchName').value;
  getOptions(cboCohorts.value, OrderBy, OrderDirection, SearchName);
}

function progressTable (users) {
  dataUsers=users;
  document.getElementById("tableBody").innerText = null;

  for(let user of users){

    let fila= ''.concat(
      '<td>'+user.name+'</td>',      
      '<td><button type="button" onclick="userProgressModel(\''+user.id+'\')" class="btn btn-outline-warning"><i class="fa fa-bar-chart" aria-hidden="true"></i></button></td>');

    let tr = document.createElement("TR");
    tr.innerHTML=fila;
    document.getElementById("tableBody").appendChild(tr);
  }
}


function userProgressModel(idUser) {
  let user = dataUsers.find(user =>{return user.id==idUser;});
  //console.log(user);

  document.getElementById('user-name').innerHTML=user.name;
  progressBar ('percent-general',0);
  progressBar ('percent-exercises',0);
  progressBar ('percent-reads',0);
  progressBar ('percent-quizzes',0);  
  progressBar ('percent-general',user.stats.percent);
  progressBar ('percent-exercises',user.stats.exercises.percent);
  progressBar ('percent-reads',user.stats.reads.percent);
  progressBar ('percent-quizzes',user.stats.quizzes.percent);
  $('#user-progress').modal('show');
}

function progressBar (id,percent) {
  $('#'+id)
  .css("width", percent + "%")
  .attr("aria-valuenow", percent)
  .text(percent + "%");
}