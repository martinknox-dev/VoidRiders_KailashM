import React from 'react';
import { Activity, Archive, Clock3, PhoneCall } from 'lucide-react';

export default function DashboardOverview({ activeCount, savedCount, isAnalyzing, backendConnected }) {
  const cards = [
    { label: 'Active calls', value: activeCount, note: 'Current queue', icon: PhoneCall },
    { label: 'Saved cases', value: savedCount, note: 'Local case vault', icon: Archive },
    { label: 'Analysis status', value: isAnalyzing ? 'Running' : 'Ready', note: backendConnected ? 'Connected service' : 'Local processing', icon: Activity },
    { label: 'Processing time', value: '—', note: 'Not available', icon: Clock3 },
  ];
  return (
    <section className="dashboard-overview" aria-label="Dashboard summary">
      {cards.map(({ label, value, note, icon: Icon }) => (
        <article className="dashboard-summary-card" key={label}>
          <div className="summary-card-top"><span>{label}</span><Icon size={16} /></div>
          <strong>{value}</strong>
          <small>{note}</small>
        </article>
      ))}
    </section>
  );
}
