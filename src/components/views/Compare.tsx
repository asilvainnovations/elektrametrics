import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const rows = [
  { dim: 'Survey Design', em: 'Multi-channel deployment: face-to-face, mobile apps, SMS, online panels. AI-assisted sampling to ensure demographic balance and reduce bias.', pa: 'Face-to-face interviews with stratified random sampling (region, class, demographics).' },
  { dim: 'Data Collection', em: 'Real-time digital capture via mobile devices. Automated validation checks. Cloud-based storage with anonymization protocols.', pa: 'Manual field enumerators, paper-based or basic digital entry.' },
  { dim: 'Sampling & Representation', em: 'Dynamic sampling with AI-driven adjustments. Integration with census and voter registry data for higher accuracy.', pa: 'Stratified sampling across regions and socioeconomic classes.' },
  { dim: 'Analytics', em: 'Machine learning trend detection, predictive modeling, sentiment analysis from open-ended responses.', pa: 'Traditional statistical analysis (percentages, margins of error).' },
  { dim: 'Geospatial Mapping', em: 'Interactive GIS dashboards showing voter sentiment by province, city, or barangay. Heatmaps for electoral risk zones.', pa: 'Regional breakdowns (e.g., NCR, Luzon, Visayas, Mindanao).' },
  { dim: 'Reporting', em: 'Interactive dashboards, scenario simulations (e.g., turnout shifts). Exportable policy briefs and campaign insights.', pa: 'Quarterly survey reports, static charts.' },
  { dim: 'Security & Integrity', em: 'End-to-end encryption, blockchain-based audit trails, AI fraud detection (flagging duplicate or suspicious responses).', pa: 'Controlled field operations, manual oversight.' },
  { dim: 'EAF Integration', em: 'Survey results feed into EAF modules (needs, objectives, program options). Automated recommendations for interventions.', pa: 'Not formally integrated.' },
  { dim: 'Accessibility', em: 'Tiered access: public dashboards, secure policymaker portals, campaign-specific strategy modules.', pa: 'Reports for policymakers, media, and public.' },
];

export const Compare: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Comparative Framework</h1>
        <p className="text-sm text-muted-foreground">ElektraMetrics versus traditional survey methodologies.</p>
      </div>

      <div className="glass-card p-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-4 font-display text-sm font-semibold w-44">Dimension</th>
                <th className="p-4 font-display text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">EM</div>
                    ElektraMetrics
                  </div>
                </th>
                <th className="p-4 font-display text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold">PA</div>
                    PulseAsia
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.dim} className={i % 2 === 0 ? 'bg-white/30' : ''}>
                  <td className="p-4 font-condensed font-semibold text-sm align-top">{r.dim}</td>
                  <td className="p-4 align-top">
                    <div className="flex gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{r.em}</span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{r.pa}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
