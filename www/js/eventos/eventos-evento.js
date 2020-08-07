
$(document).ready(async function () {

	try {
		const ui = new firebaseui.auth.AuthUI(firebase.auth());

		// The start method will wait until the DOM is loaded.
		ui.start('.modal-body', uiConfig);


		const url = location.search;



		await EventoDAO.listaPorId();
		defineLanguage();
		if (language == "en") {
			$(".btn-success").css({
				"padding-left": "25px",
				"padding-right": "25px"
			})
		}

		$(".container").on("click", ".btn-subscribe", async function () {
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


			//IF TERNÁRIO QUE VERIFICA SE O BOTÃO CLICADO TEM A CLASS BTN-DANGER SE TIVER SIGNIFICA QUE USER QUER CANCELAR INSCRICAO
			//CASO CONTRÁRIO USER QUER SE INSCREVER
			if (!localStorage.user) {
				$("#myModal").modal();


			} else if (usuario.pais != evento.pais) {
				
				objLanguage[language] ? Notificacao.alerta(objLanguage[language]["notifications"]["not-allowed-to-subscribe"]) : Notificacao.alerta(objLanguage["en"]["notifications"]["not-allowed-to-subscribe"]);
				

			} else {


				//IF TERNÁRIO QUE VERIFICA SE O BOTÃO CLICADO TEM A CLASS BTN-DANGER SE TIVER SIGNIFICA QUE USER QUER CANCELAR INSCRICAO
				//CASO CONTRÁRIO USER QUER SE INSCREVER
				if ($(this).hasClass("btn-danger")) {

					await EventoDAO.unsubscribe(evento);
					$(this).removeClass("btn-danger");
					$(this).addClass("btn-success");
					
					objLanguage[language] ? $(this).html(objLanguage[language]["subscribed"]["subscribe"]) : $(this).html(objLanguage[language]["subscribed"]["subscribe"]);
						

				} else {

					await EventoDAO.subscribeToEvent(evento);
					$(this).addClass("btn-danger");
					$(this).removeClass("btn-success");
					
					objLanguage[language] ? $(this).html(objLanguage[language]["subscribed"]["unsubscribe"]) : $(this).html(objLanguage['en']["subscribed"]["unsubscribe"]);


				}
			}


		});





		firebase.auth().onAuthStateChanged(async user => {
			if (user) {

				$(".firebaseui-container").css("display", "none");

				ref = firebase.database().ref("usuarios").child(user.uid);

				const dados = await ref.once("value")

				if (dados.val()) {
					if (!localStorage.entrou) {

						//Notificacao.sucesso(`Bem vindo ${dados.val().nome}`);
						localStorage.entrou = true;

					}
					//SALVO DADOS DO USUÁRIO EM OBJETO NO LOCAL STORAGE
					localStorage.user = JSON.stringify(dados.val());
					usuario = JSON.parse(localStorage.user);

					//SE NÃO, VAI PARA TELA DE BEM VINDO PARA FINALIZAR CADASTRO
				} else {
					localStorage.uid = user.uid;
					localStorage.nome = user.displayName;
					location.replace(`bemvindo?id=${idEvento}&categoria=${categoria}&pais=${pais}`);

				}

			}
		});



	} catch (erro) {
		console.log(erro);
		Notificacao.erro(erro);
	}


});



const uiConfig = {

	signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
	// tosUrl and privacyPolicyUrl accept either url string or a callback function.
	// Terms of service url/callback.
	tosUrl: '<your-tos-url>',
	// Privacy policy url/callback.
	privacyPolicyUrl: function () {
		window.location.assign('<your-privacy-policy-url>');
	}
};