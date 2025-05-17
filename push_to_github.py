import subprocess
import sys
import os
from rich.console import Console
from rich.table import Table
from rich.progress import Progress
from rich.style import Style
import re

console = Console()

def run_command(command, cwd=None, capture_output=True, text=True):
    """Runs a subprocess command with enhanced error handling and console output."""
    try:
        console.print(f"[bold blue]Running command:[/bold blue] {command}")
        result = subprocess.run(command, cwd=cwd, capture_output=capture_output, text=text, check=True)
        if capture_output:
            console.print(f"[green]Command successful.[/green]")
            if result.stdout:
                console.print("[dim]Stdout:[/dim]", result.stdout.strip())
            if result.stderr:
                console.print("[dim]Stderr:[/dim]", result.stderr.strip())
        return result
    except subprocess.CalledProcessError as e:
        console.print(f"[bold red]Error executing command:[/bold red] {command}")
        console.print(f"[red]Return code:[/red] {e.returncode}")
        if e.stdout:
            console.print("[red]Stdout:[/red]", e.stdout.strip())
        if e.stderr:
            console.print("[red]Stderr:[/red]", e.stderr.strip())
        sys.exit(f"Command failed: {e}")
    except FileNotFoundError:
        console.print(f"[bold red]Error:[/bold red] Command not found. Is Git installed and in your PATH?")
        sys.exit("Git command not found.")

def get_git_status():
    """Gets the current git status."""
    console.print("[bold blue]Checking Git status...[/bold blue]")
    result = run_command(["git", "status", "--porcelain"], capture_output=True)
    return result.stdout.strip().split('\n') if result.stdout.strip() else []

def git_add_all():
    """Adds all changes to the staging area."""
    with Progress(
        console=console,
        transient=True,
        refresh_per_second=10
    ) as progress:
        task = progress.add_task("[cyan]Adding all files...", total=1)
        run_command(["git", "add", "."], capture_output=False)
        progress.update(task, advance=1)
    console.print("[green]All changes added.[/green]")

def git_commit(message):
    """Commits staged changes."""
    with Progress(
        console=console,
        transient=True,
        refresh_per_second=10
    ) as progress:
        task = progress.add_task("[cyan]Committing changes...", total=1)
        run_command(["git", "commit", "-m", message], capture_output=False)
        progress.update(task, advance=1)
    console.print(f"[green]Changes committed with message: '{message}'[/green]")

def get_current_branch():
    """Gets the current active Git branch."""
    console.print("[bold blue]Getting current branch...[/bold blue]")
    result = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True)
    return result.stdout.strip()

