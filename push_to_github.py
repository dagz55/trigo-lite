import subprocess
import sys
import os
from rich.console import Console
from rich.table import Table
from rich.progress import Progress
import re

console = Console()

# --- Configuration ---
TARGET_REMOTE_URL = "https://github.com/dagz55/trigo-lite.git"
TARGET_REMOTE_BRANCH = "main"
DEFAULT_REMOTE_NAME = "origin"

def run_command(command, cwd=None, capture_output=True, text=True, quiet=False, allow_fail=False):
    """
    Runs a subprocess command with enhanced error handling and console output.
    If allow_fail is True, it re-raises CalledProcessError instead of exiting.
    """
    command_str = ' '.join(command)
    try:
        if not quiet:
            console.print(f"[bold blue]Running command:[/bold blue] {command_str}")
        
        result = subprocess.run(command, cwd=cwd, capture_output=capture_output, text=text, check=True)
        
        if not quiet:
            console.print(f"[green]Command successful.[/green]")
            if capture_output:
                if result.stdout and result.stdout.strip():
                    console.print("[dim]Stdout:[/dim]", result.stdout.strip())
                if result.stderr and result.stderr.strip():
                    console.print("[dim]Stderr:[/dim]", result.stderr.strip())
        return result
    except subprocess.CalledProcessError as e:
        if not quiet or not allow_fail : # Always print if not quiet, or if we are going to exit
            console.print(f"[bold red]Error executing command:[/bold red] {command_str}")
            console.print(f"[red]Return code:[/red] {e.returncode}")
            if e.stdout and e.stdout.strip(): # stdout might contain error info from git
                console.print(f"[red]Stdout:[/red]\n{e.stdout.strip()}")
            if e.stderr and e.stderr.strip():
                console.print(f"[red]Stderr:[/red]\n{e.stderr.strip()}")
        
        if not allow_fail:
            sys.exit(f"Command failed: {command_str} (exit code {e.returncode})")
        else:
            raise # Re-raise the exception to be caught by the caller
    except FileNotFoundError:
        console.print(f"[bold red]Error:[/bold red] Command '{command[0]}' not found. Is Git installed and in your PATH?")
        sys.exit(f"Command '{command[0]}' not found.")

def get_git_status():
    console.print("[bold blue]Checking Git status...[/bold blue]")
    result = run_command(["git", "status", "--porcelain"], capture_output=True, quiet=True)
    return result.stdout.strip().split('\n') if result.stdout.strip() else []

def git_add_all():
    with Progress(console=console, transient=True, refresh_per_second=10) as progress:
        task = progress.add_task("[cyan]Adding all files...", total=1)
        run_command(["git", "add", "."], capture_output=False)
        progress.update(task, advance=1)
    console.print("[green]All changes added.[/green]")

def git_commit(message):
    with Progress(console=console, transient=True, refresh_per_second=10) as progress:
        task = progress.add_task("[cyan]Committing changes...", total=1)
        run_command(["git", "commit", "-m", message], capture_output=False)
        progress.update(task, advance=1)
    console.print(f"[green]Changes committed with message: '{message}'[/green]")

def get_current_branch():
    result = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, quiet=True)
    return result.stdout.strip()

def add_remote(remote_name, remote_url):
    console.print(f"[bold blue]Adding remote '{remote_name}' with URL '{remote_url}'...[/bold blue]")
    run_command(["git", "remote", "add", remote_name, remote_url], capture_output=False)
    console.print(f"[green]Remote '{remote_name}' added.[/green]")

def set_remote_url(remote_name, remote_url):
    console.print(f"[bold blue]Setting URL for remote '{remote_name}' to '{remote_url}'...[/bold blue]")
    run_command(["git", "remote", "set-url", remote_name, remote_url], capture_output=False)
    console.print(f"[green]Remote '{remote_name}' URL updated.[/green]")

