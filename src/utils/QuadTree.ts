/**
 * QuadTree implementation for efficient spatial partitioning
 * Used for optimizing entity culling and collision detection
 */

import { NonPlayerEntity } from '../game-objects/entities/NonPlayerEntity';

/** QuadTree configuration */
export const QUADTREE = {
  MAX_OBJECTS: 10,
  MAX_LEVELS: 4,
  MIN_SIZE: 200
};

/**
 * QuadTree implementation for efficient spatial partitioning
 */
export class QuadTree {
  private bounds: Phaser.Geom.Rectangle;
  private maxObjects: number;
  private maxLevels: number;
  private level: number;
  private objects: NonPlayerEntity[];
  private nodes: QuadTree[];

  /**
   * Create a new QuadTree
   */
  constructor(bounds: Phaser.Geom.Rectangle, maxObjects = 10, maxLevels = 4, level = 0) {
    this.bounds = bounds;
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.objects = [];
    this.nodes = [];
  }

  /**
   * Clear the quadtree
   */
  clear(): void {
    this.objects = [];
    
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i]) {
        this.nodes[i].clear();
      }
    }
    
    this.nodes = [];
  }

  /**
   * Split the node into 4 subnodes
   */
  split(): void {
    const nextLevel = this.level + 1;
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    // Top right
    this.nodes[0] = new QuadTree(
      new Phaser.Geom.Rectangle(x + subWidth, y, subWidth, subHeight),
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    // Top left
    this.nodes[1] = new QuadTree(
      new Phaser.Geom.Rectangle(x, y, subWidth, subHeight),
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    // Bottom left
    this.nodes[2] = new QuadTree(
      new Phaser.Geom.Rectangle(x, y + subHeight, subWidth, subHeight),
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    // Bottom right
    this.nodes[3] = new QuadTree(
      new Phaser.Geom.Rectangle(x + subWidth, y + subHeight, subWidth, subHeight),
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );
  }

  /**
   * Determine which node the object belongs to
   */
  getIndex(entity: NonPlayerEntity): number {
    let index = -1;
    const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    // Object can completely fit within the top quadrants
    const topQuadrant = (entity.y < horizontalMidpoint);
    // Object can completely fit within the bottom quadrants
    const bottomQuadrant = (entity.y >= horizontalMidpoint);

    // Object can completely fit within the left quadrants
    if (entity.x < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }
    }
    // Object can completely fit within the right quadrants
    else if (entity.x >= verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  }

  /**
   * Insert an object into the quadtree
   */
  insert(entity: NonPlayerEntity): void {
    // If we have subnodes, try to insert there
    if (this.nodes.length) {
      const index = this.getIndex(entity);

      if (index !== -1) {
        this.nodes[index].insert(entity);
        return;
      }
    }

    // If we don't have subnodes or object doesn't fit in one, add to this node
    this.objects.push(entity);

    // Check if we need to split after inserting
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (this.nodes.length === 0) {
        this.split();
      }

      // Reorganize objects into subnodes
      let i = 0;
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }

  /**
   * Return all objects that could collide with the given object
   */
  retrieve(entity: NonPlayerEntity): NonPlayerEntity[] {
    const index = this.getIndex(entity);
    let returnObjects = this.objects;

    // If we have subnodes
    if (this.nodes.length) {
      // If object fits in a specific node, check that node
      if (index !== -1) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(entity));
      } else {
        // If object overlaps multiple nodes, check all nodes
        for (let i = 0; i < this.nodes.length; i++) {
          returnObjects = returnObjects.concat(this.nodes[i].retrieve(entity));
        }
      }
    }

    return returnObjects;
  }

  /**
   * Return all objects that are within a given area
   */
  retrieveInBounds(bounds: Phaser.Geom.Rectangle): NonPlayerEntity[] {
    let returnObjects = this.objects;

    // If we have subnodes and the bounds intersect with this node
    if (this.nodes.length && Phaser.Geom.Rectangle.Overlaps(this.bounds, bounds)) {
      for (let i = 0; i < this.nodes.length; i++) {
        returnObjects = returnObjects.concat(this.nodes[i].retrieveInBounds(bounds));
      }
    }

    return returnObjects;
  }
} 