def get_remote_url(remote_name="origin"):
    """Gets the URL of a specific Git remote."""
    console.print(f"[bold blue]Getting URL for remote '{remote_name}'...[/bold blue]")
    try:
        result = run_command(["git", "remote", "get-url", remote_name], capture_output=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        console.print(f"[yellow]Remote '{remote_name}' not found.[/yellow]")
        return None

def add_remote(remote_name, remote_url):
    """Adds a new Git remote."""
    console.print(f"[bold blue]Adding remote '{remote_name}' with URL '{remote_url}'...[/bold blue]")
    run_command(["git", "remote", "add", remote_name, remote_url], capture_output=False)
    console.print(f"[green]Remote '{remote_name}' added.[/green]")

def set_remote_url(remote_name, remote_url):
    """Sets the URL for an existing Git remote."""
    console.print(f"[bold blue]Setting URL for remote '{remote_name}' to '{remote_url}'...[/bold blue]")
    run_command(["git", "remote", "set-url", remote_name, remote_url], capture_output=False)
    console.print(f"[green]Remote '{remote_name}' URL updated.[/green]")

def git_push(remote_name, branch_name):
    """Pushes changes to the remote repository."""
    console.print(f"[bold blue]Pushing to remote '{remote_name}' on branch '{branch_name}'...[/bold blue]")
    with Progress(
        console=console,
        transient=True,
        refresh_per_second=10
    ) as progress:
        task = progress.add_task("[cyan]Pushing changes...", total=1)
        run_command(["git", "push", "-u", remote_name, branch_name], capture_output=False)
        progress.update(task, advance=1)
    console.print("[green]Push successful![/green]")

def get_latest_commit_hash():
    """Gets the hash of the latest commit."""
    console.print("[bold blue]Getting latest commit hash...[/bold blue]")
    result = run_command(["git", "rev-parse", "HEAD"], capture_output=True)
    return result.stdout.strip()

def get_remotes():
    """Lists all configured remotes."""
    console.print("[bold blue]Listing remotes...[/bold blue]")
    result = run_command(["git", "remote", "-v"], capture_output=True)
    remotes_output = result.stdout.strip().split('\n') if result.stdout.strip() else []
    remotes = {}
    for line in remotes_output:
        match = re.match(r'(\w+)\s+(.*)\s+\((fetch|push)\)', line)
        if match:
            name, url, type = match.groups()
            if name not in remotes:
                remotes[name] = {}
            remotes[name][type] = url
    return remotes

def main():
    console.print("[bold magenta]Git Push Script[/bold magenta]")

    # Check if it's a git repository
    try:
        run_command(["git", "rev-parse", "--is-inside-work-tree"], capture_output=False)
    except Exception:
        console.print("[bold red]Error:[/bold red] Not a git repository. Please run this script inside a git project.")
        sys.exit(1)

    mode = input("Enter mode ('interactive' or 'cli'): ").strip().lower()
    if mode not in ['interactive', 'cli']:
        console.print("[bold red]Invalid mode:[/bold red] Please enter 'interactive' or 'cli'.")
        sys.exit(1)

    if mode == 'interactive':
        console.print("[bold green]Interactive Mode Selected[/bold green]")
        status = get_git_status()
        if status:
            console.print("[yellow]Uncommitted changes detected:[/yellow]")
            for line in status:
                console.print(f"- {line}")
            add_changes = console.input("[bold yellow]Do you want to add all changes to the staging area? (yes/no):[/bold yellow] ").strip().lower()
            if add_changes == 'yes':
                git_add_all()
            else:
                console.print("[yellow]Skipping adding changes.[/yellow]")

        commit_message = console.input("[bold yellow]Enter commit message (leave blank to skip commit):[/bold yellow] ").strip()
        if commit_message:
            git_commit(commit_message)
        else:
            console.print("[yellow]Skipping commit.[/yellow]")

        branch_name = get_current_branch()
        console.print(f"[bold blue]Current branch:[/bold blue] {branch_name}")

        remotes = get_remotes()
        remote_name = "origin"

        if remote_name in remotes:
            current_remote_url = remotes[remote_name].get('push') or remotes[remote_name].get('fetch')
            console.print(f"[bold blue]Existing remote '{remote_name}' URL:[/bold blue] {current_remote_url}")
            new_remote_url = console.input(f"[bold yellow]Enter new URL for remote '{remote_name}' (leave blank to keep current):[/bold yellow] ").strip()
            if new_remote_url:
                if new_remote_url != current_remote_url:
                    update_remote = console.input(f"[bold yellow]Remote '{remote_name}' already exists with a different URL. Update? (yes/no):[/bold yellow] ").strip().lower()
                    if update_remote == 'yes':
                        set_remote_url(remote_name, new_remote_url)
                    else:
                        console.print("[yellow]Keeping existing remote URL.[/yellow]")
                else:
                    console.print("[green]Remote URL is already correct.[/green]")
            else:
                console.print("[yellow]Keeping existing remote URL.[/yellow]")
        else:
            console.print(f"[yellow]Remote '{remote_name}' not found.[/yellow]")
            remote_url = console.input(f"[bold yellow]Enter URL for remote '{remote_name}':[/bold yellow] ").strip()
            if remote_url:
                add_remote(remote_name, remote_url)
            else:
                console.print("[bold red]Error:[/bold red] Remote URL is required to add a new remote.")
                sys.exit(1)


        push_confirm = console.input(f"[bold yellow]Push changes to '{remote_name}' on branch '{branch_name}'? (yes/no):[/bold yellow] ").strip().lower()
        if push_confirm == 'yes':
            git_push(remote_name, branch_name)
        else:
            console.print("[yellow]Push cancelled.[/yellow]")

    elif mode == 'cli':
        console.print("[bold green]CLI Mode Selected[/bold green]")
        # CLI mode expects that the user has already handled adding and committing.
        # It will just push.

        branch_name = get_current_branch()
        console.print(f"[bold blue]Current branch:[/bold blue] {branch_name}")

        remotes = get_remotes()
        remote_name = "origin" # Default remote name for CLI mode

        if remote_name in remotes:
            current_remote_url = remotes[remote_name].get('push') or remotes[remote_name].get('fetch')
            console.print(f"[bold blue]Pushing to existing remote '{remote_name}' with URL: {current_remote_url}[/bold blue]")
            git_push(remote_name, branch_name)
        else:
            console.print(f"[bold red]Error:[/bold red] Remote '{remote_name}' not found. Please run in interactive mode to add a remote or add it manually.")
            sys.exit(1)


    # Summary Table
    console.print("\n[bold underline]Push Summary[/bold underline]")
    summary_table = Table(title_style="bold", header_style="bold cyan")
    summary_table.add_column("Item", style="dim")
    summary_table.add_column("Details")

    latest_commit_hash = get_latest_commit_hash()
    current_branch = get_current_branch()
    remotes_info = get_remotes()
    origin_url = remotes_info.get("origin", {}).get("push") or remotes_info.get("origin", {}).get("fetch") or "N/A"

    summary_table.add_row("Commit Hash", latest_commit_hash)
    summary_table.add_row("Branch Name", current_branch)
    summary_table.add_row("Remote URL (origin)", origin_url)

    console.print(summary_table)

if __name__ == "__main__":
    main()