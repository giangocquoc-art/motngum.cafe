'use client';

import { useState } from 'react';
import useSWR from 'swr';

type TeamChoice = { id: number; name: string; role: string };
type TeamResponse = { teams: TeamChoice[]; activeTeamId: number | null };
const fetcher = async (url: string): Promise<TeamResponse> => {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error('Could not load teams');
  return r.json();
};

export function TeamSwitcher() {
  const { data, error } = useSWR<TeamResponse>('/api/teams', fetcher);
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState('');
  if (error || !data?.teams.length) return null;
  if (data.teams.length === 1) return (
    <span className="hidden max-w-36 truncate text-sm text-slate-600 sm:inline" title={data.teams[0].name}>
      {data.teams[0].name}
    </span>
  );
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <span className="hidden sm:inline">Cửa hàng</span>
      <select
        aria-label="Chọn tổ chức đang hoạt động"
        className="max-w-40 rounded-md border border-slate-300 bg-white p-2 text-sm"
        value={data.activeTeamId ?? ''}
        disabled={switching}
        onChange={async event => {
          const teamId = Number(event.target.value);
          if (!Number.isSafeInteger(teamId) || teamId <= 0) return;
          setSwitching(true); setMessage('');
          try {
            const r = await fetch('/api/teams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store',
              body: JSON.stringify({ teamId })
            });
            if (!r.ok) throw new Error('Bạn không có quyền vào tổ chức này.');
            // Fully discard any cached UI data from the previous tenant.
            window.location.assign('/dashboard/commerce');
          } catch {
            setMessage('Không thể chuyển tổ chức. Vui lòng thử lại.');
            setSwitching(false);
          }
        }}>
        <option value="" disabled>Chọn tổ chức</option>
        {data.teams.map(team => <option key={team.id} value={team.id}>
          {team.name} ({team.role})
        </option>)}
      </select>
      {message && <span role="alert" className="text-xs text-red-700">{message}</span>}
    </label>
  );
}
