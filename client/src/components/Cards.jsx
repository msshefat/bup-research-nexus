import { Link } from 'react-router-dom';
import { initials, tone, formatDate } from '../constants';
import { Badge, statusTone } from './ui';

export function Avatar({ name, size = 'md' }) {
  const dimension = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-11 w-11 text-sm';
  return (
    <span
      className={`grid ${dimension} shrink-0 place-items-center rounded-2xl font-serif font-semibold text-ink`}
      style={{ background: tone(name) }}
      aria-hidden="true"
    >
      {initials(name) || 'N'}
    </span>
  );
}

export function AreaTags({ areas = [] }) {
  if (!areas.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {areas.map((area) => (
        <Link
          key={area}
          to={`/search?area=${encodeURIComponent(area)}`}
          className="rounded-full border border-line bg-ink/50 px-2.5 py-1 text-xs text-mist hover:border-gold/50 hover:text-paper"
        >
          {area}
        </Link>
      ))}
    </div>
  );
}

export function PersonCard({ person }) {
  return (
    <Link
      to={`/people/${person._id}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-panel p-4 transition hover:border-gold/45"
    >
      <div className="flex items-start gap-3">
        <Avatar name={person.name} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-paper group-hover:text-gold-2">{person.name}</p>
          <p className="truncate text-sm text-mist">
            {person.designation || person.organization || person.role}
            {person.department ? ` · ${person.department}` : ''}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={person.department === 'ICT' ? 'gold' : 'blue'}>{person.department || person.role}</Badge>
        {person.mentoringAvailable ? <Badge tone="teal">Open to mentoring</Badge> : null}
        {person.verified === false && person.role !== 'student' ? <Badge tone="gold">Unverified</Badge> : null}
      </div>
      <div className="mt-3">
        <AreaTags areas={person.researchInterests?.slice(0, 3)} />
      </div>
    </Link>
  );
}

export function OpportunityCard({ item }) {
  return (
    <Link
      to={`/opportunities/${item._id}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-panel p-5 transition hover:border-gold/45"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
        <span className="text-xs text-mist">
          {item.slots} {item.slots === 1 ? 'seat' : 'seats'} · {item.department}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-2xl leading-tight text-paper group-hover:text-gold-2">{item.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-mist">{item.summary}</p>
      <div className="mt-4">
        <AreaTags areas={item.researchAreas} />
      </div>
      <p className="mt-4 text-sm text-paper">
        {item.supervisor?.name || 'Faculty supervisor'}
        {item.deadline ? <span className="text-mist"> · due {formatDate(item.deadline)}</span> : null}
      </p>
    </Link>
  );
}

export function ProjectRow({ item }) {
  return (
    <Link
      to={`/projects/${item._id}`}
      className="grid gap-2 rounded-2xl border border-line bg-panel px-4 py-4 transition hover:border-gold/45 md:grid-cols-[88px_1fr_auto] md:items-center"
    >
      <span className="font-serif text-2xl text-gold">{item.year}</span>
      <span>
        <span className="block font-medium text-paper">{item.title}</span>
        <span className="mt-1 block text-sm text-mist">
          {item.authors}
          {item.supervisor?.name ? ` · supervised by ${item.supervisor.name}` : ''}
        </span>
      </span>
      <span className="flex flex-wrap gap-1.5 md:justify-end">
        <Badge tone={item.department === 'ICT' ? 'gold' : 'blue'}>{item.department}</Badge>
        <Badge tone="mist">{item.type}</Badge>
        {item.verified === false ? <Badge tone="gold">Needs review</Badge> : null}
      </span>
    </Link>
  );
}
