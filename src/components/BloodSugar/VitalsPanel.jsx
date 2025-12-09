// src/components/Dashboard/VitalsPanel.jsx
import * as React from 'react';
import VitalsCard from './VitalsCard';

export default function VitalsPanel({ bp, bs }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {bp && <VitalsCard {...bp} color="#000" />}
      {bs && <VitalsCard {...bs} color="#111" />}
    </div>
  );
}
