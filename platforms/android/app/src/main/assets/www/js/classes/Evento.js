class Evento {
	constructor() {
		this.titulo = "";
		this.estado = "";
		this.pais = "";
		this.cidade = "";
		this.rua = "";
		this.cep = "";
		this.categoria = "";
		this.numero = "";
		this.caminho = "";
		this.descricao = "";
		this.data = "";
		this.horario = "";
		this.id = "";
		this.idDono = "";
		this.tags = "";

	}



}

class EventoDAO {

	static childRemovedEvents() {

		categoriasEventos.forEach(categoria=>{

			rootRef.child(`eventos/${usuario.pais}/${categoria}`).on("child_removed", snapshot => {

				$("#" + snapshot.key).fadeOut(450, () => $("#" + snapshot.key).remove() );


			});
		})

			


	}


	static salvar(evento, arquivo) {
		evento.id = rootRef.child(`eventos/${usuario.pais}/${evento.categoria}`).push().key;
		const dbStorage = firebase.storage().ref(`eventos/${evento.pais}/${evento.estado}/${evento.cidade}/${usuario.usuarioId}/${evento.id}`);
		let task = dbStorage.put(arquivo[0]);
		task.on("state_changed",
			snapshot => {

				let porcentagem = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				$("#barra-progresso").val(porcentagem);
				console.log(porcentagem);
				$("#btn-cancelar").click(() => {
					task.cancel();
					ativaBotoes();
					removeSpinner();
				});
			},
			trataErros,
			async () => {

				const dbRef = rootRef.child(`eventos/${usuario.pais}/${evento.categoria}/${evento.id}`);
				const eventodDoUsuario = rootRef.child(`meus-eventos/${usuario.pais}/${usuario.usuarioId}/${evento.categoria}/${evento.id}`);
				evento.caminho = await task.snapshot.ref.getDownloadURL();
				await dbRef.set(evento);
				await eventodDoUsuario.set(evento);
				$("#spinner").remove();
				ativaBotoes();
				if (language == "pt") {

					Notificacao.sucesso("Salvo com sucesso");

				} else {

					objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["saved-with-success"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["saved-with-success"])

				}

				limparCampos();

			}
		);

	}



