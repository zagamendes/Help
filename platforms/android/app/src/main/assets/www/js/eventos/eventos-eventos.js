//RECEBENDO USUÁRIO ATUAL DO LOCALSTORAGE
isLogged();


//OBJETO QUE ME FALA QUAIS CATEGORIAS DE EVENTOS O USUÁRIO JÁ PESQUISOU, PARA NÃO PRECISAR FAZER CONSULTA NO BANCO DE NOVO
const icones = {
	games: 0,
	"eventos-geek": 0,
	"shows-festivais": 0,
	esportes: 0,
	espiritual: 0,
	animais: 0,
	outros: 0,
	cidade: 0,
	ensinar: 0,
	buscaAtual: "todos"
}
$(document).ready(async function () {

	//DEFINE A LÍNGUA DOS ICONES E BARRA DE PESQUISA
	defineLanguage();


	//NÃO PERMITE O USUÁRIO CLICAR EM NENHUM ÍCONE ENQUANTO OS DADOS ESTÃO SENDO TRAZIDOS DO BANCO
	$("div .icone").each(function () {
		$(this).append(addSpinner())
	})

	try {
		
		//LISTA EVENTOS POR GOSTO
		const eventos = await EventoDAO.listar(usuario);

		//REMOVE GIF DE LOADING
		escondeLoading();

		//PARA CADA EVENTO VERIFICA SE O USUÁRIO ESTAR INSCRITO NO EVENTO
		eventos.forEach(async evento => {

			//CAMINHO PARA REALIZAR CONSULTA
			const refUserEvento = rootRef.child(`pessoas-inscritas-no-meu-evento/${usuario.pais}/${evento.idDono}/${evento.categoria}/${evento.id}/${usuario.usuarioId}`);

			//VALOR RETORNADO DIZENDO SE O USUÁRIO ESTAR INSCRITO OU NÃO
			const inscrito = await refUserEvento.once("value");


			//FUNCÃO CRIA UMA ROW COM O EVENTO E COM A CLASSE PASSADA NO PARAMETRO, INSCRITO.VAL() PARA DIZER SE O BOTÃO TEM QUE SER VERMELHO OU AZUL
			criaLista(evento, "todos", inscrito.val());

			//DEFINE A LÍNGUA DOS BOTÕES
			defineLanguage();

		});

		//DEPOIS QUE TODOS OS EVENTOS FORAM RETORNADOS DO BANCO, PERMITE O USUÁRIO CLICAR NOS ÍCONES
		$(".spinner-border").remove();


		//CASO O USUÁRIO CLIQUE NO BOTÃO VERDE/VERMELHO
		$(".container").on("click", ".btn-subscribe", async function () {

			try {
				//GERA OBJETO APARTIR DOS DADOS QUE ESTÃO ARMAZENADOS NOS DATA-* DO BOTÃO CLICADO
				const evento = {
					id: $(this).val(),
					titulo: $(this).data("titulo"),
					caminho: $(this).data("caminho"),
					categoria: $(this).data("categoria"),
					idDono: $(this).data("dono"),
					cidade: $(this).data("cidade"),
					pais: $(this).data("pais"),
					estado: $(this).data("estado"),
					descricao: $(this).data("descricao"),
					data: $(this).data("data"),
					horario: $(this).data("horario"),
					rua: $(this).data("rua")

				};
				//ADICIONA ICONE DE LOADING NO BOTÃO ENQUANTO INSCRIÇÃO/CANCELAMENTO ESTAR SENDO FEITO
				$(this).prepend(addSpinner());

				// VERIFICA SE O BOTÃO CLICADO TEM A CLASS BTN-DANGER SE TIVER SIGNIFICA QUE USER QUER CANCELAR INSCRICAO
				//CASO CONTRÁRIO USER QUER SE INSCREVER
				if ($(this).hasClass("btn-danger")) {

					//CANCELANDO INSCRIÇÃO
					await EventoDAO.unsubscribe(evento);
					$(this).removeClass("btn-danger");
					$(this).addClass("btn-success");

					//CASO TENHA O IDIOMA DO USUÁRIO NO ARQUIVO JSON, MOSTRA MENSAGEM NO IDIOMA DELE, SE NÃO EM INGLÊS
					objLanguage[language] ? $(this).html(objLanguage[language]["subscribed"]["subscribe"]) : $(this).html(objLanguage['en']["subscribed"]["subscribe"]);


				} else {

					//SE INSCREVE
					await EventoDAO.subscribeToEvent(evento);

					$(this).addClass("btn-danger");
					$(this).removeClass("btn-success");

					//CASO TENHA O IDIOMA DO USUÁRIO NO ARQUIVO JSON, MOSTRA MENSAGEM NO IDIOMA DELE, SE NÃO EM INGLÊS
					objLanguage[language] ? $(this).html(objLanguage[language]["subscribed"]["unsubscribe"]) : $(this).html(objLanguage['en']["subscribed"]["unsubscribe"]);

				}

				removeSpinner();

			} catch (erro) {
				trataErros(erro)
			}

		});

		//EVENTO PARA QUANDO USUÁRIO BUSQUE UM EVENTO ESPECÍFICO
		$("#form-buscarEvento").submit(async function (e) {


			//NÁO DEIXANDO O FORMULÁRIO SER SUBMETIDO
			e.preventDefault();

			//MUDANDO O ÍCONE DO INPUT
			$("#lupa").removeClass("fa-search");
			$("#lupa").addClass("fa-times");

			//ESCODENDO LISTA DE EVENTOS ATUAIS
			$("." + icones.buscaAtual).fadeOut();

			//DESATIVANDO O ÍCONE ATIVO
			$(".icone[data-valor='" + icones.buscaAtual + "']").removeClass("iconeAtivo");


			//REMOVENDO LISTA DE ANTIGOS EVENTOS BUSCADOS PELO USUÁRIO
			$(".eventos-buscados").fadeOut(function () {
				$(this).remove();
			});


			escondeEventoNotFound();

			buscarEvento($("#input-buscarEvento").val());

		});





	} catch (erro) {
		console.log(erro);
		Notificacao.erro(erro);
	}

	//EVENTO QUE BUSCA EVENTOS REFERENTE AO ICONE CLICADO PELO USUÁRIO
	$(".icone").click(function () {

		//CASO O USUARIO TENTE CLICAR EM UM ÍCONE ENQUANTO A BARRA DE PESQUISA ESTEJA ATIVADA
		// RETORNA FALSO
		if ($("#lupa").hasClass("fa-times")) {
			return false;
		}


		//CASO O USUÁRIO CLIQUE EM ALGUM ÍCONE 
		//PERCORRO TODOS OS ÍCONES PARA DESCOBRIR QUAL O ICONE ESTÁ ATIVO
		$(".icone").each(function () {

			//CASO O ICONE ATUAL ESTAJA ATIVO
			if ($(this).hasClass("iconeAtivo")) {

				//PEGO O A LISTA ATUAL QUE ESTÁ SENDO MOSTRADA PARA O USUÁRIO
				icones.buscaAtual = $(this).data("valor");

				//DESATIVO O ICONE ATUAL
				$(this).removeClass("iconeAtivo");

			}

		});


		//ATIVO O NOVO ÍCONE QUE O USUÁRIO CLICLOU
		$(this).addClass("iconeAtivo");

		//CASO O USUÁRIO CLIQUE NO ÍCONE TODOS SIGNIFICA QUE ANTES OUTRO ÍCONE ESTAVA ATIVO
		if ($(this).data("valor") == "todos") {

			escondeLoading();
			//ESCONDO A LISTA ATUAL QUE ESTAVA SENDO MOSTRADA PELO USUARIO E MOSTRO A LISTA "TODOS"
			$("." + icones.buscaAtual).fadeOut();
			$(".todos").fadeIn();


		} else {

			//PEGO A CATEGORIA DO ICONE E PASSO PARA A FUNÇÃO QUE DECIDE SE VAI BUSCAR NO BANCO OU SE ESSA LISTA JÁ FOI BUSCADA ANTES
			//ESCONDE A LISTA ATUAL
			const categoria = $(this).data("valor");
			$("#img-loading").css("display", "block");

			//FUNCÃO DECIDE SE BUSCA NO BANCO OU MOSTRA NA TELA
			defineTipoLista(categoria);


		}


	});

	$("#lupa").click(function () {

		removeIconeX("#lupa");

	});

});