import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, NORMAL_SPEED, SHOOT_RATE, MAX_HEALTH, INVULNERABLE_DURATION, RESPAWN_INVULNERABLE } from '../config/constants';
import { DIMENSION_ORDER } from '../config/dimensions';
import { GameData } from '../config/types';
import { Player } from '../entities/Player';
import { ChasingEnemy } from '../entities/ChasingEnemy';
import { PowerUp } from '../entities/PowerUp';
import { StageHazard } from '../entities/StageHazard';
import { DamageTrap } from '../entities/DamageTrap';
import { IceShooter } from '../weapons/IceShooter';
import { FireShooter } from '../weapons/FireShooter';
import { GiantSword } from '../weapons/GiantSword';
import { BigBomb } from '../weapons/BigBomb';
import { Weapon } from '../weapons/Weapon';

export class CollectionScene extends Phaser.Scene {
  private player1!: Player;
  private player2?: Player;
  private gameData!: GameData;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private shootKey!: Phaser.Input.Keyboard.Key;
  private tabKey!: Phaser.Input.Keyboard.Key;

  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private powerUpGroup!: Phaser.Physics.Arcade.Group;
  private hazardGroup!: Phaser.Physics.Arcade.StaticGroup;
  private trapGroup!: Phaser.Physics.Arcade.Group;

  private invulnerableUntil: number = 0;
  private shieldUntil: number = 0;
  private speedBoostUntil: number = 0;
  private lastShotTime: number = 0;
  private collected: number = 0;
  private requiredCollect: number = 10;
  private p1WeaponIndex: number = 0;
  private p2WeaponIndex: number = 0;
  private p1Weapons: Weapon[] = [];
  private p2Weapons: Weapon[] = [];

  constructor() {
    super({ key: 'CollectionScene' });
  }

  create(): void {
    this.gameData = this.registry.get('gameData') as GameData;
    this.cameras.main.setBackgroundColor('#000000');

    this.player1 = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, this.gameData.character1);
    this.p1Weapons = [
      new IceShooter(this), new FireShooter(this), new GiantSword(this), new BigBomb(this),
    ];
    this.player1.weapon = this.p1Weapons[0];
    this.player1.inventory = this.p1Weapons;

    if (this.gameData.playerCount === 2 && this.gameData.character2) {
      this.player2 = new Player(this, GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 30, this.gameData.character2, true);
      this.p2Weapons = [
        new IceShooter(this), new FireShooter(this), new GiantSword(this), new BigBomb(this),
      ];
      this.player2.weapon = this.p2Weapons[0];
      this.player2.inventory = this.p2Weapons;
    }

    this.enemyGroup = this.physics.add.group();
    this.powerUpGroup = this.physics.add.group();
    this.hazardGroup = this.physics.add.staticGroup();
    this.trapGroup = this.physics.add.group();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.shootKey = this.input.keyboard!.addKey('SPACE');
    this.tabKey = this.input.keyboard!.addKey('TAB');

    this.input.keyboard!.on('keydown-ONE', () => this.switchWeapon(1, 0));
    this.input.keyboard!.on('keydown-TWO', () => this.switchWeapon(1, 1));
    this.input.keyboard!.on('keydown-THREE', () => this.switchWeapon(1, 2));
    this.input.keyboard!.on('keydown-FOUR', () => this.switchWeapon(1, 3));
    this.input.keyboard!.on('keydown-Q', () => this.switchWeapon(2, 0));
    this.input.keyboard!.on('keydown-E', () => this.switchWeapon(2, 1));
    this.input.keyboard!.on('keydown-R', () => this.switchWeapon(2, 2));
    this.input.keyboard!.on('keydown-T', () => this.switchWeapon(2, 3));

    this.spawnPowerUps(10);
    this.spawnHazards();
    this.spawnTraps(3);

    this.setupCollisions();

