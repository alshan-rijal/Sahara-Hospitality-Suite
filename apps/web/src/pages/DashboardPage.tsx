import { useEffect, useState } from 'react';
import { TrendingUp, CircleAlert } from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { icons, type IconName } from '../lib/icons';

interface Dashboard {
  kpis: Record<string, number>;
  roomStatus: { _id: string; value: number }[];
  recentReservations: any[];
}

const statusLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());

/** Counts a statistic up on first paint; jumped straight to the value when motion is reduced. */
function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(target); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 700);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // rAF is paused in a hidden tab; settle the final value regardless.
    const settle = window.setTimeout(() => setValue(target), 800);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(settle); };
  }, [target]);
  return value;
}

function KpiCard({ label, value, format, note, icon }: { label: string; value: number; format: (value: number) => string; note: string; icon: IconName }) {
  const animated = useCountUp(value);
  const CardIcon = icons[icon];
  return (
    <article className="kpi-card">
      <div className="kpi-icon"><CardIcon size={19} strokeWidth={2} aria-hidden /></div>
      <span>{label}</span>
      <strong>{format(animated)}</strong>
      <small>{note}</small>
    </article>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then(response => setData(response.data)).catch(err => setError(errorMessage(err)));
  }, []);

  const revenue = useCountUp(data?.kpis?.revenue || 0);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 8 }).map((_, index) => <div className="skeleton" key={index} />)}
      </div>
    );
  }

  const kpis = data.kpis;
  const currency = user?.properties?.[0]?.currency || 'GBP';
  const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);
  const whole = (value: number) => Math.round(value).toLocaleString('en-GB');

  const cards: { label: string; value: number; format: (value: number) => string; note: string; icon: IconName }[] = [
    { label: 'Occupancy', value: kpis.occupancyRate || 0, format: value => `${Math.round(value)}%`, note: `${kpis.occupied} of ${kpis.roomCount} rooms`, icon: 'occupancy' },
    { label: 'Today’s arrivals', value: kpis.arrivals || 0, format: whole, note: 'Expected check-ins', icon: 'arrivals' },
    { label: 'In-house guests', value: kpis.inHouse || 0, format: whole, note: 'Active reservations', icon: 'inHouse' },
    { label: 'Outstanding', value: kpis.outstanding || 0, format: money, note: 'Open folio balance', icon: 'balance' },
    { label: 'Housekeeping', value: kpis.openHousekeeping || 0, format: whole, note: 'Open room tasks', icon: 'housekeeping' },
    { label: 'Maintenance', value: kpis.openWorkOrders || 0, format: whole, note: 'Active work orders', icon: 'maintenance' },
    { label: 'Low stock', value: kpis.lowStock || 0, format: whole, note: 'Items need reorder', icon: 'lowStock' },
    { label: 'Upcoming events', value: kpis.events || 0, format: whole, note: 'Confirmed or tentative', icon: 'events' }
  ];

  const max = Math.max(...data.roomStatus.map(item => item.value), 1);

  return (
    <>
      <div className="welcome rise">
        <div>
          <h2>Good day, {user?.name.split(' ')[0]}</h2>
          <p>Here is the current operational picture for your authorised hotel scope.</p>
        </div>
        <div className="revenue-card">
          <span>Recorded folio revenue</span>
          <strong>{money(revenue)}</strong>
          <small>Across visible properties</small>
        </div>
      </div>

      <div className="kpi-grid stagger">
        {cards.map(card => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel rise">
          <div className="panel-header">
            <div>
              <h3>Room status distribution</h3>
              <p>Live room inventory by operational state</p>
            </div>
            <span className="panel-icon"><TrendingUp size={16} strokeWidth={2} aria-hidden /></span>
          </div>
          <div className="bar-list">
            {data.roomStatus.length === 0 && <p className="empty-state small">No rooms in scope yet.</p>}
            {data.roomStatus.map(item => (
              <div className="bar-row" key={item._id}>
                <div><span>{statusLabel(item._id)}</span><b>{item.value}</b></div>
                <div className="bar-track"><i style={{ width: `${(item.value / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel rise">
          <div className="panel-header">
            <div>
              <h3>Today’s operating pulse</h3>
              <p>Exceptions requiring department attention</p>
            </div>
            <span className="panel-icon"><CircleAlert size={16} strokeWidth={2} aria-hidden /></span>
          </div>
          <div className="pulse-list">
            <div><span className="pulse-dot amber" /><p><b>{kpis.dirty}</b> rooms are vacant dirty</p></div>
            <div><span className="pulse-dot red" /><p><b>{kpis.openWorkOrders}</b> maintenance orders remain open</p></div>
            <div><span className="pulse-dot blue" /><p><b>{kpis.departures}</b> guests are due to depart</p></div>
            <div><span className="pulse-dot green" /><p><b>{kpis.guests}</b> guest profiles are in CRM</p></div>
          </div>
        </section>
      </div>

      <section className="panel table-panel rise">
        <div className="panel-header">
          <div>
            <h3>Recent reservations</h3>
            <p>Latest bookings within your assigned scope</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Confirmation</th><th>Guest</th><th>Room</th><th>Arrival</th><th>Departure</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.recentReservations.length === 0 ? (
                <tr><td colSpan={6} className="loading-cell">No reservations yet.</td></tr>
              ) : data.recentReservations.map(reservation => (
                <tr key={reservation._id}>
                  <td><b>{reservation.confirmationNumber}</b></td>
                  <td>{reservation.guestId ? `${reservation.guestId.firstName} ${reservation.guestId.lastName}` : '—'}</td>
                  <td>{reservation.roomId?.number || reservation.roomType}</td>
                  <td>{new Date(reservation.checkInDate).toLocaleDateString('en-GB')}</td>
                  <td>{new Date(reservation.checkOutDate).toLocaleDateString('en-GB')}</td>
                  <td><span className={`status ${reservation.status}`}>{statusLabel(reservation.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
