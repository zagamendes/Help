//FUNÇÃO CONSOLE.LOG RESUMIDA
const log = console.log;

//RETORNA O USUÁRIO ATUAL DO SISTEMA
let usuario = getUserFromLS();
let objLanguage;
let language = navigator.language.split("-").shift();
//let language = "en";

//ARRAY PARA ADICIONAR EVENTOS EXCLUIDOS
const categoriasEventos = [
	"animais",
	"games",
	"eventos-geek",
	"espiritual",
	"esportes",
	"aprender",
	"outros",
	"shows-festivais",
];

//REFERÊNCIA DO BANCO DE DADOS
const rootRef = firebase.database().ref();

async function defineLanguage() {
	try {
		
		if(sessionStorage.linguas){

			log("Ja buscou uma vez no banco");
			objLanguage = JSON.parse(sessionStorage.linguas);
			log(objLanguage);

		}else{
			log("Buscando pela primeira vez no banco");

			let languages = await rootRef.child("linguas").once("value");
			sessionStorage.linguas = JSON.stringify(languages.val());
			objLanguage = JSON.parse(sessionStorage.linguas);

		}
		
		

		

		//SE O JSON TIVER O IDOMA DO NAVEGADOR, TRADUZ TUDO NO IDIOMA, SE NÃO TRADUZ EM INGLÊS
		if (objLanguage[language]) {
			$(".translate").each(function (i) {
				$(this).text(
					objLanguage[language][$(this).data("page")][$(this).data("key")]
				);
			});

			$(".translate-input").each(function () {
				$(this).attr(
					"placeholder",
					objLanguage[language][$(this).data("page")][$(this).data("key")]
				);
			});

			dados = [objLanguage[language]["about-page"]["volunteer"], objLanguage[language]["about-page"]["events"]];

			$(".icone-translate").each(function () {
				$(this).text(
					objLanguage[language][$(this).data("page")]["icones"][
					$(this).data("key")
					]
				);
			});
		} else {

			$(".translate").each(function (i) {
				$(this).text(
					objLanguage["en"][$(this).data("page")][$(this).data("key")]
				);
			});

			$(".translate-input").each(function () {
				$(this).attr(
					"placeholder",
					objLanguage["en"][$(this).data("page")][$(this).data("key")]
				);
			});

			dados = ["Volunteers", "Events"];

			$(".icone-translate").each(function () {
				$(this).text(
					objLanguage["en"][$(this).data("page")]["icones"][$(this).data("key")]
				);
			});
		}
	} catch (error) {
		console.log(error);

	}
}

async function logOut() {
	try {
		await firebase.auth().signOut();
		localStorage.clear();
		location.replace("index.html");
	} catch (error) {
		Notificacao.erro(error);
		log(error);
	}
}
function limparCampos() {
	let form = $("#form-evento")[0];
	form.reset();
	$("#barra-progresso").val(0);
	$("#btn-cadastrar-evento").removeAttr("disabled");

	$("#input-tags")
		.val()
		.split(",")
		.forEach((tag) => {
			$("#input-tags").removeTag(tag);
		});
}