	static async atualizar(evento, arquivo) {

		if (arquivo == null) {

			if (eventoAntigo.categoria != evento.categoria) {
				const updateObject = {}

				const noAntigo = await rootRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${eventoAntigo.categoria}/${evento.id}`).once("value");

				const auxUsers = await rootRef.child(`eventos-que-estou-inscrito/${evento.pais}`).once("value");

				auxUsers.forEach(auxUser => {
					auxUser.forEach(categoria => {
						if (eventoAntigo.categoria == categoria.key) {
							categoria.forEach(async auxEvento => {

								auxEvento = auxEvento.val();
								if (evento.id == auxEvento.id) {

									updateObject[`eventos-que-estou-inscrito/${evento.pais}/${auxUser.key}/${evento.categoria}/${evento.id}/`] = evento;

								}

							})
						}
					})
				})

				await rootRef.child(`eventos/${evento.pais}/${eventoAntigo.categoria}/${evento.id}`).remove()

				await rootRef.child(`eventos/${evento.pais}/${evento.categoria}/${evento.id}`).set(evento);

				updateObject[`meus-eventos/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`] = evento;
				updateObject[`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`] = noAntigo.val();

				await rootRef.update(updateObject);


			} else {

				await rootRef.child(`eventos/${evento.pais}/${evento.categoria}/${evento.id}`).update(evento);

			}
			$("#spinner").remove();
			ativaBotoes();
			if (language == "pt") {
				Notificacao.sucesso("Atualizado com sucesso!");


			} else {

				objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["updated-with-success"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["updated-with-success"]);
			}
			eventoAntigo = evento;


		} else {

			//SE MUDOU SÓ A CATEGORIA
			if (eventoAntigo.categoria != evento.categoria) {


				//SALVANDO USUÁRIOS QUE ESTAVAM INSCRITO NA CATEGORIA ANTIGA
				const noAntigo = await rootRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${eventoAntigo.categoria}/${evento.id}`).once("value");

				//LISTA PARA CONFERIR QUAIS USUÁRIOS ESTÃO INSCRITOS NO EVENTO
				const auxUsers = await rootRef.child(`eventos-que-estou-inscrito/${evento.pais}`).once("value");


				//ADICIONA NOVA FOTO NO STORAGE BUCKET NA PASTA REFERENTE A NOVA CATEGORIA
				let task = firebase.storage().ref(`eventos/${evento.pais}/${evento.estado}/${evento.cidade}/${evento.idDono}/${evento.id}`).put(arquivo[0]);

				//OBSERVA O ANDAMENTO DO UPLOAD
				task.on("state_changed",
					snapshot => {

						let porcentagem = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
						console.log(porcentagem);
						$("#barra-progresso").val(porcentagem);

					},
					trataErros,
					async () => {

						evento.caminho = await task.snapshot.ref.getDownloadURL();


						//SALVA EVENTO NO BANCO NA NOVA CATEGORIA
						await rootRef.child(`eventos/${evento.pais}/${evento.categoria}/${evento.id}`).set(evento);

						//SALVA EVENTO NA LISTA DE EVENTOS DO USUÁRIO REFERENTE A CATEGORIA MOVA
						updateObject[`meus-eventos/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`] = evento;

						//CRIANDO NOVO NÓ COM OS USUÁRIOS INSCRITOS QUE FORAM TRANSFERIDOS DE UMA CATEGORIA PARA OUTRA
						updateObject[`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}`] = noAntigo.val();

						//ATUALIZANDO O EVENTO E SUA CATEGORIA PARA OS USUÁRIOS INSCRITOS
						auxUsers.forEach(auxUser => {

							auxUser.forEach(categoria => {

								if (eventoAntigo.categoria == categoria.key) {

									categoria.forEach(async auxEvento => {

										auxEvento = auxEvento.val();
										if (evento.id == auxEvento.id) {

											updateObject[`eventos-que-estou-inscrito/${evento.pais}/${auxUser.key}/${evento.categoria}/${evento.id}/`] = evento;

										}

									})
								}
							})
						})

						//REMOVENDO EVENTO NA ANTIGA CATEGORIA
						await rootRef.child(`eventos/${evento.pais}/${eventoAntigo.categoria}/${evento.id}`).remove();
						await rootRef.update(updateObject);
						$("#spinner").remove();
						ativaBotoes();
						if (language == "pt") {
							Notificacao.sucesso("Atualizado com sucesso!");


						} else {
							objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["updated-with-success"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["updated-with-success"]);
						}
						eventoAntigo = evento;


					}
				);



			} else {

				//REFERÊNCIA PARA NOVA FOTO

				const storageRef = firebase.storage().ref(`eventos/${evento.pais}/${evento.estado}/${evento.cidade}/${evento.idDono}/${evento.id}`);

				//ADICIONA NOVA FOTO NO STORAGE BUCKET
				let task = storageRef.put(arquivo[0]);

				//OBSERVA O ANDAMENTO DO UPLOAD
				task.on("state_changed",
					snapshot => {

						let porcentagem = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
						console.log(porcentagem);
						$("#barra-progresso").val(porcentagem);

					},
					trataErros,
					async () => {

						evento.caminho = await task.snapshot.ref.getDownloadURL();
						log(evento, eventoAntigo);
						await rootRef.child(`eventos/${evento.pais}/${evento.categoria}/${evento.id}`).update(evento);
						$("#spinner").remove();
						ativaBotoes();
						if (language == "pt") {
							Notificacao.sucesso("Atualizado com sucesso!");


						} else {
							objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["updated-with-success"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["updated-with-success"]);
						}
						eventoAntigo = evento;
						$("#barra-progresso").val(0);
						$("#input-foto").val("");


					}
				);




			}

		}


	}

	static async excluir(evento) {


		const storageRef = firebase.storage().ref(`eventos/${evento.pais}/${evento.estado}/${evento.cidade}/${evento.idDono}/${evento.id}`);
		try{

			//await storageRef.delete();

			await rootRef.child(`eventos/${evento.pais}/${evento.categoria}/${evento.id}`).remove();

			await rootRef.child(`meus-eventos/${usuario.pais}/${usuario.usuarioId}/${evento.categoria}/${evento.id}`).remove();

			objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["deleted-with-success"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["deleted-with-success"]);

		}catch(error){
			trataErros(error);
			
		}

	}

	static async subscribeToEvent(evento) {

		await rootRef.child(`eventos-que-estou-inscrito/${usuario.pais}/${usuario.usuarioId}/${evento.categoria}/${evento.id}`).set(evento);
		await rootRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}/${usuario.usuarioId}`).set(usuario);

		objLanguage[language] ? Notificacao.sucesso(objLanguage[language]["notifications"]["subscribed"]) : Notificacao.sucesso(objLanguage['en']["notifications"]["subscribed"]);



	}

	static async unsubscribe(evento) {
		log(evento);
		await rootRef.child(`pessoas-inscritas-no-meu-evento/${evento.pais}/${evento.idDono}/${evento.categoria}/${evento.id}/${usuario.usuarioId}`).remove();
		await rootRef.child(`eventos-que-estou-inscrito/${usuario.pais}/${usuario.usuarioId}/${evento.categoria}/${evento.id}`).remove();
	}


	static async removeEventosAntigos() {
		try {
			const eventos = await rootRef.child("eventos").once("value");
			eventos.forEach(pais => {
				pais.forEach(categorias => {
					categorias.forEach(evento => {
						const auxEvento = evento.val();
						const dataHoje = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
						if (dataHoje > evento.val().dataTimestamp) {
							rootRef.child("eventos/Brazil/" + evento.val().categoria + "/" + evento.val().id).remove()
								.then(() => Notificacao.sucesso(+auxEvento.titulo + "excluído com sucesso!"));
						}
					})
				})
			});
		} catch (erro) {
			console.log(erro);
		}
	}
	static async listarAdmin(usuario) {


		var eventosPraMostrar = [];
		const categorias = await rootRef.child(`meus-eventos/${usuario.pais}/${usuario.usuarioId}`).once("value");
		if (categorias.val()) {


			categorias.forEach(eventos => {
				eventos.forEach(evento => {
					evento = evento.val();

					eventosPraMostrar.push(evento);

				})
			})



		} else {

			$("#img-loading").removeClass("mx-auto, d-block");
			$("#img-loading").css("display", "none");

			$(".container").append("<img src='img/not found.png' class='img-fluid mx-auto d-block animated fadeIn not-found'>");

			
			if (objLanguage[language]) {
				Notificacao.alerta(objLanguage[language]["notifications"]["you-dont-have-events"])
				$(".container").append(`<h5 class='text-center animated fadeInDown'>${objLanguage[language]["notifications"]["you-dont-have-events"]}</h5>`);
			} else {
				Notificacao.alerta(objLanguage['en']["notifications"]["you-dont-have-events"])
				$(".container").append(`<h5 class='text-center animated fadeInDown'>${objLanguage["en"]["notifications"]["you-dont-have-events"]}</h5>`);
			}

		}

		return eventosPraMostrar;



	}

	static embaralhar(array) {

		var indice_atual = array.length, valor_temporario, indice_aleatorio;

		while (indice_atual > 0) {

			indice_aleatorio = Math.floor(Math.random() * indice_atual);
			indice_atual -= 1;

			valor_temporario = array[indice_atual];
			array[indice_atual] = array[indice_aleatorio];
			array[indice_aleatorio] = valor_temporario;
		}

		return array;
	}




	static async listar(usuario) {
		try {
			let eventos = [];
			let arrayPromises = [];
			let categorias = [];

			//CRIO UM ARRAY DE PROMISSES COM TODOS OS GOSTOS DO USUÁRIO
			usuario.gostos.forEach(gosto => {
				arrayPromises.push(rootRef.child(`eventos/${usuario.pais}/${gosto}`).once("value"));
			})

			//O ARRAY DE PROMISSES RETORNA UM ARRAY DE CATEGORIAS QUE CONTEM TODOS OS EVENTOS QUE INTERESSA O USUÁRIO
			categorias = await Promise.all(arrayPromises);

			//CADA CATEGORIA POSSUI UMA OBJETO DE OBJETOS
			categorias.forEach(objEventos => {

				//OBJ EVENTOS É O OBJETO DE OBJETOS, E PARA ACESSAR CADA OBJETO SEPARADAMENTE PRECISA PERCORRER DENTRO DO FOREACH
				objEventos.forEach(evento => {

					//ADICIONA EVENTO NA LISTA PARA MOSTRAR PARA O USUÁRIO
					eventos.push(evento.val());
				})
			})


			//CASO EVENTOS ESTEJA VÁZIO, MOSTRA MENSAGEM DE NENHUM EVENTO DISPONÍVEL, SE NÃO EMBRARALHA OS EVENTOS
			eventos.length == 0 ? noEventsFound() : eventos = EventoDAO.embaralhar(eventos);

			return eventos;
		} catch (error) {

			trataErros(error);
		}


	}

	static async eventosInscritos(user) {

		let listaEventos = [];
		let dbRef = rootRef.child(`eventos-que-estou-inscrito/${usuario.pais}/${usuario.usuarioId}`);

		try {


			let categorias = await dbRef.once("value");
			if (categorias.val()) {
				escondeLoading();
				categorias.forEach(eventos => {

					eventos.forEach(auxEvento => {

						auxEvento = auxEvento.val();

						criaCardEventoInscrito(auxEvento);

					});


				});
			} else {
				escondeLoading();
				if (language == "pt") {
					$(".container").append("<img src='img/not found.png' class='img-fluid mx-auto d-block not-found' style='max-width:320px;'>");
					$(".container").append("<h5 data-key='noSubscribed' class='translate text-center animated fadeInDown'>Você não está inscrito em nenhum evento.</h5>")

				} else {
					if (objLanguage[language]) {
						$(".container").append("<img src='img/not found.png' class='img-fluid mx-auto d-block not-found' style='max-width:320px;'>");
						$(".container").append(`<h5  class='translate text-center animated fadeInDown'>${objLanguage[language]["events-subscribed-page"]["0-subscribed"]}</h5>`)

					} else {
						$(".container").append("<img src='img/not found.png' class='img-fluid mx-auto d-block not-found' style='max-width:320px;'>");
						$(".container").append(`<h5  class='translate text-center animated fadeInDown'>${objLanguage['en']["events-subscribed-page"]["0-subscribed"]}</h5>`)
					}

				}


			}


		} catch (erro) {
			console.log(erro);
			if (erro == "Error: permission_denied at /pessoas-inscritas-no-meu-evento: Client doesn't have permission to access the desired data.") {

				Notificacao.erro(" Você não tem permissão para acessar o banco de dados.");
			} else {

				Notificacao.erro(erro);

			}
		}


	}

	static async voluntariosInscritos(categoria, evento) {
		const dbRef = rootRef.child(`pessoas-inscritas-no-meu-evento/${usuario.pais}/${usuario.usuarioId}/${categoria}/${evento}`);
		let tabela = "";
		const users = await dbRef.once("value");
		console.log(users.val());
		/*SE USERS FOR NULL, ENTÃO NINGUEM SE INSCREVEU*/
		if (!users.val()) {
			escondeLoading();
			$(".container").append("<img src='img/0 voluntários.png' class='img-fluid mx-auto mt-3 d-block animated fadeIn not-found'>");

			if (language == "pt") {
				$(".container").append("<h5 data-key='noVolunteer' class='translate text-center animated fadeInDown'>Você ainda não possui nenhum voluntário.</h5>");

			} else {
				if (objLanguage[language]) {

					$(".container").append(`<h5 class='text-center animated fadeInDown'>${objLanguage[language]["notifications"]["no-volunteers"]}</h5>`);

				} else {
					$(".container").append(`<h5 class='text-center animated fadeInDown'>${objLanguage['en']["notifications"]["no-volunteers"]}</h5>`);
				}

			}

		} else {
			users.forEach(user => {


				tabela += "<tr>"
					+ "<td><input class='checkbox-user' type='checkbox' value=" + user.val().email + "></td>"
					+ "<td><img src='" + user.val().caminho + "' class='img-fluid rounded-circle' style='max-width:40px'></td>"
					+ "<td>" + user.val().nome + "</td>"
					+ "<td><button data-toggle='modal' data-target='#myModal' value='" + user.val().email + "' class='btn btn-primary text-uppercase font-weight-bold btn-enviar-email-user'><span class='fas fa-envelope'></span> <span class='translate' data-page='my-volunteers' data-key='btn-send-email'>Enviar email</span> </button></td>"
					+ "</tr>";

				$(".table").append(tabela);
				escondeLoading();
				$(".table").removeAttr("hidden");
				tabela = "";

			});
		}


	}

	static async listaPorCategoria(categoria) {
		escondeEventoNotFound();
		$("." + icones.buscaAtual).fadeOut();
		console.log("busca que estava sendo mostrada", icones.buscaAtual);
		icones.buscaAtual = categoria;
		//TRAZENDO TODOS OS EVENTOS DO BANCO
		console.log("busca que está sendo mostrada", icones.buscaAtual);

		var ref = rootRef.child(`eventos/${usuario.pais}/${categoria}`);

		const eventos = await ref.once("value");

		//ADICIONO NO MEU OBJETO ICONES QUE ESSA CATEGORIA FOI PESQUISADA
		icones[categoria] = 1;

		//CASO EXISTA ALGUM EVENTO ENCONTRADO ESCONDE A LISTA ATUAL
		if (eventos.val()) {

			//ESCONDE A LISTA ATUAL


			eventos.forEach(auxEvento => {


				const evento = auxEvento.val();

				(async function () {

					escondeLoading();

					const refUserEvento = rootRef.child(`pessoas-inscritas-no-meu-evento/${usuario.pais}/${evento.idDono}/${evento.categoria}/${evento.id}/${usuario.usuarioId}`);
					const inscrito = await refUserEvento.once("value");
					//CRIO UMA LISTA NOVA DEFINIDO 
					criaLista(evento, categoria, inscrito.val());
					defineLanguage();


				})();


			})
			defineLanguage();

		} else {
			escondeLoading();
			noEventsFound();

		}
	}

	static async listaPorLocalizacao(dados) {
		escondeEventoNotFound()

		let response = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + dados.coords.latitude + "&lon=" + dados.coords.longitude)
		dados = await response.json();

		if (!dados.address.city) {
			dados.address.city = dados.address.town;

		}
		if (dados.address.city.match(/Sudoeste/i)) {
			dados.address.city = "Brasília";
		}
		log(dados.address.city)
		$("." + icones.buscaAtual).fadeOut();

		const ref = rootRef.child("eventos/" + usuario.pais);
		//const ref = rootRef.child("eventos/"+usuario.pais+"/Brasília");
		const categorias = await ref.once("value");
		let existe = 0;
		icones.cidade = 1;
		if (categorias.val()) {

			categorias.forEach(eventos => {
				eventos.forEach(auxEvento => {
					if (auxEvento.val().cidade == dados.address.city) {
						existe = 1;

						const evento = auxEvento.val();

						(async function () {
							escondeLoading();

							const refUserEvento = rootRef.child(`pessoas-inscritas-no-meu-evento/${usuario.pais}/${evento.idDono}/${evento.categoria}/${evento.id}/${usuario.usuarioId}`);
							const inscrito = await refUserEvento.once("value");

							//CRIO UMA LISTA NOVA DEFINIDO 
							criaLista(evento, "cidade", inscrito.val());
							defineLanguage()

						})();

					}
				})

			});

			defineLanguage();
			if (navigator.language.split("-").shift() == "en") {
				$(".btn-success").css("padding", "30px 30px");
				$(".btn-primary").css("padding", "30px 8px");
			}

		}

		if (existe == 0) {

			escondeLoading();
			noEventsFound();
		}


	}

	static async buscaEventoPorPalavra(categoria, palavra) {

		let auxPalavra = ".*" + palavra + ".*";
		let re = new RegExp(auxPalavra, "gi");

		let eventos = await rootRef.child(`eventos/${usuario.pais}/${categoria}`).once("value");
		let existe = 0;
		eventos.forEach(auxEvento => {

			const evento = auxEvento.val();


			if (evento.tags.match(re) || evento.titulo.match(re)) {

				escondeLoading();

				(async function () {
					const refUserEvento = rootRef.child("pessoas-inscritas-no-meu-evento/" + usuario.pais + "/" + evento.categoria + "/" + evento.id + "/" + usuario.usuarioId);
					const inscrito = await refUserEvento.once("value");
					criaLista(evento, "eventos-buscados", inscrito.val());

				})()

				existe = 1;
			}

		})


		if (existe == 0) {
			escondeLoading();
			if (language == "pt") {
				$(".container").append("<img id='notFound' src='img/not found.png' class='img-fluid mx-auto d-block not-found'>");
				$(".container").append("<h5 id='notFoundMessage' data-key='eventNotFound' class='translate text-center animated fadeInDown'>Desculpe mas não encotramos nenhum evento relacionado a sua busca.");

			} else {
				if (objLanguage[language]) {
					$(".container").append("<img id='notFound' src='img/not found.png' class='img-fluid mx-auto d-block not-found'>");
					$(".container").append(`<h5 id='notFoundMessage' class='text-center animated fadeInDown'>${objLanguage[language]["notifications"]["no-events-found"]}`);
				} else {
					$(".container").append("<img id='notFound' src='img/not found.png' class='img-fluid mx-auto d-block not-found'>");
					$(".container").append(`<h5 id='notFoundMessage' class='text-center animated fadeInDown'>${objLanguage['en']["notifications"]["no-events-found"]}`);

				}


			}

		}

	}

	static async listaPorId(pagina) {
		const url = decodeURI(location.search);

		const auxUrl = url.split("&");
		const idEvento = auxUrl[0].slice(4);
		const categoria = auxUrl[1].split("=").pop();
		const pais = auxUrl[2].split("=").pop();
		let card = "";

		if (pagina) {

			$("div.container").attr("hidden", "hidden");
			$("#img-loading").css("display", "block");



			// TRAZENDO EVENTO DO BANCO COM O ID DA URL
			try {
				let snapshot = await rootRef.child(`eventos/${pais}/${categoria}/${idEvento}`).once("value");

				snapshot = snapshot.val();

				log(snapshot);
				$("#img-loading").removeClass("mx-auto, d-block");
				$("#img-loading").css("display", "none");
				$("fieldset").removeAttr("hidden");

				//SETANDO VALORES DO EVENTO NOS INPUT
				$("#input-id").val(snapshot.id);
				$("#input-titulo").val(snapshot.titulo);
				$("#input-descricao").val(snapshot.descricao);
				$("#input-horario").val(snapshot.horario);
				$("#input-cidade").val(snapshot.cidade + "-" + snapshot.estado);
				$("#input-numero").val(snapshot.numero);
				$("#input-rua").val(snapshot.rua);
				$("#input-cep").val(snapshot.cep);
				$('#input-tags').importTags(snapshot.tags);
				$("#input-pais").val(snapshot.pais);

				$("#input-data").val(snapshot.data);
				$("#input-foto").data("foto", snapshot.id);
				$("#input-caminho").val(snapshot.caminho);
				$("div.container").removeAttr("hidden");

				eventoAntigo.cidade = snapshot.cidade;
				eventoAntigo.estado = snapshot.estado;
				eventoAntigo.categoria = snapshot.categoria;

			} catch (erro) {

				console.log(erro);
				Notificacao.erro(erro);

			}




		} else {

			try {

				let descricao = ""
				let endereco = "";
				let evento = await rootRef.child(`eventos/${pais}/${categoria}/${idEvento}`).once("value");

				evento = evento.val();

				const inscrito = await rootRef.child(`pessoas-inscritas-no-meu-evento/${pais}/${evento.idDono}/${categoria}/${idEvento}/${usuario.usuarioId}`).once("value");

				let auxData = evento.data.split("-");

				const data = new Date(auxData[0], auxData[1], auxData[2]).toLocaleDateString();

				let botaoInscrito = "";

				let url = encodeURIComponent(`https://apptcc-6f556.firebaseapp.com/evento?id=${evento.id}&categoria=${evento.categoria}&pais=${evento.pais}&cidade=${evento.cidade}`);

				if (inscrito.val()) {

					botaoInscrito = `<button id='${evento.id}' data-estado='${evento.estado}' data-cidade='${evento.cidade}' data-pais='${evento.pais}' 
					data-dono='${evento.idDono}' data-titulo='${evento.titulo}' data-caminho='${evento.caminho}' data-categoria='${evento.categoria}'
					value='${evento.id}' class='btn btn-subscribe btn-danger text-uppercase font-weight-bold'>
						<p> <span class='fas fa-user-times'></span> <span class='translate' data-key='unsubscribe' data-page='event-page'>Cancelar inscrição</span> </p>
					</button>`;

				} else {

					botaoInscrito = `<button id='${evento.id}' data-estado='${evento.estado}' data-cidade='${evento.cidade}' data-pais='${evento.pais}' data-dono='${evento.idDono}' 
					data-titulo='${evento.titulo}' data-caminho='${evento.caminho}' data-categoria='${evento.categoria}' value='${evento.id}'
					 
					class='btn btn-success text-uppercase font-weight-bold btn-subscribe'>
						<p> <span class='fas fa-user-plus'> <span class='translate' data-key='subscribe' data-page='event-page'>Me inscrever</span> </span></p>
					</button>`;

				}

				endereco = `<p class='card-text'><span class='fas fa-map-marker-alt' style='color:red'></span> ${evento.cidade}-${evento.estado}</p>`;
				endereco += `<p class='card-text'><span class='fas fa-building style='color:red'></span> ${evento.rua}, Nº${evento.numero}, ${evento.cep}</p>`;
				endereco += `<p class='card-text'><span class='fas fa-clock' style='color:red'></span> ${evento.horario}</p>`;
				endereco += `<p class='card-text'><span class='fas fa-calendar' style='color:red'></span> ${data}</p>`;

				card = `<div class='mb-5 col-sm-12 col-lg-6 col-xl-6'>
							<div class='card z-depth-2'>
								<img src='${evento.caminho}' class='card-img-top'>
								<div class='card-body'>
									<h4 class='card-title'>${evento.titulo}</h4>
									${endereco}
									<p class='card-text'>${evento.descricao}</p>
									<div class='row'>
										<div class='col-6'>
											${botaoInscrito}
										</div>
										
										<div class='col-6'>
											<a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${url}" >
												<button  class='btn btn-primary btn-compartilhar text-uppercase font-weight-bold'>
													 <span class='fab fa-facebook-f'></span> <span class='translate' data-page='event-page' data-key='btn-share'>Compartilhar</span>
												</button>
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>`;

				let mapa = `<div id='mapa' class='mb-5 col-lg-6 col-xl-6 z-depth-2 mapa' style='height:600px;'></div>`;

				const response = await fetch(`https://nominatim.openstreetmap.org/search?limit=1&country=${evento.pais}&city=${evento.cidade}&format=json`)

				const dados = await response.json()


				$(".row-evento").append(card);
				$(".row-evento").append(mapa);

				const myMap = L.map("mapa").setView([dados[0].lat, dados[0].lon], 30);

				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', { foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(myMap);

				L.marker([dados[0].lat, dados[0].lon], { title: "Local do voluntário" }).addTo(myMap).bindPopup('Local do voluntário').openPopup();;

				defineLanguage();


				$("#img-loading").removeClass("mx-auto, d-block");
				$("#img-loading").css("display", "none");


				return new Promise((resolve, reject) => resolve("resolvido"));

			} catch (erro) {
				console.log(erro);
				Notificacao.erro(erro);
			}






		}

	}






}