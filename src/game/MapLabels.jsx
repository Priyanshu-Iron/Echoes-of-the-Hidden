import React from 'react';
import { extend } from '@pixi/react';
import { Text, TextStyle } from 'pixi.js';
import { MAP_LABELS } from './mapData';

extend({ Text });

const MapLabels = () => {
    return (
        <container>
            {MAP_LABELS.map((label, index) => (
                <text
                    key={index}
                    text={label.text}
                    x={label.x}
                    y={label.y}
                    anchor={0.5}
                    style={
                        new TextStyle({
                            fontFamily: 'Arial',
                            fontSize: 14,
                            fill: label.color || 0x555566,
                            fontWeight: 'bold',
                            letterSpacing: 1,
                            dropShadow: true,
                            dropShadowColor: '#ffffff',
                            dropShadowBlur: 2,
                            dropShadowDistance: 0,
                        })
                    }
                />
            ))}
        </container>
    );
};

export default MapLabels;
