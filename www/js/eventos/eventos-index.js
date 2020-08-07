//PRIMEIRO PARÂMETRO REFERENTE A PÁGINA BEM VINDO E SEGUNDO REFERENTE A INDEX 
isLogged(null, true);

$(document).ready(function () {
	defineLanguage();

	if(localStorage.clicou=="true"){
		
		$("#myModal").modal("toggle");

	}
	
	$("head").append(`<script src="js/firebase/firebase-ui-auth__${language}.js"></script>`);
	
	// Initialize the FirebaseUI Widget using Firebase.
	const ui = new firebaseui.auth.AuthUI(firebase.auth());

	// The start method will wait until the DOM is loaded.
	ui.start('.modal-body', uiConfig);

	firebase.auth().onAuthStateChanged(async user => {

		if (user) {
			

			ref = firebase.database().ref("usuarios").child(user.uid);

			const dados = await ref.once("value")

			//SE EXISTE DADO, USUÁRIO JÁ CADASTRO, VAI PARA TELA PRINCIPAL
			if (dados.val()) {

				//SALVO DADOS DO USUÁRIO EM OBJETO NO LOCAL STORAGE
				localStorage.user = JSON.stringify(dados.val());
				location.replace("menu.html");

				//SE NÃO, VAI PARA TELA DE BEM VINDO PARA FINALIZAR CADASTRO
			} else {
				localStorage.uid = user.uid;
				localStorage.nome = user.displayName;
				location.replace("bemvindo.html");

			}

		}
	});

	$(".btn-success").click(evento => {
		localStorage.clicou = true;
		$(evento.target).css("background", "#6FD6A2")
	})

	$(".btn-primary").click(function (e) { 
		localStorage.clicou = false;
	});

	

});

const uiConfig = {

	signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
	signInFlow:"redirect",
	// tosUrl and privacyPolicyUrl accept either url string or a callback function.
	// Terms of service url/callback.
	tosUrl: '<your-tos-url>',
	// Privacy policy url/callback.
	privacyPolicyUrl: function () {
		window.location.assign('<your-privacy-policy-url>');
	}
};