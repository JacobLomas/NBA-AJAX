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
  tablon=document.getElementById("tablon");
  document.getElementById("btnSearch").addEventListener("click", (e)=>{
    paginaActual=1;
    eliminarTablon();
    loadPlayer();
  })
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
    card.appendChild(initModal(jugador.id));
    tablon.appendChild(card);
  });
}
function initCard(id, firstName, lastName, height, weight, fullTeamName){
  let div=document.createElement("div");
  div.className="card";
  div.id=id;
  div.style="width: 15rem; max-height: 70vh; margin-top:25px";
  div.appendChild(initFoto(firstName, lastName));
  div.appendChild(initCardBody(id,firstName, lastName, height, weight, fullTeamName));
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

  var img=document.createElement("img");
  /* var src="https://nba-players.herokuapp.com/players/"+lastName+"/"+firstName; */
  img.src=src;
  img.className="card-img-top";
  img.addEventListener("error", (e)=>{
    e.target.src="./imagenes/alt.png";
  });
  img.style.padding="3rem"
  img.alt="Foto de "+firstName+" "+lastName;
  return img;
}
function initCardBody(id,firstName, lastName, height, weight, fullTeamName){
  let div=document.createElement("div");
  div.className="card-body";
  div.appendChild(initCardBodyTitle(firstName, lastName));
  div.appendChild(initCardBodyDescription(height, weight, fullTeamName));
  div.appendChild(initButton(id));
  return div;
}
function initCardBodyTitle(firstName, lastName){
  var h5=document.createElement("h5");
  h5.className="card-title";
  h5.innerText=firstName+" "+lastName;
  return h5;
}
function initCardBodyDescription(height, weight, fullTeamName){
  var ul=document.createElement("ul");
  ul.className="list-group list-group-flush";
  ul.appendChild(initFullTeamName(fullTeamName));
  ul.appendChild(initHeight(height));
  ul.appendChild(initWeight(weight));
  return ul;  
}
function initHeight(height){
  let li=document.createElement("li");
  li.className="list-group-item";
  if(height==null)
    li.innerText="Altura: null";
  else
    li.innerText="Altura: "+Math.round10(height*25.4, -1)+"cm";
  return li;
}
function initWeight(weight){
  let li=document.createElement("li");
  li.className="list-group-item";
  if(weight==null)
    li.innerText="Peso: null";
  else
    li.innerText="Peso: "+Math.round10(weight/2.205,-1)+"kg";
  return li;
}
function initFullTeamName(fullTeamName){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Equipo: "+fullTeamName;
  return li;
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
  let divModal=document.createElement("div");
  divModal.id="modal"+id;
  divModal.className="modalContainer";
  divModal.appendChild(initModalContent(id));
  return divModal;
}
function initModalContent(id){
  let divModalContent=document.createElement("div");
  divModalContent.className="modal-content";
  let button=document.createElement("button");
  button.type="button";
  button.className="btn-close close";
  button.addEventListener("click", (e)=>{
    e.target.parentNode.parentNode.style.display = "none";
    document.body.style.position = "inherit";
    document.body.style.height = "auto";
    document.body.style.overflow = "visible";
  })

  divModalContent.appendChild(button);
  divModalContent.appendChild(initSearchAvarages(id));
  return divModalContent;
}
function initSearchAvarages(id){
  let div=document.createElement("div");
  div.className="d-flex";
  div.style.marginTop="1vh";
  let input=document.createElement("input");
  input.className="form-control me-2";
  input.type="number";
  input.min="1949";
  input.max="2020";
  input.value="2020";
  input.placeholder="Season ej.:2020";
  let search=document.createElement("button");
  search.innerText="Seleccionar Temporada";
  search.className="btn btn-outline-success";
  search.addEventListener("click", ()=>{
    if(div.parentNode.querySelector("ul")){
      div.parentNode.removeChild(div.parentNode.querySelector("ul"));
    }
    loadPlayerAvarages(input.value,id);

  })
  div.appendChild(input);
  div.appendChild(search);
  return div;
}
function maquetarAvarages(datos){
let modal=document.getElementById("modal"+datos[0].player_id).getElementsByClassName("modal-content")[0];
var ul=document.createElement("ul");
ul.className="list-group list-group-flush";
ul.style.overflowY="scroll";
ul.style.maxHeight="50vh";
ul.style.marginTop="1vh"
ul.appendChild(initGamesPlayed(datos[0].games_played));
ul.appendChild(initFGM(datos[0].fgm));
ul.appendChild(initFGA(datos[0].fga));
ul.appendChild(initFG3M(datos[0].fg3m));
ul.appendChild(initFG3A(datos[0].fg3m));
ul.appendChild(initFTM(datos[0].ftm));
ul.appendChild(initFTA(datos[0].fta));
ul.appendChild(initOReb(datos[0].oreb));
ul.appendChild(initDReb(datos[0].dreb));
ul.appendChild(initPTS(datos[0].pts));
ul.appendChild(initAst(datos[0].ast));
ul.appendChild(initReb(datos[0].reb));
ul.appendChild(initStl(datos[0].stl));
ul.appendChild(initBlk(datos[0].blk));
ul.appendChild(initTurnover(datos[0].turnover));
ul.appendChild(initPF(datos[0].pf));
ul.appendChild(initFG_pct(datos[0].fg_pct));
ul.appendChild(initFG3_pct(datos[0].fg3_pct));
ul.appendChild(initFT_pct(datos[0].ft_pct));
modal.appendChild(ul);

}
function initGamesPlayed(gamesPlayed){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Partidos jugados: "+gamesPlayed;
  return li;
}
function initFGM(fgm){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FGM: "+fgm;
  li.title="Field goal matter";
  return li;
}
function initFGA(fga){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FGA: "+fga;
  li.title="Field goal attemted";
  return li;
}
function initFG3M(fg3m){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FG3M: "+fg3m;
  li.title="Field 3pt goal matter";
  return li;
}
function initFG3A(fg3a){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FG3A: "+fg3a;
  li.title="Field 3pt goal attemted";
  return li;
}
function initFTM(ftm){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FTM: "+ftm;
  li.title="Free trows matter";
  return li;
}
function initFTA(fta){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FTA: "+fta;
  li.title="Free trows attemted";
  return li;
}
function initOReb(oreb){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Offensive Reb.: "+oreb;
  return li;
}
function initDReb(dreb){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Deffensive Reb.: "+dreb;
  return li;
}
function initReb(reb){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Rebounds: "+reb;
  return li;
}
function initAst(ast){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Assist: "+ast;
  return li;
}
function initStl(stl){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Steels: "+stl;
  return li;
}
function initBlk(blk){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Block: "+blk;
  return li;
}
function initTurnover(trno){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Turnovers: "+trno;
  return li;
}
function initPF(pf){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Personal Fouls: "+pf;
  li.title="PF, PagaFantas";
  return li;
}
function initPTS(pts){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="Points per game: "+pts;
  return li;
}
function initFG_pct(fg_p){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FG%: "+(fg_p*100)+"%";
  li.title="Field Goal %";
  return li;
}
function initFG3_pct(fg3_p){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FG3%: "+(fg3_p*100)+"%";
  li.title="Field 3pt Goal %";
  return li;
}
function initFT_pct(ft_p){
  let li=document.createElement("li");
  li.className="list-group-item";
  li.innerText="FT%: "+(ft_p*100)+"%";
  li.title="Free Trows %";
  return li;
}
/* ====================================== */


/* Funcion auxiliar */
function eliminarTablon(){
  tablon.innerHTML="";
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