def git_push(remote_name, local_branch_name, remote_branch_name, interactive_mode=False):
    """
    Pushes changes. Returns True if push was successful or force push succeeded.
    Returns False otherwise (e.g., user declined force push, or force push failed).
    In CLI mode, non-fast-forward errors will cause a sys.exit.
    """
    console.print(f"[bold blue]Attempting to push local branch '{local_branch_name}' to remote '{remote_name}/{remote_branch_name}'...[/bold blue]")
    
    push_command_base = ["git", "push", "-u", remote_name, f"{local_branch_name}:{remote_branch_name}"]

    with Progress(console=console, transient=False, refresh_per_second=10) as progress_bar: # Keep progress visible
        push_task = progress_bar.add_task("[cyan]Pushing changes...", total=1)
        try:
            # First attempt: normal push. capture_output=True to analyze errors.
            # allow_fail=True so we can catch CalledProcessError.
            run_command(push_command_base, capture_output=True, text=True, quiet=True, allow_fail=True)
            progress_bar.update(push_task, advance=1, description="[green]Push successful!")
            console.print("[green]Push successful on first attempt![/green]")
            return True
        except subprocess.CalledProcessError as e:
            progress_bar.update(push_task, completed=1, description="[yellow]Initial push failed.", visible=False) # Hide or mark as failed
            
            error_output = (e.stdout or "") + (e.stderr or "") # Combine stdout and stderr for checking
            
            # Print the detailed error from git that run_command would have shown if not quiet + allow_fail
            console.print(f"[bold red]Initial push command failed:[/bold red] {' '.join(push_command_base)}")
            console.print(f"[red]Return code:[/red] {e.returncode}")
            if e.stdout and e.stdout.strip(): console.print(f"[red]Git Stdout:[/red]\n{e.stdout.strip()}")
            if e.stderr and e.stderr.strip(): console.print(f"[red]Git Stderr:[/red]\n{e.stderr.strip()}")

            if "non-fast-forward" in error_output.lower():
                console.print("\n[bold yellow]Push rejected (non-fast-forward).[/bold yellow]")
                console.print(f"The remote '{remote_branch_name}' branch has changes that your local '{local_branch_name}' branch does not have.")
                
                if interactive_mode:
                    console.print("\n[bold cyan]Options:[/bold cyan]")
                    console.print("  1. [bold]Manually resolve[/bold]:")
                    console.print(f"     a. Fetch remote changes: `git fetch {remote_name}`")
                    console.print(f"     b. Integrate changes into '{local_branch_name}' (e.g., `git rebase {remote_name}/{remote_branch_name}` or `git merge {remote_name}/{remote_branch_name}` on branch '{local_branch_name}')")
                    console.print("     c. Resolve any conflicts.")
                    console.print("     d. Then, try running this script again.")
                    console.print("  2. [bold red]Force push with lease[/bold red] (overwrites remote changes if no one else pushed to remote 'main' since your last fetch; [underline]use with extreme caution[/underline]):")

                    force_choice = console.input("Attempt force push with lease? (yes/no): ").strip().lower()
                    if force_choice == 'yes':
                        force_push_command = ["git", "push", "--force-with-lease", "-u", remote_name, f"{local_branch_name}:{remote_branch_name}"]
                        console.print(f"[bold yellow]Attempting force push with lease: {' '.join(force_push_command)}[/bold yellow]")
                        
                        with Progress(console=console, transient=False, refresh_per_second=10) as force_progress_bar:
                            force_task = force_progress_bar.add_task("[cyan]Force pushing...", total=1)
                            try:
                                # allow_fail=True to catch its specific error if force push also fails
                                run_command(force_push_command, capture_output=True, text=True, quiet=True, allow_fail=True)
                                force_progress_bar.update(force_task, advance=1, description="[green]Force push successful!")
                                console.print("[green]Force push with lease successful![/green]")
                                return True # Force push successful
                            except subprocess.CalledProcessError as force_e:
                                force_progress_bar.update(force_task, completed=1, description="[red]Force push failed.", visible=False)
                                console.print("[bold red]Force push with lease FAILED.[/bold red]")
                                console.print(f"[red]Return code:[/red] {force_e.returncode}")
                                if force_e.stdout and force_e.stdout.strip(): console.print(f"[red]Git Stdout:[/red]\n{force_e.stdout.strip()}")
                                if force_e.stderr and force_e.stderr.strip(): console.print(f"[red]Git Stderr:[/red]\n{force_e.stderr.strip()}")
                                return False # Force push failed
                    else:
                        console.print("[yellow]Force push declined by user. Original push failed.[/yellow]")
                        return False # User declined force push
                else: # CLI mode
                    console.print("\n[bold red]CLI Mode: Push failed due to non-fast-forward.[/bold red]")
                    console.print("Manual intervention required. To resolve:")
                    console.print(f"  1. Fetch remote changes: `git fetch {remote_name}`")
                    console.print(f"  2. Rebase your local branch '{local_branch_name}' onto the remote's '{remote_branch_name}':")
                    console.print(f"     `git rebase {remote_name}/{remote_branch_name} {local_branch_name}` (or merge if preferred)")
                    console.print(f"  3. Resolve any conflicts.")
                    console.print(f"  4. Then, try running this script again to push '{local_branch_name}'.")
                    console.print("Alternatively, if you are absolutely certain you want to overwrite the remote 'main' branch:")
                    console.print(f"  `git push --force-with-lease {remote_name} {local_branch_name}:{remote_branch_name}`")
                    sys.exit(1) # Exit in CLI for non-fast-forward
            else:
                # Some other push error (not non-fast-forward)
                # The error details were already printed by the section handling initial push command failure.
                console.print(f"[bold red]Push failed due to an unexpected Git error. See details above.[/bold red]")
                sys.exit(1) # Exit for other critical push errors
        return False # Should ideally not be reached if all paths lead to return or sys.exit

