/** Determine whether an accepted, authoritative End Turn advances the local seat.
 * The per-seat websocket snapshot must identify its own seat as the new active
 * player. This avoids briefly switching to a stale snapshot from another socket.
 */
export function localTurnHandoff(pending, sourceSeat, snapshot, allowedSeats) {
  if (!pending || !snapshot?.turn || !allowedSeats.includes(sourceSeat)) return {status:'waiting'};
  if (!Number.isFinite(snapshot.revision) || snapshot.revision <= pending.revision) return {status:'waiting'};
  if (snapshot.turn.activePlayer === sourceSeat && sourceSeat !== pending.actor)
    return {status:'switch',seat:sourceSeat};
  // If only this player is eligible, a new round can immediately return to them.
  // In that case the handoff is finished but no seat switch is necessary.
  if (snapshot.turn.round > pending.round &&
      (snapshot.turn.activePlayer === pending.actor || snapshot.turn.activePlayer === null))
    return {status:'finished'};
  return {status:'waiting'};
}
