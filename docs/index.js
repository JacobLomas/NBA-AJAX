/* Variables de control de páginas de AJAX y variable de la vista*/
var paginaActual=1,ultimaPagina, tablon;
/* ======================================== */

/* Eventos window (scroll infinito y onload) */
window.addEventListener("scroll", (e)=>{
  if (document.body.scrollHeight - window.innerHeight === window.scrollY) {
    if(paginaActual<ultimaPagina){
      let y= window.scrollY;
      paginaActual++;
      loadPlayer();
      window.scrollTo(0, y-100);
    }
   }
})
window.onload=()=>{
  tablon=$('#tablon');
  $('#btnSearch').click(function (e) { 
    paginaActual=1;
    eliminarTablon();
    loadPlayer();
  });
}
/* ======================================== */

/* AJAX requests */
function loadPlayer() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
       var respuesta=JSON.parse(this.responseText);
       paginaActual=respuesta.meta.current_page;
       ultimaPagina=respuesta.meta.total_pages;
       maquetarRespuesta(respuesta);
      }
    };
    xhttp.open("GET","https://www.balldontlie.io/api/v1/players?search="+document.getElementById("search").value.toLowerCase()+"&page="+paginaActual+"&per_page=5", true);
    xhttp.send();
}
function loadPlayerAvarages(season,id) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var respuesta=JSON.parse(this.responseText);
      if(!respuesta.data[0])
        alert("No jugó en esa temporada");
      else
        maquetarAvarages(respuesta.data);
    }
  };
  xhttp.open("GET","https://www.balldontlie.io/api/v1/season_averages?season="+season+"&player_ids[]="+id, true);
  xhttp.send();
}
/* ============ */



/* Maquetacion de la carta de cada Jugador */
function maquetarRespuesta(respuesta){
  respuesta.data.forEach(jugador => {
    let card=initCard(jugador.id,jugador.first_name, jugador.last_name, jugador.height_inches, jugador.weight_pounds, jugador.team.full_name);
    card.append(initModal(jugador.id));
    tablon.append(card);
  });
}
function initCard(id, firstName, lastName, height, weight, fullTeamName){
  let div=$("<div id='"+id+"' class='card'>");
  div.css("width: 15rem; max-height: 90vh; margin-top:25px")
  div.append(initFoto(firstName, lastName));
  div.append(initCardBody(id,firstName, lastName, height, weight, fullTeamName));
  return div;
}
function initFoto(firstName, lastName){
  //Se deben extraer las dos primeras letras de firstname
    firstName=Array.from(firstName);
    let parseFN=[];
    parseFN.push(firstName.shift());
    parseFN.push(firstName.shift());
    firstName="";
    parseFN.forEach(letra=>{
      firstName+=letra.toLowerCase();
    })

  //Se deben extraer las 5 primeras letras de lastname
    lastName=Array.from(lastName);
    let parseLN=[];
    for(let i=0;i<6;i++){
      if(lastName[0]!="-")
        parseLN.push(lastName.shift());
      else
        lastName.shift();
    };
    parseLN.splice(5);
      
    lastName="";
    parseLN.forEach(letra=>{
      if(letra!="-"&&letra!=undefined)
        lastName+=letra.toLowerCase();
    });
    var src="https://www.basketball-reference.com/req/202012251/images/players/"+lastName+firstName+"01.jpg";
  //[=====================================================]

  var img=$("<img src='"+src+"' class='card-img-top'>").on('error',(e)=>{
    $(this).attr('src','./imagenes/alt.png')
  });
  img.css('padding', '3rem')
  /* var src="https://nba-players.herokuapp.com/players/"+lastName+"/"+firstName; */
  return img;
}
function initCardBody(id,firstName, lastName, height, weight, fullTeamName){
  let div=$("<div class='card-body'>");
  div.append(initCardBodyTitle(firstName, lastName));
  div.append(initCardBodyDescription(height, weight, fullTeamName));
  div.append(initButton(id));
  return div;
}
function initCardBodyTitle(firstName, lastName){
  return $("<h5 class='card-title'>"+firstName+" "+lastName+"</h5>")
}
function initCardBodyDescription(height, weight, fullTeamName){
  let ul=$("<ul class='list-group list-group-flush'>");
  ul.append(initFullTeamName(fullTeamName));
  ul.append(initHeight(height));
  ul.append(initWeight(weight));
  return ul;  
}
function initHeight(height){
  let li=$("<li class='list-group-item'>");
  if(height==null)
    li.text("Altura: null");
  else
    li.text("Altura: "+height+"feet");
  return li;
}
function initWeight(weight){
  let li=$("<li class='list-group-item'>");
  if(weight==null)
    li.text("Peso: null");
  else
    li.text("Peso: "+Math.round10(weight/2.205,-1)+"kg");
  return li;
}
function initFullTeamName(fullTeamName){
  return $("<li class='list-group-item'>Equipo: "+fullTeamName+"</li>");
}
function initButton(id){
  let button=document.createElement("button");
  button.innerText="Abrir Carta";
  button.className="btn btn-outline-success";
  button.style="margin-top:4px";
  button.setAttribute("data-target", "#modal"+id);
  button.setAttribute("data-toggle", "modal");
  button.addEventListener("click", (e)=>{
    let id=e.target.parentNode.parentNode.id;
    let modal= document.getElementById("modal"+id);
    modal.style.display="block";
    document.body.style.position = "static";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

  })
  return button; 
}
/* ================================================== */