async function defineCategoria(palavra, tagsDB) {
	let match = false;

	let games, eventos, shows, esportes, ensinar, espiritual, animais;
	if (tagsDB) {
		games = tagsDB.val().games.toString();
		eventos = tagsDB.val()["eventos-geek"].toString();
		shows = tagsDB.val()["shows-festivais"].toString();
		esportes = tagsDB.val().esportes.toString();
		ensinar = tagsDB.val().ensinar.toString();
		espiritual = tagsDB.val().espiritual.toString();
		animais = tagsDB.val().animais.toString();
	} else {
		let tagsDB = await rootRef.child(`tags/${usuario.pais}`).once("value");
		if (tagsDB.val()) {
			games = tagsDB.val().games.toString();
			eventos = tagsDB.val()["eventos-geek"].toString();
			shows = tagsDB.val()["shows-festivais"].toString();
			esportes = tagsDB.val().esportes.toString();
			ensinar = tagsDB.val().ensinar.toString();
			espiritual = tagsDB.val().espiritual.toString();
			animais = tagsDB.val().animais.toString();
		} else {
			return false;
		}
	}

	let objGames = {
		nome: "games",
		qtd: 0,
	};
	let objEventos = {
		nome: "eventos-geek",
		qtd: 0,
	};
	let objShows = {
		nome: "shows-festivais",
		qtd: 0,
	};
	let objEsportes = {
		nome: "esportes",
		qtd: 0,
	};
	let objEnsinar = {
		nome: "ensinar",
		qtd: 0,
	};
	let objEspiritual = {
		nome: "espiritual",
		qtd: 0,
	};
	let objAnimais = {
		nome: "animais",
		qtd: 0,
	};
	let objOutros = {
		nome: "outros",
		qtd: 0,
	};

	let arrayCategorias = [];

	//RECEBE UMA STRING COM A LISTA DE TAGS SEPERADAS POR ",". GERO UM ARRAY DESSA STRING
	palavra = palavra.split(",");

	//OLHO PALAVRA POR PALAVRA E COMPARO SE ESSA PALAVRA É REFERENTE HÁ ALGUMA DAS CATEGORIAS
	palavra.forEach((auxPalavra) => {
		//STRING DE EXPRESSÃO REGULAR SEMELHANTE AO ILIKE DO SQL
		var auxTag = ".*" + auxPalavra + ".*";

		//EXPRESSÃO REGULAR QUE VAI SER COMPARADA, CASE-INSENSITIVE
		var re = new RegExp(auxTag, "gi");

		if (games.match(re)) {
			objGames.qtd++;
			match = true;
		}
		if (eventos.match(re)) {
			objEventos.qtd++;
			match = true;
		}
		if (shows.match(re)) {
			objShows.qtd++;
			match = true;
		}
		if (esportes.match(re)) {
			objEsportes.qtd++;
			match = true;
		}
		if (ensinar.match(re)) {
			objEnsinar.qtd++;
			match = true;
		}
		if (espiritual.match(re)) {
			objEspiritual.qtd++;
		}
		if (animais.match(re)) {
			objAnimais.qtd++;
			match = true;
		}
		if (match == false) {
			objOutros.qtd++;
		}
	});

	arrayCategorias.push(
		objGames,
		objEnsinar,
		objOutros,
		objAnimais,
		objEspiritual,
		objEsportes,
		objEventos,
		objShows
	);

	let categoria = arrayCategorias.reduce((valor, posicaoAtual) => {
		if (posicaoAtual.qtd > valor.qtd) {
			return posicaoAtual;
		} else {
			return valor;
		}
	}, objGames);
	log(categoria.nome);
	return categoria.nome;
}

async function buscarEvento(palavra) {
	//VERIFICO EM QUAL CATEGORIA A PALAVRA DIGITADA SE ENCAIXA
	let categoria = await defineCategoria(palavra);

	//BUSCO NO BANCO EVENTOS APENAS NA CATEGORIA DEFINIDA
	categoria
		? await EventoDAO.buscaEventoPorPalavra(categoria, palavra)
		: Notificacao.alerta(
			objLanguage["en"]["notifications"]["no-country-support"]
		);
}