    this.events.emit('sceneReady', { sceneName: 'CollectionScene' });
  }

  private setupCollisions(): void {
    const players = [this.player1, this.player2].filter(Boolean) as Player[];

    players.forEach(p => {
      this.physics.add.overlap(p, this.powerUpGroup, (_, powerup) => {
        this.collectPowerUp(p, powerup as PowerUp);
      });

      this.physics.add.overlap(p, this.trapGroup, (_, trap) => {
        this.hitTrap(p, trap as DamageTrap);
      });

      this.physics.add.overlap(p, this.enemyGroup, () => {
        this.hitByEnemy(p);
      });

      this.physics.add.overlap(p, this.hazardGroup, (_, hazard) => {
        this.hitHazard(p, hazard as StageHazard);
      });
    });

    this.p1Weapons.forEach(w => {
      this.physics.add.overlap(w.getBulletGroup(), this.enemyGroup, (bullet, enemy) => {
        const b = bullet as Phaser.Physics.Arcade.Sprite;
        const e = enemy as ChasingEnemy;
        e.destroy();
        b.destroy();
        this.gameData.score += 50;
        this.cameras.main.shake(100, 0.005);
      });
    });

    if (this.p2Weapons.length > 0) {
      this.p2Weapons.forEach(w => {
        this.physics.add.overlap(w.getBulletGroup(), this.enemyGroup, (bullet, enemy) => {
          (enemy as ChasingEnemy).destroy();
          (bullet as Phaser.Physics.Arcade.Sprite).destroy();
          this.gameData.score += 50;
        });
      });
    }
  }

  update(time: number, _delta: number): void {
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx = -this.player1.playerSpeed;
    if (this.cursors.right.isDown) vx = this.player1.playerSpeed;
    if (this.cursors.up.isDown) vy = -this.player1.playerSpeed;
    if (this.cursors.down.isDown) vy = this.player1.playerSpeed;
    this.player1.setVelocity(vx, vy);

    let shootDirX = 0, shootDirY = 0;
    let shouldShoot = false;
    if (this.shootKey.isDown) { shouldShoot = true; shootDirY = -1; }
    if (this.wasd['W']!.isDown) { shouldShoot = true; shootDirY = -1; }
    if (this.wasd['S']!.isDown) { shouldShoot = true; shootDirY = 1; }
    if (this.wasd['A']!.isDown) { shouldShoot = true; shootDirX = -1; }
    if (this.wasd['D']!.isDown) { shouldShoot = true; shootDirX = 1; }

    if (shouldShoot && time > this.lastShotTime + SHOOT_RATE && this.player1.weapon) {
      this.player1.weapon.fire(this.player1, shootDirX, shootDirY);
      this.lastShotTime = time;
    }

    if (this.player2) {
      const dx = this.player1.x - this.player2.x;
      const dy = this.player1.y - this.player2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 70) {
        this.physics.moveToObject(this.player2, this.player1, this.player2.playerSpeed);
      } else {
        this.player2.setVelocity(this.player1.body!.velocity.x, this.player1.body!.velocity.y);
      }

      if (this.tabKey.isDown && time > this.lastShotTime + SHOOT_RATE && this.player2.weapon) {
        const nearest = this.findNearestEnemy(this.player2);
        let p2dx = 0, p2dy = -1;
        if (nearest) {
          const edx = nearest.x - this.player2.x;
          const edy = nearest.y - this.player2.y;
          const elen = Math.sqrt(edx * edx + edy * edy);
          p2dx = edx / elen; p2dy = edy / elen;
        }
        this.player2.weapon.fire(this.player2, p2dx, p2dy);
        this.lastShotTime = time;
      }
    }

    this.enemyGroup.getChildren().forEach(child => {
      (child as ChasingEnemy).chaseTarget(this.player1);
    });

    const isInvulnerable = time < this.invulnerableUntil;
    if (isInvulnerable) {
      this.player1.setAlpha(Math.floor(time / 80) % 2 === 0 ? 1 : 0.3);
      if (this.player2) this.player2.setAlpha(this.player1.alpha);
    } else {
      this.player1.setAlpha(1);
      if (this.player2) this.player2.setAlpha(1);
    }

    if (time > this.speedBoostUntil && this.player1.playerSpeed !== NORMAL_SPEED) {
      this.player1.playerSpeed = NORMAL_SPEED;
      if (this.player2) this.player2.playerSpeed = NORMAL_SPEED;
    }

    if (this.collected >= this.requiredCollect) {
      this.completeLevel();
    }

    this.registry.set('gameData', this.gameData);
  }

  private findNearestEnemy(fromPlayer: Player): Phaser.Physics.Arcade.Sprite | null {
    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let minDist = 400;
    this.enemyGroup.getChildren().forEach(child => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(fromPlayer.x, fromPlayer.y, enemy.x, enemy.y);
      if (dist < minDist) { minDist = dist; nearest = enemy; }
    });
    return nearest;
  }

  private collectPowerUp(player: Player, powerup: PowerUp): void {
    const type = powerup.powerUpType;
    if (type === 'speed') {
      this.speedBoostUntil = this.time.now + 10000;
      this.player1.playerSpeed = 480;
      if (this.player2) this.player2.playerSpeed = 480;
    } else if (type === 'life') {
      this.gameData.lives++;
    } else if (type === 'shield') {
      this.shieldUntil = this.time.now + 10000;
    } else if (type === 'health') {
      this.gameData.health = Math.min(MAX_HEALTH, this.gameData.health + 30);
    } else {
      player.addPowerup();
    }

    this.collected++;
    this.gameData.score += 50;
    powerup.destroy();

    if (this.collected % 3 === 0) {
      this.spawnEnemy();
    }
  }

  private hitTrap(_player: Player, trap: DamageTrap): void {
    trap.destroy();
    this.player1.removePowerup(); this.player1.removePowerup(); this.player1.removePowerup();
    this.cameras.main.flash(200, 255, 0, 0);
  }

  private hitByEnemy(_player: Player): void {
    if (this.time.now < this.invulnerableUntil) return;
    if (this.time.now < this.shieldUntil) return;

    this.gameData.health -= 15;
    this.invulnerableUntil = this.time.now + INVULNERABLE_DURATION;
    this.cameras.main.shake(100, 0.01);

    if (this.gameData.health <= 0) this.handleDeath();
  }

  private hitHazard(player: Player, hazard: StageHazard): void {
    if (hazard.hazardType === 'lava' && this.time.now >= this.invulnerableUntil) {
      this.gameData.health -= hazard.damageAmount;
      this.invulnerableUntil = this.time.now + 500;
      if (this.gameData.health <= 0) this.handleDeath();
    } else if (hazard.hazardType === 'trampoline') {
      player.setVelocityY(-hazard.bounceForce);
    } else if (hazard.hazardType === 'ice') {
      player.setVelocity(player.body!.velocity.x * 1.05, player.body!.velocity.y * 1.05);
    }
  }

  private handleDeath(): void {
    this.gameData.lives--;
    if (this.gameData.lives <= 0) {
      this.scene.stop('HUDScene');
      this.scene.start('PlayerCountScene');
    } else {
      this.gameData.health = MAX_HEALTH;
      this.player1.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
      if (this.player2) this.player2.setPosition(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 30);
      this.invulnerableUntil = this.time.now + RESPAWN_INVULNERABLE;
    }
  }

  private completeLevel(): void {
    this.gameData.currentDimension++;
    this.registry.set('gameData', this.gameData);

    const nextDim = DIMENSION_ORDER[this.gameData.currentDimension];
    if (nextDim) {
      this.cameras.main.fade(500, 0, 0, 0, false, (_cam: unknown, progress: number) => {
        if (progress === 1) {
          this.scene.start(nextDim.sceneKey, { dimensionIndex: this.gameData.currentDimension });
        }
      });
    } else {
      this.scene.start('VictoryScene');
    }
  }

  private switchWeapon(playerNum: 1 | 2, index: number): void {
    if (playerNum === 1 && index < this.p1Weapons.length) {
      this.p1WeaponIndex = index;
      this.player1.weapon = this.p1Weapons[index];
    } else if (playerNum === 2 && this.player2 && index < this.p2Weapons.length) {
      this.p2WeaponIndex = index;
      this.player2.weapon = this.p2Weapons[index];
    }
  }

  private spawnPowerUps(count: number): void {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const y = Phaser.Math.Between(100, GAME_HEIGHT - 50);
      const rand = Math.random();
      const type = rand < 0.8 ? 'regular' : rand < 0.85 ? 'speed' : rand < 0.9 ? 'shield' : rand < 0.95 ? 'health' : 'life';
      this.powerUpGroup.add(new PowerUp(this, x, y, type as PowerUp['powerUpType']));
    }
  }

  private spawnHazards(): void {
    for (let i = 0; i < 2; i++) {
      this.hazardGroup.add(new StageHazard(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(200, GAME_HEIGHT - 100), 'lava'));
      this.hazardGroup.add(new StageHazard(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(200, GAME_HEIGHT - 100), 'trampoline'));
      this.hazardGroup.add(new StageHazard(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(200, GAME_HEIGHT - 100), 'ice'));
    }
  }

  private spawnTraps(count: number): void {
    for (let i = 0; i < count; i++) {
      this.trapGroup.add(new DamageTrap(this, Phaser.Math.Between(50, GAME_WIDTH - 50), Phaser.Math.Between(100, GAME_HEIGHT - 50)));
    }
  }

  private spawnEnemy(): void {
    const edges = [
      { x: Phaser.Math.Between(0, GAME_WIDTH), y: 0 },
      { x: GAME_WIDTH, y: Phaser.Math.Between(0, GAME_HEIGHT) },
      { x: Phaser.Math.Between(0, GAME_WIDTH), y: GAME_HEIGHT },
      { x: 0, y: Phaser.Math.Between(0, GAME_HEIGHT) },
    ];
    const edge = Phaser.Math.RND.pick(edges);
    this.enemyGroup.add(new ChasingEnemy(this, edge.x, edge.y));
  }
}
