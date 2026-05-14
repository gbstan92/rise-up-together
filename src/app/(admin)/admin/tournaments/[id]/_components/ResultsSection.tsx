"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addResult, removeResult } from "@/server/tournaments";

type Team = { id: string; name: string };
type Result = {
  id: string;
  round: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  playedAt: Date | null;
};

export function ResultsSection({
  tournamentId,
  teams,
  initial,
}: {
  tournamentId: string;
  teams: Team[];
  initial: Result[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [round, setRound] = useState("");
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [playedAt, setPlayedAt] = useState("");

  const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? "?";

  const add = () => {
    if (!round || !home || !away) {
      toast.error("Round and both teams required");
      return;
    }
    if (home === away) {
      toast.error("Home and away must differ");
      return;
    }
    startTransition(async () => {
      try {
        await addResult(
          tournamentId,
          round,
          home,
          away,
          homeScore,
          awayScore,
          playedAt ? new Date(playedAt) : null,
        );
        setRound("");
        setHome("");
        setAway("");
        setHomeScore(0);
        setAwayScore(0);
        setPlayedAt("");
        router.refresh();
      } catch {
        toast.error("Add failed");
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      try {
        await removeResult(id, tournamentId);
        router.refresh();
      } catch {
        toast.error("Remove failed");
      }
    });
  };

  if (teams.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least two teams before recording results.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_1fr_auto_1fr_auto]">
        <Input placeholder="Round (e.g. Final)" value={round} onChange={(e) => setRound(e.target.value)} />
        <select
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Home team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <Input
          type="number"
          min={0}
          value={homeScore}
          onChange={(e) => setHomeScore(Number(e.target.value))}
          className="w-16"
        />
        <span className="self-center text-center text-muted-foreground">vs</span>
        <Input
          type="number"
          min={0}
          value={awayScore}
          onChange={(e) => setAwayScore(Number(e.target.value))}
          className="w-16"
        />
        <select
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Away team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <Button onClick={add} disabled={pending}>
          Add
        </Button>
      </div>
      <Input
        type="datetime-local"
        value={playedAt}
        onChange={(e) => setPlayedAt(e.target.value)}
        className="max-w-xs"
      />

      {initial.length > 0 && (
        <ul className="divide-y rounded-md border">
          {initial.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="rounded bg-muted px-2 py-0.5 text-xs">{r.round}</span>
              <span className="flex-1">
                {teamName(r.homeTeamId)} <b>{r.homeScore}</b> – <b>{r.awayScore}</b>{" "}
                {teamName(r.awayTeamId)}
                {r.playedAt && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(r.playedAt).toLocaleString()}
                  </span>
                )}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove"
                disabled={pending}
                onClick={() => remove(r.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
