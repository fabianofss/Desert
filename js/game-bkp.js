var game = new Phaser.Game(1200, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update });

function preload(){
    game.load.image('player', 'assets/sprites/MS5-rumijet.gif');
	game.load.image('invader', 'assets/sprites/heligun.gif');
    game.load.image('star', 'assets/objetos/star2.png');
	game.load.image('starG', 'assets/objetos/star3.png');
	game.load.spritesheet('bala-fogo', 'assets/objetos/Arme_Bola_de_fogo.png', 128, 25, 5);
	game.load.spritesheet('kaboom', 'assets/objetos/explode.png', 128, 128);
}

var stars, starsG;
var player, aliens;
var cursors;
var fireButton;
var tiro, explosions;

function create(){
	game.physics.startSystem(Phaser.Physics.ARCADE);

	popula_estrelas();

	cria_jogador();

	cria_inimigos();

	config_tiros();
	
	game.physics.enable(tiro, Phaser.Physics.ARCADE);
	game.physics.enable(player, Phaser.Physics.ARCADE);
	game.physics.enable(aliens, Phaser.Physics.ARCADE);	

    // An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);	

	// Pega acoes do teclado
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);	
}

function update(){
	// Comandos do jogador
	comandos();
	
	//  Run collision
	game.physics.arcade.collide(player, aliens, collisionHandler);
    game.physics.arcade.collide(tiro, aliens, collisionHandler);
	//game.physics.arcade.overlap(tiro, aliens, collisionHandler, null, this);
	//game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);	
}

function cria_jogador(){
	// cria jogador
    player = game.add.sprite(100, 100, 'player');
    player.anchor.x = 0.5;

    // a camera deve seguir o jogador
	game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1);
	game.physics.enable(player, Phaser.Physics.ARCADE);	
}

function collisionHandler(bullet, alien){

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();
    
    //  Increase the score
    //score += 20;
    //scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);
/*
    if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }*/

}

function comandos(){
	if (fireButton.isDown){
		tiro.fire();
	}
	
	// Para frente e para traz
    if (cursors.left.isDown){
		if (player.x > 0){
			player.x -= 8;
			player.scale.x = -1;
		}
    }
    else if (cursors.right.isDown){
		//if (player.x < 1600){
			player.x += 8;
			player.scale.x = 1;
		//}
    }
	//Para cima e para baixo
    if (cursors.up.isDown){
		if (player.y > 0){
			player.y -= 8;
		}
    }
    else if (cursors.down.isDown){
		if (player.y < 500){
			player.y += 8;
		}
    }	
}

function cria_inimigos(){
	//  Grupo de inimigos
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;	

	// Definindo area do mapa
    game.world.setBounds(0, 0, 800*8, 600);

	// Colocat 30 inimigos em pontos aleatorios do mapa
    for (var i = 0; i < 30; i++){
        var alien = aliens.create(game.world.randomX, game.world.randomY, 'invader');
		alien.anchor.setTo(0.5, 0.5);
	}
	/*
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
		    alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
			alien.body.moves = false;
        }
    }
	
    aliens.x = 100;
    aliens.y = 50;
*/
    // Tudo isso faz �, basicamente, colocar os atacantes em movimento.
	// Observe que n�s estamos movendo o grupo a que pertencem, em vez de os invasores diretamente.
    var tween = game.add.tween(aliens).to( { y: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
	
}

function setupInvader(invader){
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
}

function config_tiros(){
    // Cria carga de 120 tiros por vez, usando o 'bala-fogo' como grafico
    tiro = game.add.weapon(120, 'bala-fogo');
	// A velocidade � qual a bala � disparado
    tiro.bulletSpeed = 600;
    // Velocidade da taxa de disparo, permitindo-lhes para atirar uma bala a cada 60 ms
    tiro.fireRate = 100;
	// Adicionando fisica as balas
	tiro.physicsBodyType = Phaser.Physics.ARCADE;
    // A bala ser� morta automaticamente quando ele deixa os limites do mapa
    tiro.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    // A bala ser� morta automaticamente quando o tempo de vida passar de 2000ms
    tiro.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    tiro.bulletLifespan = 2000;	
	// As balas v�o mudar dire��o ao chegar no limite do mapa
    tiro.bulletWorldWrap = true;	
    // Diga a arma para acompanhar o Sprite 'jogador'
    // Mas o argumento 'true' conta a arma para controlar a rota��o do sprite
    tiro.trackSprite(player, 0, 40, true);
	
	//tiro.enableBody = true;
}

function descend(){
    aliens.x += 10;
}

function popula_estrelas(){
	//Torna as estrelas aleatorias
    stars = game.add.group();

    game.world.setBounds(0, 0, 800*8, 600);

    for (var i = 0; i < 128; i++){
        stars.create(game.world.randomX, game.world.randomY, 'star');
	}
	
	//Torna as estrelas aleatorias
    starsG = game.add.group();

    game.world.setBounds(0, 0, 800*8, 600);

    for (var i = 0; i < 128; i++){
        starsG.create(game.world.randomX, game.world.randomY, 'starG');
	}	
}

function render() {
    tiro.debug();
}