function sleep(ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

async function animacaoIcones(qtdIcones) {
	for (let i = 0; i < qtdIcones; i++) {
		$("#" + i).addClass("animated bounceInDown");
		$("#" + i).removeAttr("hidden");

		await sleep(200);
	}
}

async function animacaoIcones2(qtdIcones) {
	for (let i = 0; i < qtdIcones; i++) {
		$("#" + i).addClass("animated fadeInUp");
		$("#" + i).removeAttr("hidden");

		await sleep(200);
	}
}

function pegaPaisEvento() {
	navigator.geolocation.getCurrentPosition(
		async (dados) => {
			try {
				let response = await fetch(
					"https://nominatim.openstreetmap.org/reverse?accept-language=en&format=json&lat=" +
					dados.coords.latitude +
					"&lon=" +
					dados.coords.longitude
				);
				let dados = response.json();

				evento.setPais(dados.address.country);
			} catch (error) {
				Notificacao.erro(error);
				log(error);
			}
		},
		(erro) => {
			if (erro.code == 1) {
				if (language == "pt") {
					Notificacao.alerta(
						"Caso você não permita acesso a sua localização não será possível prosseguir com o cadastro"
					);
				} else {
					if (objLanguage[language]) {
						Notificacao.alerta(
							objLanguage[language]["notifications"]["get-location-denied"]
						);
					} else {
						Notificacao.alerta(
							objLanguage["en"]["notifications"]["get-location-denied"]
						);
					}
				}
			} else {
				if (language == "pt") {
					Notificacao.erro(
						"Não foi possível acessar sua localização no momento, tentaremos mais tarde"
					);
				} else {
					if (objLanguage[language]) {
						Notificacao.erro(
							objLanguage[language]["notifications"]["error-get-location"]
						);
					} else {
						Notificacao.erro(
							objLanguage["en"]["notifications"]["error-get-location"]
						);
					}
				}
			}
			console.log(erro);
		}
	);
}

function salvarUser(usuario) {
	let gostos = [];

	$("input[name='gostos[]']:checked").each(function () {
		gostos.push($(this).val());
	});

	usuario.gostos = gostos;

	UsuarioDAO.salvar(usuario);
}

function atualizarMeusInteresses() {
	let gostos = [];

	$("input[name='gostos[]']:checked").each(function () {
		gostos.push($(this).val());
	});

	$("#img-loading").removeAttr("hidden");
	$("div.container").attr("hidden", "hidden");

	usuario.gostos = gostos;
	UsuarioDAO.atualizarInteresses();
}

function numeroDeIcones() {
	let qtdIcones = 0;

	$(".form-check").each(function (i) {
		$(this).attr("id", i);
		qtdIcones++;
	});

	return qtdIcones;
}
function numeroDeIcones2() {
	let qtdIcones = 0;

	$(".row").each(function (a) {
		$(this).attr("id", a);
		qtdIcones++;
	});

	return qtdIcones;
}

function criaLista(evento, novaCategoria, inscrito) {
	let botaoLerMais = "";
	let descricao = "";
	let endereco = "";
	let botaoInscrito = "";
	//REMOVE "-" DA STRING DATA
	let auxData = evento.data.split("-");

	//CRIA UM OBJETO DATE FORMATADO BASEADO NA REGIÃO DO DISPOSITIVO
	const data = new Date(
		auxData[0],
		auxData[1],
		auxData[2]
	).toLocaleDateString();
	if (inscrito) {
		botaoInscrito = `<button id='${evento.id}' data-estado='${evento.estado}' data-cidade='${evento.cidade}' data-pais='${evento.pais}' 
		data-dono='${evento.idDono}' data-titulo='${evento.titulo}' data-rua='${evento.rua}' data-horario='${evento.horario}' data-data='${evento.data}'
		data-descricao='${evento.descricao}' data-caminho='${evento.caminho}' data-categoria='${evento.categoria}' 
		value='${evento.id}' class='btn btn-subscribe btn-danger text-uppercase font-weight-bold z-depth-1'>
			<p>
				<span class='fas fa-user-times'></span> <span class='translate' data-page='events-page' data-key='unsubscribe'>Cancelar inscrição</span> 
			</p>
		</button>`;
	} else {
		botaoInscrito = `<button id='${evento.id}' data-estado='${evento.estado}' data-cidade='${evento.cidade}' data-pais='${evento.pais}' 
		data-dono='${evento.idDono}' data-titulo='${evento.titulo}' data-horario='${evento.horario}' data-rua='${evento.rua}' data-data='${evento.data}' data-descricao='${evento.descricao}' data-caminho='${evento.caminho}' data-categoria='${evento.categoria}' 
		value='${evento.id}' class='btn btn-subscribe btn-success text-uppercase font-weight-bold z-depth-1'>
			<p> 
				<span class='fas fa-user-plus'></span> <span class='translate' data-key='subscribe' data-page='events-page'>Me inscrever</span> 
			</p>
		</button>`;
	}
	//BOTAO COM AS INFORMAÇÕES DO EVENTO PARA ENVIAR PARA A PAGINA EVENTO
	botaoLerMais = `<a href=https://apptcc-6f556.web.app/evento?id=${evento.id}&categoria=${evento.categoria}&pais=${evento.pais}&cidade=${evento.cidade} 
			class='btn btn-info btn-ler-mais text-uppercase font-weight-bold z-depth-1'>
			<span class='fas fa-info-circle'></span> <span class='translate' data-page='events-page' data-key='btn-read-more'>Ler Mais</span>  
		</a>`;

	descricao = `<p class='card-text'>${evento.descricao.substr(0, 140)}...</p>`;

	//ENDERENCO TEM OS ÍCONES
	endereco = `<p class='card-text'><span class='fas fa-map-marker-alt' style='color:red'></span> ${evento.cidade}</p>`;
	endereco += `<p class='card-text'><span class='fas fa-calendar' style='color:red'></span> ${data}</p>`;

	let card = `<div class='mb-5 col-md-12 col-lg-6 ${novaCategoria}'>
				<div class='card z-depth-2'>
					<img src='${evento.caminho}' class='card-img-top'>
					<div class='card-body'>
						<h4 class='card-title'>${evento.titulo}</h4>
						${endereco}
						${descricao}
						<div class='row'>
							<div class='col-6'>
								${botaoInscrito}
							</div>
							
							<div class='col-6'>
								${botaoLerMais}
							</div>
						</div>
					</div>
				</div>
			</div>`;

	$("#row-eventos").append(card);
}

function pegaLocalizacao() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(dados) => {
				EventoDAO.listaPorLocalizacao(dados);
			},
			(erro) => {
				Notificacao.erro(erro);
				console.log(erro);
			}
		);
	} else {
		if (objLanguage[language]) {
			Notificacao.alerta(
				objLanguage[language]["notifications"]["no-geolocation-support"]
			);
		} else {
			Notificacao.alerta(
				objLanguage["en"]["notifications"]["no-geolocation-support"]
			);
		}
	}
}
function escondeLoading() {
	$("#img-loading").removeClass("mx-auto, d-block");
	$("#img-loading").css("display", "none");
}

