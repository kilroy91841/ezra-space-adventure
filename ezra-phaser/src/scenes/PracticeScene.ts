// src/scenes/PracticeScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SHOOT_RATE, MAX_HEALTH } from '../config/constants';
import { GameData } from '../config/types';
import { Player } from '../entities/Player';
import { ChasingEnemy } from '../entities/ChasingEnemy';
import { AlienBoss } from '../entities/AlienBoss';
import { DragonBoss } from '../entities/DragonBoss';
import { MiniDragonBoss } from '../entities/MiniDragonBoss';
import { Boss } from '../entities/Boss';
import { IceShooter } from '../weapons/IceShooter';
import { FireShooter } from '../weapons/FireShooter';
import { GiantSword } from '../weapons/GiantSword';
import { BigBomb } from '../weapons/BigBomb';
import { Weapon } from '../weapons/Weapon';

export class PracticeScene extends Phaser.Scene {
  private player1!: Player;
  private player2?: Player;
  private gameData!: GameData;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private shootKey!: Phaser.Input.Keyboard.Key;
  private tabKey!: Phaser.Input.Keyboard.Key;

  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private bossGroup!: Phaser.Physics.Arcade.Group;
  private bossProjectileGroup!: Phaser.Physics.Arcade.Group;

  private lastShotTime: number = 0;
  private p1Weapons: Weapon[] = [];
  private p2Weapons: Weapon[] = [];
  private bosses: Boss[] = [];
  private enemyCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PracticeScene' });
  }

  create(): void {
    this.gameData = this.registry.get('gameData') as GameData;

    // Reset state
    this.lastShotTime = 0;
    this.bosses = [];

    // Museum tile background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    const tileSize = 60;
    for (let x = 0; x < GAME_WIDTH; x += tileSize) {
      for (let y = 120; y < GAME_HEIGHT; y += tileSize) {
        const shade = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? 0x2a2a3e : 0x3a3a4e;
        this.add.rectangle(x + tileSize / 2, y + tileSize / 2, tileSize, tileSize, shade);
      }
    }

    // Decorative pedestals with spotlight effects
    const pedestalPositions = [
      { x: 100, y: 340 }, { x: 300, y: 540 }, { x: 600, y: 390 }, { x: 900, y: 640 },
    ];
    pedestalPositions.forEach(p => {
      // Spotlight glow
      const spotlight = this.add.graphics();
      spotlight.fillStyle(0xffffcc, 0.05);
      spotlight.fillCircle(p.x, p.y - 20, 50);
      spotlight.fillStyle(0xffffcc, 0.03);
      spotlight.fillCircle(p.x, p.y - 20, 80);

      // Pedestal body
      this.add.rectangle(p.x, p.y + 40, 50, 80, 0x555555);
      // Pedestal top
      this.add.rectangle(p.x, p.y - 2, 60, 5, 0x777777);
    });

    // Title
    this.add.text(GAME_WIDTH / 2, 20, 'PRACTICE MUSEUM', {
      fontFamily: 'Courier New', fontSize: '32px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Spawn buttons
    this.createSpawnButton(80, 70, 'Spawn Alien', 0x00ff00, () => this.spawnChaser());
    this.createSpawnButton(260, 70, 'Spawn Alien Boss', 0x00ff00, () => this.spawnAlienBoss());
    this.createSpawnButton(470, 70, 'Spawn Mini Dragon', 0xff6600, () => this.spawnMiniDragon());
    this.createSpawnButton(700, 70, 'Spawn Dragon Boss', 0xff0000, () => this.spawnDragonBoss());
    this.createSpawnButton(920, 70, 'Clear All', 0xff3333, () => this.clearAll());

    // Create players
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

    // Groups
    this.enemyGroup = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
    this.bossProjectileGroup = this.physics.add.group();

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.shootKey = this.input.keyboard!.addKey('SPACE');
    this.tabKey = this.input.keyboard!.addKey('TAB');

    // Weapon switching (Player 1: 1-4, Player 2: Q/E/R/T)
    this.input.keyboard!.on('keydown-ONE', () => this.switchWeapon(1, 0));
    this.input.keyboard!.on('keydown-TWO', () => this.switchWeapon(1, 1));
    this.input.keyboard!.on('keydown-THREE', () => this.switchWeapon(1, 2));
    this.input.keyboard!.on('keydown-FOUR', () => this.switchWeapon(1, 3));
    this.input.keyboard!.on('keydown-Q', () => this.switchWeapon(2, 0));
    this.input.keyboard!.on('keydown-E', () => this.switchWeapon(2, 1));
    this.input.keyboard!.on('keydown-R', () => this.switchWeapon(2, 2));
    this.input.keyboard!.on('keydown-T', () => this.switchWeapon(2, 3));

    // Collisions
    this.setupCollisions();

    // Enemy counter
    this.enemyCountText = this.add.text(20, GAME_HEIGHT - 30, '', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    });

    // Info text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, 'Click buttons to spawn enemies | All weapons available (1-4)', {
      fontFamily: 'Courier New', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);

    this.events.emit('sceneReady', { sceneName: 'PracticeScene' });
  }

  private createSpawnButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const width = label.length * 12 + 20;
    const btn = this.add.rectangle(x, y, width, 40, color)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff)
      .on('pointerover', () => btn.setStrokeStyle(3, 0xffff00))
      .on('pointerout', () => btn.setStrokeStyle(2, 0xffffff))
      .on('pointerdown', onClick);

    this.add.text(x, y, label, {
      fontFamily: 'Courier New', fontSize: '14px', color: '#000000', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private setupCollisions(): void {
    const players = [this.player1, this.player2].filter(Boolean) as Player[];

    // Player bullets vs chasing enemies
    [...this.p1Weapons, ...this.p2Weapons].forEach(w => {
      this.physics.add.overlap(w.getBulletGroup(), this.enemyGroup, (bullet, enemy) => {
        (enemy as ChasingEnemy).destroy();
        (bullet as Phaser.Physics.Arcade.Sprite).destroy();
        this.gameData.score += 50;
      });
    });

    // Player bullets vs bosses (handled per-boss, same pattern as BossScene)
    [...this.p1Weapons, ...this.p2Weapons].forEach(w => {
      this.physics.add.overlap(w.getBulletGroup(), this.bossGroup, (bullet, boss) => {
        const b = boss as Boss;
        const proj = bullet as Phaser.Physics.Arcade.Sprite;
        const dmg = proj.getData('damage') as number || 10;
        const hit = b.takeDamage(dmg);
        if (hit) {
          proj.destroy();
          this.gameData.score += 10;
        }
      });
    });

    // Boss projectiles vs players
    players.forEach(p => {
      this.physics.add.overlap(p, this.bossProjectileGroup, (_player, proj) => {
        (proj as Phaser.Physics.Arcade.Sprite).destroy();
        this.gameData.health -= 10;
        if (this.gameData.health <= 0) {
          this.gameData.health = MAX_HEALTH; // Practice mode: just reset health
        }
      });

      // Chasing enemies vs players
      this.physics.add.overlap(p, this.enemyGroup, () => {
        this.gameData.health -= 5;
        if (this.gameData.health <= 0) {
          this.gameData.health = MAX_HEALTH;
        }
      });
    });
  }

  update(time: number, delta: number): void {
    // Player 1 movement (arrow keys)
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx = -this.player1.playerSpeed;
    if (this.cursors.right.isDown) vx = this.player1.playerSpeed;
    if (this.cursors.up.isDown) vy = -this.player1.playerSpeed;
    if (this.cursors.down.isDown) vy = this.player1.playerSpeed;
    this.player1.setVelocity(vx, vy);

    // Player 1 shooting (WASD for direction, SPACE for straight up)
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

    // Player 2 AI follow + Tab to shoot
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
        this.player2.weapon.fire(this.player2, 0, -1);
        this.lastShotTime = time;
      }
    }

    // Enemies chase player
    this.enemyGroup.getChildren().forEach(child => {
      (child as ChasingEnemy).chaseTarget(this.player1);
    });

    // Update bosses
    this.bosses = this.bosses.filter(boss => {
      if (boss.defeated) {
        this.gameData.score += 200;
        boss.destroyBoss();
        return false;
      }
      boss.updateBoss(time, delta, this.player1);
      const projectiles = boss.shoot();
      projectiles.forEach(p => {
        if (!p.getData('isAllyProjectile')) {
          this.bossProjectileGroup.add(p);
        }
      });
      return true;
    });

    // Clean up off-screen projectiles
    this.bossProjectileGroup.getChildren().forEach(child => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      if (sprite.y > GAME_HEIGHT + 50 || sprite.y < -50 || sprite.x < -50 || sprite.x > GAME_WIDTH + 50) {
        sprite.destroy();
      }
    });

    // Update enemy count
    const totalEnemies = this.enemyGroup.getLength() + this.bosses.length;
    this.enemyCountText.setText(`Active Enemies: ${totalEnemies}`);

    // Update registry for HUD
    this.registry.set('gameData', this.gameData);
  }

  private switchWeapon(playerNum: 1 | 2, index: number): void {
    if (playerNum === 1 && index < this.p1Weapons.length) {
      this.player1.weapon = this.p1Weapons[index];
    } else if (playerNum === 2 && this.player2 && index < this.p2Weapons.length) {
      this.player2.weapon = this.p2Weapons[index];
    }
  }

  private spawnChaser(): void {
    const edges = [
      { x: Phaser.Math.Between(0, GAME_WIDTH), y: 120 },
      { x: GAME_WIDTH - 50, y: Phaser.Math.Between(120, GAME_HEIGHT - 50) },
      { x: Phaser.Math.Between(0, GAME_WIDTH), y: GAME_HEIGHT - 50 },
      { x: 50, y: Phaser.Math.Between(120, GAME_HEIGHT - 50) },
    ];
    const edge = Phaser.Math.RND.pick(edges);
    this.enemyGroup.add(new ChasingEnemy(this, edge.x, edge.y));
  }

  private spawnAlienBoss(): void {
    const boss = new AlienBoss(this, GAME_WIDTH / 2, 150);
    this.bossGroup.add(boss);
    this.bosses.push(boss);
  }

  private spawnMiniDragon(): void {
    const boss = new MiniDragonBoss(this, GAME_WIDTH / 2, 150);
    this.bossGroup.add(boss);
    this.bosses.push(boss);
  }

  private spawnDragonBoss(): void {
    const boss = new DragonBoss(this, GAME_WIDTH / 2, 150);
    this.bossGroup.add(boss);
    this.bosses.push(boss);
  }

  private clearAll(): void {
    this.enemyGroup.clear(true, true);
    this.bossProjectileGroup.clear(true, true);
    this.bosses.forEach(b => b.destroyBoss());
    this.bosses = [];
    this.bossGroup.clear(true, true);
  }
}