/* Maquetacion de la ventana modal de cada jugador */
function initModal(id){
  let divModal=$("<div id='modal"+id+"' class='modalContainer'>");
  divModal.append(initModalContent(id));
  return divModal;
}
function initModalContent(id){
  let divModalContent=$("<div class='modal-content'>")
  let button=$("<button type='button' class='btn-close close'>").click(function(){
    $(this).parent().parent().css('display', 'none');
    $('body').css('position', 'inherit');
    $('body').css('height', 'auto');
    $('body').css('overflow', 'visible');
  });

  divModalContent.append(button);
  divModalContent.append(initSearchAvarages(id));
  return divModalContent;
}
function initSearchAvarages(id){
  let div=$("<div class='d-flex' style='margin-top:1vh'></div>");
  let input=$("<input class='form-control me-2' type='number' min='1949' max='2020' value='2020' placeholder='Season ej.:2020'>");
  let search=$("<button class='btn btn-outline-success'>Seleccionar Temporada</button>").click((e)=>{
    if(div.parent().find('ul').length){
      div.parent().remove(div.parent().find('ul'))
    }
    loadPlayerAvarages(input.value,id);
  })
  div.append(input);
  div.append(search);
  return div;
}

function maquetarAvarages(datos){
let modal=$("#modal"+datos[0].player_id).find(".modal-content")
var ul=$("<ul class='list-group list-group-flush' style='overflow-y:scroll;max-height:50vh; margint-top:1vh;'>")
ul.append(initGamesPlayed(datos[0].games_played));
ul.append(initFGM(datos[0].fgm));
ul.append(initFGA(datos[0].fga));
ul.append(initFG3M(datos[0].fg3m));
ul.append(initFG3A(datos[0].fg3m));
ul.append(initFTM(datos[0].ftm));
ul.append(initFTA(datos[0].fta));
ul.append(initOReb(datos[0].oreb));
ul.append(initDReb(datos[0].dreb));
ul.append(initPTS(datos[0].pts));
ul.append(initAst(datos[0].ast));
ul.append(initReb(datos[0].reb));
ul.append(initStl(datos[0].stl));
ul.append(initBlk(datos[0].blk));
ul.append(initTurnover(datos[0].turnover));
ul.append(initPF(datos[0].pf));
ul.append(initFG_pct(datos[0].fg_pct));
ul.append(initFG3_pct(datos[0].fg3_pct));
ul.append(initFT_pct(datos[0].ft_pct));
modal.append(ul);

}
function initGamesPlayed(gamesPlayed){
  return $("<li class='list-group-item>Partidos jugados: "+gamesPlayed+"</li>")
}
function initFGM(fgm){
  return $("<li class='list-group-item title='Field goal matter'>FGM: "+fgm+"</li>")
}
function initFGA(fga){
  return $("<li class='list-group-item title='Field goal attemted'>FGA: "+fga+"</li>")
}
function initFG3M(fg3m){
  return $("<li class='list-group-item title='Field goal 3pt matter'>FG3M: "+fg3m+"</li>")
}
function initFG3A(fg3a){
  return $("<li class='list-group-item title='Field 3pt goal attemted'>FG3A: "+fg3a+"</li>") 
}
function initFTM(ftm){
  return $("<li class='list-group-item title='Free trows matter'>FTM: "+ftm+"</li>")
}
function initFTA(fta){
  return $("<li class='list-group-item title='Field trows attemted'>FTA: "+fta+"</li>")
}
function initOReb(oreb){
  return $("<li class='list-group-item>Offensive Reb.: "+oreb+"</li>")
}
function initDReb(dreb){
  return $("<li class='list-group-item>Deffensive Reb.: "+dreb+"</li>")
}
function initReb(reb){
  return $("<li class='list-group-item>Rebounds: "+oreb+"</li>")
}
function initAst(ast){
  return $("<li class='list-group-item>Assist: "+ast+"</li>")
}
function initStl(stl){
  return $("<li class='list-group-item>Steels: "+stl+"</li>")
}
function initBlk(blk){
  return $("<li class='list-group-item>Block: "+blk+"</li>")
}
function initTurnover(trno){
  return $("<li class='list-group-item>Turnovers: "+trno+"</li>")
}
function initPF(pf){
  return $("<li class='list-group-item>Personal Fouls: "+pf+"</li>")
}
function initPTS(pts){
  return $("<li class='list-group-item>Points per game: "+pts+"</li>")
}
function initFG_pct(fg_p){
  return $("<li class='list-group-item>Field Goal %: "+(fg_p*100)+"%</li>")
}
function initFG3_pct(fg3_p){
  return $("<li class='list-group-item>Field 3pt Goal %: "+(fg3_p*100)+"%</li>")
}
function initFT_pct(ft_p){
  return $("<li class='list-group-item>Free trows %: "+(ft_p*100)+"%</li>")

}
/* ====================================== */


/* Funcion auxiliar */
function eliminarTablon(){
  tablon.find('*').remove()
}
/* ================ */


/* Añadiendo metodos de redondeo decimal a la clase Math */
  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
  function decimalAdjust(type, value, exp) {
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }
/* ================================= */