function mostraLista(palavra) {
	escondeLoading();
	$(`.${icones.buscaAtual}`).fadeOut();
	$(`.${palavra}`).fadeIn();
	icones.buscaAtual = palavra;
}

function defineTipoLista(categoria) {
	const categorias = [
		"games",
		"ensinar",
		"shows-festivais",
		"eventos-geek",
		"animais",
		"esportes",
		"outros",
		"espiritual",
	];

	if (categoria == "cidade") {
		icones.cidade == 1 ? mostraLista(categoria) : pegaLocalizacao();
	}
	//VERIFICO QUAL CATEGORIA O USUÁRIO ESCOLHEU E CASO ESSA CATEGORIA JÁ TIVESSE SIDO SELECIONADA ANTES, APENAS MOSTRE,
	//CASO CONTRÁRIO BUSCA NO BANCO
	for (let i = 0; i < categorias.length; i++) {
		if (categoria == categorias[i]) {
			icones[categoria] == 1
				? mostraLista(categoria)
				: EventoDAO.listaPorCategoria(categoria);
			break;
		}
	}
}

function removeIconeX(id) {
	if ($(id).hasClass("fa-times")) {
		$(id).removeClass("fa-times");
		$(id).addClass("fa-search");

		$(".eventos-buscados").fadeOut(function () {
			$(this).remove();
		});

		$("." + icones.buscaAtual).fadeIn();
		$(".icone[data-valor='" + icones.buscaAtual + "']").addClass("iconeAtivo");
		$("#input-buscarEvento").val("");
	}
}

function criaCardEventoInscrito(evento) {
	let url = encodeURIComponent(
		`https://apptcc-6f556.firebaseapp.com/evento?id=${evento.id}&categoria=${evento.categoria}&pais=${evento.pais}&cidade=${evento.cidade}`
	);
	const card = `<div id="${
		evento.id
		}" class="col-sm-12 col-md-6 col-lg-6 col-xl-4" >
						<div class=card>
							<img src='${evento.caminho}' class='card-img-top'>
							<div class="card-body">
								<!-- Title -->
								<h4 class="card-title">${evento.titulo}</h4>
								<p class="card-text">
									<p class="card-text">
										${evento.descricao.substr(0, 140)}...
										<p><span class="fas fa-clock"></span> ${evento.horario}</p>
										<p><span class="fas fa-calendar"></span> ${new Date(
			evento.data.replace(/-/g, ",")
		).toLocaleDateString()}</p>
										<p><span class="fas fa-building"></span> ${evento.rua}</p>
										<p><span class="fas fa-map-marker-alt"></span> ${evento.cidade}-${
		evento.estado
		}</p>
									</p>
								</p>
								<div class='row'>
									<div class='col-6'>
										<button id='${evento.id}' 
											data-cidade='${evento.cidade}' data-descricao='${
		evento.descricao
		}' data-pais='${evento.pais}' data-dono='${evento.idDono}' data-titulo='${
		evento.titulo
		}' data-estado='${evento.estado}'
											data-caminho='${evento.caminho}' data-rua='${evento.rua}' data-horario='${
		evento.horario
		}' data-categoria='${evento.categoria}' data-data='${evento.data}' value='${
		evento.id
		}' 
											class='btn btn-danger btn-subscribe text-uppercase font-weight-bold'>
												<p>
													<span class='fas fa-user-times'></span> <span class='translate' data-page='events-subscribed-page' data-key='unsubscribe'>Cancelar inscrição</span> 
												</p>
										</button>
									</div>
									<div class=col-6>
										<a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" >
											<button  class='btn btn-primary btn-compartilhar text-uppercase font-weight-bold'>
												<span class='fab fa-facebook-f'></span> <span class='translate' data-page='events-subscribed-page' data-key='btn-share'>Compartilhar</span>
											</button>
										</a>
									</div>
								</div>

							</div>
						</div>
					</div>`;

	$("#row-events-subscribed").append(card);
}

