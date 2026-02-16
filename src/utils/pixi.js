import 'pixi.js/unsafe-eval';
import { extend } from '@pixi/react';
import { Container, Graphics, Sprite } from 'pixi.js';

// Register Pixi components for use in JSX
extend({
    Container,
    Graphics,
    Sprite
});
