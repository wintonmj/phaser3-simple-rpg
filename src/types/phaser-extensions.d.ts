// Extend Phaser types to match the actual API
declare namespace Phaser.Tilemaps {
  interface Tilemap {
    createLayer(layerID: string | number, tileset: Phaser.Tilemaps.Tileset | Phaser.Tilemaps.Tileset[], x?: number, y?: number): Phaser.Tilemaps.TilemapLayer;
    addTilesetImage(key: string, tileSetName?: string, tileWidth?: number, tileHeight?: number, tileMargin?: number, tileSpacing?: number, gid?: number): Phaser.Tilemaps.Tileset | null;
  }

  interface TilemapLayer extends Phaser.GameObjects.GameObject {
    setCollisionByProperty(properties: object): Phaser.Tilemaps.TilemapLayer;
  }
}

declare namespace Phaser.GameObjects {
  interface GameObject {
    scene: Phaser.Scene;
    type: string;
    parentContainer: Phaser.GameObjects.Container | null;
    active: boolean;
  }
}

declare namespace Phaser.Physics.Arcade {
  interface ArcadePhysics {
    add: Phaser.Physics.Arcade.ArcadePhysicsWorld;
  }

  interface ArcadePhysicsWorld {
    add: {
      group(config?: Phaser.Types.Physics.Arcade.PhysicsGroupConfig | Phaser.GameObjects.GameObject[]): Phaser.Physics.Arcade.Group;
      collider(object1: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[] | Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.Group[], object2: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[] | Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.Group[], callback?: Function, callbackContext?: any): Phaser.Physics.Arcade.Collider;
      existing(gameObject: Phaser.GameObjects.GameObject, isStatic?: boolean): Phaser.Physics.Arcade.SpriteWithDynamicBody;
      overlap(object1: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[] | Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.Group[], object2: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[] | Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.Group[], callback?: Function, callbackContext?: any): Phaser.Physics.Arcade.Collider;
    };
  }
} 