//PRIMEIRO PARÂMETRO REFERENTE A PÁGINA BEM VINDO E SEGUNDO REFERENTE A INDEX
function isLogged(pagina, index) {
	if (pagina) {
		//CASO LS.UID SEJA NULLO, USUÁRIO TENTOU ACESSAR A URL IMPROPRIAMENTE
		if (!localStorage.uid) {
			//VERIFICO SE O USUÁRIO ESTÁ LOGADO, SE SIM, REDIRECIONO PARA TELA PRINCIPAL, CASO CONTRÁRIO, TELA DE LOGIN
			localStorage.user
				? location.replace("menu.html")
				: location.replace("index.html");
		}
	} else {
		//SE INDEX FOR TRUE, USUÁRIO ACESSOU A PÁGINA INDEX, SE INDEX FOR FALSO, USUÁRIO TENTOU ACESSAR QUALQUER PÁGINA
		if (index) {
			//SE USER ESTÁ LOGADO MANDO PARA TELA PRINCIPAL
			localStorage.user
				? location.replace("menu.html")
				: console.log("Não logado");
		} else {
			//SE TENTOU ACESSAR QUALQUER PÁGINA SEM ESTAR LOGADO, MANDA PARA INDEX, SE NÃO, NÃO FAZ NADA
			!localStorage.user
				? location.replace("index.html")
				: console.log("logado");
		}
	}
}

function getUserFromLS() {
	if (localStorage.user) {
		const user = JSON.parse(localStorage.user);
		return user;
	} else {
		return {};
	}
}

function noEventsFound() {
	$(".container").append(
		"<img id='notFound' src='img/not found.png' class='img-fluid mx-auto mt-3 d-block animated fadeIn not-found'>"
	);

	if (language == "pt") {
		$(".container").append(
			"<h5 id='notFoundMessage' data-key='noVolunteer' class='translate text-center animated fadeInDown'>Nenhum evento disponível, por favor volte novamente mais tarde ou seja o primerio a cadstrar um evento.</h5>"
		);
	} else {
		if (objLanguage[language]) {
			$(".container").append(
				`<h5 id='notFoundMessage' class='text-center animated fadeInDown'>${objLanguage[language]["notifications"]["no-events"]}`
			);
		} else {
			$(".container").append(
				`<h5 id='notFoundMessage' class='text-center animated fadeInDown'>${objLanguage["en"]["notifications"]["no-events"]}`
			);
		}
	}
}

function escondeEventoNotFound() {
	$("#notFound").remove();
	$("#notFoundMessage").remove();
}

function trataErros(erro) {
	if (
		erro.code == "storage/canceled" ||
		erro.code == "storage/retry-limit-exceeded" ||
		erro.code == "PERMISSION_DENIED" ||
		erro.code == "storage/object-not-found" ||
		erro.code == "storage/unauthorized"
	) {
		//CASO O IDIOMA DO DISPOSITIVO ESTEJA NA LISTA DE TRADUÇÕES IMPRIME MENSAGEM DE ERRO NO IDIOMA DO DISPOSITIVO, SE NÃO IMPRIME EM INGLÊS
		objLanguage[language]
			? Notificacao.erro(objLanguage[language]["errors"][erro.code.replace("/","-")])
			: Notificacao.erro(objLanguage["en"]["errors"][erro.code.replace("/","-")]);
		log(erro);
	} else {
		Notificacao.erro(erro);
		log(erro);
	}
}

function ativaBotoes() {
	$("#btn-cadastrar-evento").removeAttr("disabled");
	$("#btn-cancelar").removeAttr("disabled");
}

function desativaBotoes() {
	$("#btn-cadastrar-evento").attr("disabled", "disabled");
}

function addSpinner() {
	return "<span id='spinner' class='spinner-border spinner-border-sm'></span>";
}

function removeSpinner() {
	$("#spinner").remove();
}
