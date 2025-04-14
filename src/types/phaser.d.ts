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