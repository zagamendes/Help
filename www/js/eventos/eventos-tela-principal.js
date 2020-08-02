isLogged();




$(document).ready(function () {

	screen.width <= 500 ? $(".indicadores").addClass("d-none") : log("usando pc/tablet");


	defineLanguage();

	/*const messaging =firebase.messaging();
	messaging.usePublicVapidKey("BEAm9RxTxeYgIs_QFYfc1hpAW6qfv-0AMbxE71NhQvAWKU2VCOxzA6MlgO3PGOjKEDXP8xbkDyLMIGVFJZtuEUA");


	messaging.onTokenRefresh(() =>{

		messaging.getToken()
		.then(novoToken => {

			UsuarioDAO.atualizaToken(usuario.usuarioId,novoToken);
		})
		.catch(erro => {
			console.log(erro);
		});
	})*/

	$("form").submit(e => {

		e.preventDefault();

		enviaEmail();

	})


});




function enviaEmail() {

	const objEmail = {

		Host: "smtp.gmail.com",
		Username: "suportehelp.brasil@gmail.com",
		Password: "91236233",
		To: "suportehelp.brasil@gmail.com",
		From: usuario.email,
		Subject: $("#input-assunto").val(),
		Body: "<strong>Mensagem:</strong>" + $("#input-mensagem").val() + "<br><strong>user id:</strong>" + usuario.usuarioId
	}
	log(usuario.email);
	$("#btn-enviar").prepend(addSpinner());
	$("#btn-enviar").attr("disabled", "disabled");
	Email.send(objEmail)
		.then(() => {

			Notificacao.sucesso(objLanguage[language]["notifications"]["sent-with-success"])

			removeSpinner();

			$("#myModal").modal("toggle");
			$("#btn-enviar").removeAttr("disabled");
			$("#input-mensagem").val("");
			$("#input-assunto").val("");
		})
		.catch(erro => {
			Notificacao.erro()
			console.log(erro);
		});

}