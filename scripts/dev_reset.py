#!/usr/bin/env python3
"""
TriGo ▸ dev_reset.py
────────────────────────────────────────────────────────────
Stops the running Next.js dev server, purges the .next cache,
hard-clears site data for your local dev URL, then restarts
the server.  Crafted with love for Robert “Top D” Suarez.

Prerequisites
─────────────
  pip install psutil websocket-client requests

For cache-clearing you’ll need Chrome (or Edge/Brave/Chromium)
running with the DevTools protocol enabled, e.g.:

  google-chrome \
      --remote-debugging-port=9222 \
      --user-data-dir=/tmp/trigo-chrome

Usage
─────
  python dev_reset.py --project /path/to/trigo \
                      --dev-url http://localhost:3000 \
                      --dev-cmd "pnpm dev"

  • --project   Root of your Next.js project (defaults to cwd)
  • --dev-url   Origin whose cache you want wiped
  • --dev-cmd   Command that starts your dev server
"""
from __future__ import annotations
import argparse, json, os, shutil, subprocess, sys, time
import psutil, requests, websocket


# ─────────────────────────────────────────────────────────────
# 1. Stop Next.js dev server
# ─────────────────────────────────────────────────────────────
def stop_next_dev() -> None:
    """Terminate any Node process that looks like a Next.js dev server."""
    print("⏹  Stopping Next.js dev server …")
    killed = False
    for proc in psutil.process_iter(attrs=["pid", "name", "cmdline"]):
        try:
            if "node" in proc.info["name"].lower() and (
                "next" in " ".join(proc.info["cmdline"]) and "dev" in proc.info["cmdline"]
            ):
                proc.terminate()
                proc.wait(timeout=10)
                print(f"   • Terminated PID {proc.pid}")
                killed = True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    if not killed:
        print("   • No dev server found – moving on.")


# ─────────────────────────────────────────────────────────────
# 2. Delete .next folder
# ─────────────────────────────────────────────────────────────
def delete_next_folder(project_root: str) -> None:
    path = os.path.join(project_root, ".next")
    print(f"🗑  Deleting build cache {path!r} …")
    if os.path.isdir(path):
        shutil.rmtree(path)
        print("   • .next folder removed.")
    else:
        print("   • No .next folder to remove.")


# ─────────────────────────────────────────────────────────────
# 3. Clear browser data for dev URL
# ─────────────────────────────────────────────────────────────
def clear_site_data(origin: str, port: int = 9222) -> None:
    """
    Uses Chrome DevTools Protocol to clear cookies, cache, local-
    storage, etc. for a specific origin.
    """
    print(f"💨  Clearing site data for {origin} …")
    try:
        targets = requests.get(f"http://localhost:{port}/json").json()
        page_ws_url = next(t["webSocketDebuggerUrl"] for t in targets if t["type"] == "page")
        ws = websocket.create_connection(page_ws_url)
        msg_id = 1
        payload = {
            "id": msg_id,
            "method": "Storage.clearDataForOrigin",
            "params": {
                "origin": origin,
                "storageTypes": "cookies,storage,caches,service_workers"
            },
        }
        ws.send(json.dumps(payload))
        _ = ws.recv()  # consume ack
        ws.close()
        print("   • Cache/storage cleared via DevTools Protocol.")
    except Exception as e:
        print(f"   ! Skipped browser cache clear ({e}).")
        print("     Start Chrome with --remote-debugging-port=9222 to enable.")


# ─────────────────────────────────────────────────────────────
# 4. Restart dev server
# ─────────────────────────────────────────────────────────────
def start_next_dev(project_root: str, cmd: str) -> None:
    print("▶️  Restarting Next.js dev server …")
    subprocess.Popen(
        cmd,
        cwd=project_root,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    print("   • Dev server launched. Give it a few seconds to compile.")


# ─────────────────────────────────────────────────────────────
# Main entry
# ─────────────────────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(description="Hard-reset Next.js dev env.")
    parser.add_argument("--project", default=os.getcwd(), help="Project root (default: cwd)")
    parser.add_argument(
        "--dev-url", default="http://localhost:3000", help="Origin to clear (default: http://localhost:3000)"
    )
    parser.add_argument(
        "--dev-cmd", default="npm run dev", help='Command to start dev server (default: "npm run dev")'
    )
    args = parser.parse_args()

    stop_next_dev()
    delete_next_folder(args.project)
    clear_site_data(args.dev_url)
    start_next_dev(args.project, args.dev_cmd)


if __name__ == "__main__":
    try:
        main()
        print("\n✅  All done, Top D!  Happy coding. ʕ•ᴥ•ʔ")
    except KeyboardInterrupt:
        sys.exit(130)
