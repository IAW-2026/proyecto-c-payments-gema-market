import { Suspense } from "react";
import { syncCurrentUser } from "@/app/(Logica)/services/usuario-sync.service";

async function SyncUserInner() {
  await syncCurrentUser();
  return null;
}

export function SyncUser() {
  return (
    <Suspense fallback={null}>
      <SyncUserInner />
    </Suspense>
  );
}
