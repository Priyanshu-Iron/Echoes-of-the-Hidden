import React from 'react';

const NPC = ({ id, x, y, role, color = 0xff00ff }) => {
    return (
        <graphics
            draw={(g) => {
                g.clear();
                g.circle(0, 0, 16);
                g.fill(color);
            }}
            x={x}
            y={y}
        />
    );
};

export default NPC;
