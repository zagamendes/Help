$(document).ready(async function () {
	defineLanguage()
	try {

		await EventoDAO.eventosInscritos(usuario);
		defineLanguage()


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

			if ($(this).hasClass("btn-danger")) {
				await EventoDAO.unsubscribe(evento);

				$(this).removeClass("btn-danger");
				$(this).addClass("btn-success");

				$(this).html(objLanguage[language]["subscribed"]["subscribe"]);

			} else {
				log(evento);
				await EventoDAO.subscribeToEvent(evento);
				$(this).removeClass("btn-success");
				$(this).addClass("btn-danger");

				$(this).html(objLanguage[language]["subscribed"]["unsubscribe"]);


			}

		});
	} catch (erro) {

		console.log(erro);
	}

});