def get_latest_commit_hash():
    result = run_command(["git", "rev-parse", "HEAD"], capture_output=True, quiet=True)
    return result.stdout.strip()

def get_remotes():
    result = run_command(["git", "remote", "-v"], capture_output=True, quiet=True)
    remotes_output = result.stdout.strip().split('\n') if result.stdout.strip() else []
    remotes = {}
    for line in remotes_output:
        match = re.match(r'([\w-]+)\s+(.*)\s+\((fetch|push)\)', line) # Allow hyphens in remote names
        if match:
            name, url, type = match.groups()
            if name not in remotes:
                remotes[name] = {}
            remotes[name][type] = url
    return remotes

def main():
    console.print(f"[bold magenta]Git Push Script for {TARGET_REMOTE_URL}[/bold magenta]")
    console.print(f"Target Remote Branch: [cyan]{TARGET_REMOTE_BRANCH}[/cyan] using Remote Name: [cyan]{DEFAULT_REMOTE_NAME}[/cyan]")
    console.print("-" * 50)

    actual_local_branch_pushed = "N/A"
    push_attempted_and_succeeded = False

    try:
        run_command(["git", "--version"], quiet=True)
        is_repo_result = run_command(["git", "rev-parse", "--is-inside-work-tree"], quiet=True)
        if is_repo_result.stdout.strip() != "true":
            console.print("[bold red]Error:[/bold red] Not a git repository.")
            sys.exit(1)
        console.print("[green]Git environment and repository verified.[/green]")
    except SystemExit:
        sys.exit(1) # Error already printed by run_command

    mode = console.input("Enter mode ('interactive' or 'cli'): ").strip().lower()
    if mode not in ['interactive', 'cli']:
        console.print("[bold red]Invalid mode.[/bold red]")
        sys.exit(1)

    current_local_branch = get_current_branch() # Get early for checks

    if current_local_branch == "HEAD":
        console.print("[bold red]Error:[/bold red] Current branch is 'HEAD' (detached or new repo).")
        console.print("Please checkout a named branch with commits.")
        sys.exit(1)
    
    try: # Check for commits on the current branch
        run_command(["git", "rev-parse", current_local_branch], quiet=True)
    except SystemExit: # Means branch has no commits or doesn't exist (should be caught by HEAD check mostly)
        console.print(f"[bold red]Error:[/bold red] Branch '{current_local_branch}' has no commits or cannot be resolved. Cannot push.")
        sys.exit(1)


    if mode == 'interactive':
        console.print("[bold green]Interactive Mode Selected[/bold green]")
        status = get_git_status()
        if status:
            console.print("[yellow]Uncommitted changes detected:[/yellow]")
            for line in status: console.print(f"- {line.strip()}")
            if console.input("[bold yellow]Add all changes to staging? (yes/no):[/bold yellow] ").strip().lower() == 'yes':
                git_add_all()
            else:
                console.print("[yellow]Skipping adding changes.[/yellow]")

        commit_message = console.input("[bold yellow]Enter commit message (blank to skip if already committed):[/bold yellow] ").strip()
        if commit_message:
            git_commit(commit_message)
            current_local_branch = get_current_branch() # Re-fetch if first commit created a branch
        else:
            console.print("[yellow]Skipping commit phase.[/yellow]")
        
        console.print(f"[bold blue]Local branch for push:[/bold blue] [cyan]{current_local_branch}[/cyan]")
        console.print(f"[bold blue]Target remote branch:[/bold blue] [cyan]{TARGET_REMOTE_BRANCH}[/cyan]")

        remotes = get_remotes()
        remote_name_to_use = DEFAULT_REMOTE_NAME

        if remote_name_to_use in remotes:
            current_remote_url = remotes[remote_name_to_use].get('push') or remotes[remote_name_to_use].get('fetch')
            console.print(f"[bold blue]Remote '{remote_name_to_use}' points to:[/bold blue] {current_remote_url}")
            if current_remote_url != TARGET_REMOTE_URL:
                console.print(f"[bold yellow]Warning:[/bold yellow] Script targets '{TARGET_REMOTE_URL}'.")
                if console.input(f"Update '{remote_name_to_use}' URL to '{TARGET_REMOTE_URL}'? (yes/no): ").lower() == 'yes':
                    set_remote_url(remote_name_to_use, TARGET_REMOTE_URL)
                else:
                    console.print("[bold red]Cannot push. Incorrect remote URL. Exiting.[/bold red]")
                    sys.exit(1)
            else:
                console.print(f"[green]Remote '{remote_name_to_use}' correctly configured for '{TARGET_REMOTE_URL}'.[/green]")
        else:
            console.print(f"[yellow]Remote '{remote_name_to_use}' (for '{TARGET_REMOTE_URL}') not found.[/yellow]")
            if console.input(f"Add remote '{remote_name_to_use}' with URL '{TARGET_REMOTE_URL}'? (yes/no): ").lower() == 'yes':
                add_remote(remote_name_to_use, TARGET_REMOTE_URL)
            else:
                console.print(f"[bold red]Remote '{remote_name_to_use}' required. Exiting.[/bold red]")
                sys.exit(1)
        
        push_confirm_msg = (f"[bold yellow]Push local '{current_local_branch}' to "
                            f"'{remote_name_to_use}/{TARGET_REMOTE_BRANCH}' "
                            f"(URL: {TARGET_REMOTE_URL})? (yes/no):[/bold yellow] ")
        if console.input(push_confirm_msg).strip().lower() == 'yes':
            push_result = git_push(remote_name_to_use, current_local_branch, TARGET_REMOTE_BRANCH, interactive_mode=True)
            if push_result:
                actual_local_branch_pushed = current_local_branch
                push_attempted_and_succeeded = True
            else:
                console.print("[yellow]Push operation did not complete successfully.[/yellow]")
        else:
            console.print("[yellow]Push cancelled by user.[/yellow]")

    elif mode == 'cli':
        console.print("[bold green]CLI Mode Selected[/bold green]")
        console.print(f"[bold blue]Local branch for push:[/bold blue] [cyan]{current_local_branch}[/cyan]")
        console.print(f"[bold blue]Target remote branch:[/bold blue] [cyan]{TARGET_REMOTE_BRANCH}[/cyan]")

        remote_name_to_use = DEFAULT_REMOTE_NAME
        remotes = get_remotes()

        if remote_name_to_use in remotes:
            current_remote_url = remotes[remote_name_to_use].get('push') or remotes[remote_name_to_use].get('fetch')
            if current_remote_url != TARGET_REMOTE_URL:
                console.print(f"[bold red]Error:[/bold red] Remote '{remote_name_to_use}' URL is '{current_remote_url}'. Expected '{TARGET_REMOTE_URL}'.")
                console.print(f"Fix: `git remote set-url {remote_name_to_use} {TARGET_REMOTE_URL}` or use interactive mode.")
                sys.exit(1)
            console.print(f"[bold blue]Pushing to remote '{remote_name_to_use}' (URL: {current_remote_url})[/bold blue]")
        else:
            console.print(f"[bold red]Error:[/bold red] Remote '{remote_name_to_use}' not found for '{TARGET_REMOTE_URL}'.")
            console.print(f"Fix: `git remote add {remote_name_to_use} {TARGET_REMOTE_URL}` or use interactive mode.")
            sys.exit(1)
            
        push_result = git_push(remote_name_to_use, current_local_branch, TARGET_REMOTE_BRANCH, interactive_mode=False)
        if push_result: # In CLI, if non-fast-forward, git_push would sys.exit. So this means success.
            actual_local_branch_pushed = current_local_branch
            push_attempted_and_succeeded = True
        # No 'else' needed here as git_push would have exited on major failures in CLI mode

    console.print("\n[bold underline]Push Summary[/bold underline]")
    summary_table = Table(title_style="bold", header_style="bold cyan")
    summary_table.add_column("Item", style="dim")
    summary_table.add_column("Details")

    try: summary_latest_commit = get_latest_commit_hash()
    except SystemExit: summary_latest_commit = "N/A (No commits or error)"
    
    try: summary_current_branch_post_script = get_current_branch()
    except SystemExit: summary_current_branch_post_script = "N/A (Error)"

    summary_table.add_row("Latest Commit Hash (Local HEAD)", summary_latest_commit)
    summary_table.add_row("Script operated on Local Branch", current_local_branch) # Branch at start of relevant ops

    if push_attempted_and_succeeded:
        summary_table.add_row("Push Status", "[green]Successful[/green]")
        summary_table.add_row("Pushed Local Branch", actual_local_branch_pushed)
        summary_table.add_row("Targeted Remote Branch", TARGET_REMOTE_BRANCH)
        remotes_info_after = get_remotes()
        pushed_to_url = remotes_info_after.get(DEFAULT_REMOTE_NAME, {}).get('push') or \
                        remotes_info_after.get(DEFAULT_REMOTE_NAME, {}).get('fetch')
        summary_table.add_row(f"Pushed to Remote URL ({DEFAULT_REMOTE_NAME})", pushed_to_url or TARGET_REMOTE_URL)
    else:
        summary_table.add_row("Push Status", "[yellow]Skipped, Cancelled, or Failed[/yellow]")
        summary_table.add_row("Configured Target Remote URL", TARGET_REMOTE_URL)
    
    console.print(summary_table)

if __name__ == "__main__":
    main()