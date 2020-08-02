//TRUE PARA DIZER QUE O USUÁRIO ESTAR NA PÁGINA BEM-VINDO
isLogged(true);
let url = location.search;
$(document).ready(async function () {


	$(".form-check").attr("hidden", "hidden");
	$(".btn-cadastro").addClass("animated fadeIn delay-3s")


	await defineLanguage();

	//COLOCANDO O NOME DO USUÁRIO NA DIV DE SAUDAÇÕES E ESCODENDO A IMAGEM DE LOADING

	$("#saudacoes").prepend("<h3>" + localStorage.nome + "</h3> ");
	escondeLoading();


	//MOSTRANDO A DIV DE SAUDAÇÕES
	$("#saudacoes").removeAttr("hidden");
	$("#saudacoes").addClass("animated fadeInDown");

	const qtdIcones = numeroDeIcones();
	animacaoIcones(qtdIcones);

	/*const platform = navigator.platform;
	Notificacao.alerta(platform)
	platform.toLowerCase()=="iphone"?log("USANDO IPHONE"):permissaoNotificacao();*/

	//EVENTO QUE MARCA TODOS OS CHECKBOX
	$("#selecionarTodos").click(function () { $("input:checkbox").prop("checked", $(this).prop("checked")) });

	$("input:checkbox[name='gostos[]']").click(() => {

		if ($("#selecionarTodos").prop("checked")) {
			$("#selecionarTodos").prop("checked", false);
		}

	});

	firebase.auth().onAuthStateChanged(user => {

		$(".btn-permissoes").addClass("animated fadeIn ");

		$("#btn-salvar").on("click", function () {

			//CASO NÃO TENHA SELECIONADO NENHUM, ALERTA DE SELECIONE PELO MENOS UM
			if (!ischecked()) {


				objLanguage[language] ? Notificacao.alerta(objLanguage[language]["notifications"]["select-category"]) : Notificacao.alerta(objLanguage['en']["notifications"]["select-category"]);

			} else {

				usuario.nome = user.displayName;
				usuario.caminho = user.photoURL;
				usuario.email = user.email;
				usuario.numero = user.phoneNumber;
				usuario.usuarioId = user.uid;

				$("#myModal").modal("toggle")

			}

		});
	});


})


//FUNCÃO VERIFICA QUANTAS CATEGORIAS O USUÁRIO MARCOU
function ischecked() {

	//VERIFICO QUANTOS ÍCONES O USUÁRIO SELECIONOU
	let qtdSelecionado = 0;
	$("input:checkbox[name='gostos[]']").each(function () {
		if ($(this).prop("checked")) {
			qtdSelecionado++;

		}
	});

	//USUÁRIO NÃO MARCOU NENHUM
	if (qtdSelecionado == 0) {
		return false
	} else {
		return true
	};





}



function permissaoNotificacao() {
	const messaging = firebase.messaging();
	messaging.usePublicVapidKey("BEAm9RxTxeYgIs_QFYfc1hpAW6qfv-0AMbxE71NhQvAWKU2VCOxzA6MlgO3PGOjKEDXP8xbkDyLMIGVFJZtuEUA");

	messaging.requestPermission()
		.then(() => {
			console.log("permissao");
			Notificacao.info("permissao")
			return messaging.getToken();
		})
		.then(token => {
			usuario.token = token;
			Notificacao.info(token)
			console.log(token);
		})
		.catch(erro => {
			console.log(erro);
			Notificacao.alerta("Você não será capaz de receber novas atualizações sobre eventos que possam lhe interessar.");
		});

}


function pegaPaisUser() {
	$("#myModal").modal("toggle");
	$("#img-loading").css("display", "block");
	if (navigator.geolocation) {

		navigator.geolocation.getCurrentPosition(addPaisToUser, localizacaoNegada);

	} else {

		objLanguage[language] ? Notificacao.alerta(objLanguage[language]["notifications"]["no-geolocation-support"]) : Notificacao.alerta(objLanguage[language]["en"]["no-geolocation-support"]);

	}

}

async function addPaisToUser(valores) {

	try {
		let response = await fetch("https://nominatim.openstreetmap.org/reverse?accept-language=en&format=json&lat=" + valores.coords.latitude + "&lon=" + valores.coords.longitude)
		let dados = await response.json();

		const status = Object.keys(dados);

		if (status == "error") {

			objLanguage[language] ? Notificacao.erro(objLanguage[language]["notifications"]["error-get-location"]) : Notificacao.erro(objLanguage[language]["en"]["error-get-location"]);

		} else {

			if (!dados.address.city) {

				dados.address.city = dados.address.town;

			}

			dados.address.city = dados.address.city.replace("/", "-");
			usuario.pais = dados.address.country;
			usuario.estado = dados.address.state;
			usuario.cidade = dados.address.city;
			//Notificacao.info(dados.address.cidade);
			$("#img-loading").css("display", "block");

			salvarUser(usuario, url);

		}


	} catch (error) {

		console.log(error);
		objLanguage[language] ? Notificacao.erro(objLanguage[language]["notifications"]["location-error"]) : Notificacao.erro(objLanguage[language]["en"]["location-error"]);

	}

}

function localizacaoNegada(erro) {

	objLanguage[language] ? Notificacao.alerta(objLanguage[language]["notifications"]["location-allowed-but-there-was-error"]) : Notificacao.alerta(objLanguage['en']["notifications"]["location-allowed-but-there-was-error"]);

	$("#myModal").modal("toggle");
	$("#btn-salvar").attr("disabled", true);
}
