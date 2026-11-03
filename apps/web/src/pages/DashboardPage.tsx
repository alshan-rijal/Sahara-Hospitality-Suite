import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, CircleAlert, Plus } from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../lib/seo';
import { icons, type IconName } from '../lib/icons';
import EmptyState from '../components/EmptyState';
import DuneDivider from '../components/DuneDivider';
import CopyButton from '../components/CopyButton';

interface Dashboard {
  kpis: Record<string, number>;
  roomStatus: { _id: string; value: number }[];
  recentReservations: any[];
}

const statusLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Counts a statistic up on first paint; jumps straight to the value when motion is reduced. */
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

  useSeo({
    title: 'Dashboard | Sahara Hospitality Suite',
    description: 'Live occupancy, arrivals, housekeeping and outstanding balances for your properties.',
    path: '/',
    noindex: true
  });

  const load = useCallback(() => {
    setError('');
    api.get('/dashboard').then(response => setData(response.data)).catch(err => setError(errorMessage(err)));
  }, []);

  useEffect(() => { load(); }, [load]);

  const revenue = useCountUp(data?.kpis?.revenue || 0);
  const firstName = user?.name.split(' ')[0] || 'there';
  const currency = user?.properties?.[0]?.currency || 'GBP';
  const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);
  const whole = (value: number) => Math.round(value).toLocaleString('en-GB');
  const brandNew = Boolean(data) && (data?.kpis.roomCount || 0) === 0 && (data?.kpis.guests || 0) === 0 && data?.recentReservations.length === 0;

  // The header renders in every state so the page always has exactly one H1.
  const header = (
    <div className="welcome rise">
      <div>
        <h1>{greeting()}, {firstName}</h1>
        <p>{brandNew
          ? 'Your workspace is ready and empty. Start by adding your rooms, then take your first reservation.'
          : 'Here is the current operational picture for the properties your role can see.'}</p>
      </div>
      {data && !brandNew && (
        <div className="revenue-card">
          <span>Recorded folio revenue</span>
          <strong>{money(revenue)}</strong>
          <small>Across visible properties</small>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <>
        {header}
        <EmptyState art="error" title="We couldn’t load your dashboard" description={error} action={<button onClick={load}>Try again</button>} />
      </>
    );
  }

  if (!data) {
    return (
      <>
        {header}
        <div className="skeleton-grid" aria-busy="true" aria-label="Loading dashboard">
          {Array.from({ length: 8 }).map((_, index) => <div className="skeleton" key={index} />)}
        </div>
      </>
    );
  }

  const kpis = data.kpis;
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
      {header}

      {brandNew ? (
        <>
          <EmptyState
            title="No live operations yet"
            description="Rooms, reservations and guest profiles will appear here as soon as you add them. Set up rooms first so the front desk has something to sell."
            action={<Link className="button-link" to="/module/rooms"><Plus size={16} aria-hidden /> Add your first rooms</Link>}
          />
          <DuneDivider />
        </>
      ) : (
        <>
          <div className="kpi-grid stagger">
            {cards.map(card => <KpiCard key={card.label} {...card} />)}
          </div>

          <div className="dashboard-grid">
            <section className="panel rise">
              <div className="panel-header">
                <div>
                  <h2>Room status distribution</h2>
                  <p>Every room in scope, by its current state</p>
                </div>
                <span className="panel-icon"><TrendingUp size={16} strokeWidth={2} aria-hidden /></span>
              </div>
              <div className="bar-list">
                {data.roomStatus.length === 0 && <p className="muted-note">No rooms in scope yet — add rooms to see the live split.</p>}
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
                  <h2>Today’s operating pulse</h2>
                  <p>Exceptions that need a department to act</p>
                </div>
                <span className="panel-icon"><CircleAlert size={16} strokeWidth={2} aria-hidden /></span>
              </div>
              <div className="pulse-list">
                <div><span className="pulse-dot amber" /><p><b>{kpis.dirty}</b> rooms are vacant dirty and need turning</p></div>
                <div><span className="pulse-dot red" /><p><b>{kpis.openWorkOrders}</b> maintenance orders are still open</p></div>
                <div><span className="pulse-dot blue" /><p><b>{kpis.departures}</b> guests are due to depart today</p></div>
                <div><span className="pulse-dot green" /><p><b>{kpis.guests}</b> guest profiles are in the CRM</p></div>
              </div>
            </section>
          </div>

          <DuneDivider />

          <section className="panel table-panel rise">
            <div className="panel-header">
              <div>
                <h2>Recent reservations</h2>
                <p>The latest bookings within your scope</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th scope="col">Confirmation</th><th scope="col">Guest</th><th scope="col">Room</th><th scope="col">Arrival</th><th scope="col">Departure</th><th scope="col">Status</th></tr>
                </thead>
                <tbody>
                  {data.recentReservations.length === 0 ? (
                    <tr><td colSpan={6}><p className="muted-note">No reservations yet. New bookings appear here as the front desk takes them.</p></td></tr>
                  ) : data.recentReservations.map(reservation => (
                    <tr key={reservation._id}>
                      <td><span className="copy-cell"><b>{reservation.confirmationNumber}</b><CopyButton value={reservation.confirmationNumber} /></span></td>
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
      )}
    </>
  );
}
