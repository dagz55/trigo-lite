import subprocess
import questionary
import requests
import rich
import os
from dotenv import load_dotenv
from rich.console import Console

# Initialize Rich console
console = Console()

# Load environment variables
load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# GitHub repository URL
REPO_URL = "https://github.com/dagz55/trigo-firebase"
REPO_NAME = "trigo-firebase"  # Extract repo name from URL
REPO_OWNER = "dagz55"  # Extract owner name from URL
DEFAULT_BASE_BRANCH = "main"

def main_menu():
    while True:
        try:
            action = questionary.select(
                "What would you like to do?",
                choices=[
                    "Push Local Changes",
                    "Pull Remote Changes",
                    "Create Pull Request",
                    "List All Branches",
                    "Create New Branch",
                    "Handle Local Changes", # New menu option
                    "Exit",
                ],
            ).ask()

            if action == "Push Local Changes":
                push_changes()
            elif action == "Pull Remote Changes":
                pull_changes()
            elif action == "Create Pull Request":
                create_pull_request()
            elif action == "List All Branches":
                list_branches()
            elif action == "Create New Branch":
                create_branch()
            elif action == "Handle Local Changes": # Call new function
                handle_local_changes()
            elif action == "Exit":
                console.print("Exiting...", style="bold green")
                break
        except Exception as e:
            console.print_exception()
            console.print(f"An unexpected error occurred: {e}", style="bold red")

def run_command(command, cwd=None, capture_output=True, text=True, check=True, quiet=False):
    """
    Runs a subprocess command with basic error handling.
    Added check=True by default for most uses.
    """
    command_str = ' '.join(command)
    try:
        if not quiet:
            console.print(f"[bold blue]Running command:[/bold blue] {command_str}")

        result = subprocess.run(command, cwd=cwd, capture_output=capture_output, text=text, check=check)

        if not quiet:
            console.print(f"[green]Command successful.[/green]")
            if capture_output:
                if result.stdout and result.stdout.strip():
                    console.print("[dim]Stdout:[/dim]", result.stdout.strip())
                if result.stderr and result.stderr.strip():
                    console.print("[dim]Stderr:[/dim]", result.stderr.strip())
        return result
    except FileNotFoundError:
        console.print(f"[bold red]Error:[/bold red] Command '{command[0]}' not found. Is Git installed and in your PATH?", style="bold red")
        raise # Re-raise to be caught by calling function's exception handler
    except subprocess.CalledProcessError as e:
        # This is caught by the calling function for specific handling
        raise

def get_git_status():
    """Gets the output of git status --porcelain."""
    console.print("[bold blue]Checking Git status...[/bold blue]")
    try:
        result = run_command(["git", "status", "--porcelain"], capture_output=True, text=True, quiet=True)
        status_lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
        if status_lines:
            console.print("[yellow]Uncommitted changes detected:[/yellow]")
            for line in status_lines: console.print(f"- {line.strip()}")
        else:
            console.print("[green]No uncommitted changes.[/green]")
        return status_lines
    except subprocess.CalledProcessError as e:
         error_output = e.stderr.decode() if e.stderr else ""
         console.print(f"[bold red]Error checking status:[/bold red] {error_output}", style="bold red")
         return None # Indicate failure

def git_add_all():
    """Stages all changes."""
    console.print("[bold blue]Adding all changes...[/bold blue]")
    try:
        run_command(["git", "add", "."], capture_output=False)
        console.print("[green]All changes added.[/green]")
    except subprocess.CalledProcessError as e:
         error_output = e.stderr.decode() if e.stderr else ""
         console.print(f"[bold red]Error adding changes:[/bold red] {error_output}", style="bold red")

def git_commit(message):
    """Commits staged changes."""
    console.print("[bold blue]Committing changes...[/bold blue]")
    try:
        run_command(["git", "commit", "-m", message], capture_output=False)
        console.print(f"[green]Changes committed with message: '{message}'[/green]")
    except subprocess.CalledProcessError as e:
         error_output = e.stderr.decode() if e.stderr else ""
         console.print(f"[bold red]Error committing changes:[/bold red] {error_output}", style="bold red")

def git_stash():
    """Stashes local changes."""
    console.print("[bold blue]Stashing local changes...[/bold blue]")
    try:
        run_command(["git", "stash"], capture_output=False)
        console.print("[green]Local changes stashed.[/green]")
    except subprocess.CalledProcessError as e:
         error_output = e.stderr.decode() if e.stderr else ""
         console.print(f"[bold red]Error stashing changes:[/bold red] {error_output}", style="bold red")

def handle_local_changes():
    """Menu to handle local git changes."""
    while True:
        console.print("\n[bold underline]Handle Local Changes Menu[/bold underline]")
        action = questionary.select(
            "What would you like to do with local changes?",
            choices=[
                "Check Status",
                "Add All Changes",
                "Commit Staged Changes",
                "Stash Changes",
                "Back to Main Menu",
            ],
        ).ask()

        if action == "Check Status":
            get_git_status()
        elif action == "Add All Changes":
            git_add_all()
        elif action == "Commit Staged Changes":
            commit_message = questionary.text("Enter commit message:").ask()
            if commit_message:
                git_commit(commit_message)
            else:
                console.print("[yellow]Commit message cannot be empty. Skipping commit.[/yellow]")
        elif action == "Stash Changes":
            git_stash()
        elif action == "Back to Main Menu":
            break
        
        # Optional: Add a pause or prompt before looping again
        # questionary.press_any_key_to_continue().ask()


def push_changes():
    try:
        # Check if Git is installed
        subprocess.run(["git", "--version"], check=True, capture_output=True)

        # Check for staged changes
        result = subprocess.run(["git", "diff", "--staged", "--name-only"], capture_output=True, text=True)
        if not result.stdout.strip():
            console.print("No staged changes to commit. Stage your changes using `git add`.", style="bold yellow")
            return

        # Get commit message
        commit_message = questionary.text("Enter commit message:").ask()
        if not commit_message:
            console.print("Commit message cannot be empty.", style="bold red")
            return

        # Get current branch
        result = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True, check=True)
        branch_name = result.stdout.strip()

        # Push changes
        subprocess.run(["git", "push", "origin", branch_name], check=True)
        console.print(f"Pushed changes to branch '{branch_name}'", style="bold green")

    except subprocess.CalledProcessError as e:
        console.print(f"Git command failed: {e.stderr.decode()}", style="bold red")
    except Exception as e:
        console.print_exception()
        console.print(f"An unexpected error occurred: {e}", style="bold red")

def pull_changes():
    try:
        # Check if Git is installed
        subprocess.run(["git", "--version"], check=True, capture_output=True)

        # Get current branch
        result = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True, check=True)
        branch_name = result.stdout.strip()

        console.print(f"[bold blue]Attempting to pull latest changes from branch '{branch_name}'...[/bold blue]")

        # Pull changes
        subprocess.run(["git", "pull", "origin", branch_name], check=True)
        console.print(f"Pulled latest changes from branch '{branch_name}'", style="bold green")

    except subprocess.CalledProcessError as e:
        error_output = e.stderr.decode() if e.stderr else ""
        console.print(f"[bold red]Git command failed:[/bold red] {' '.join(e.cmd)}", style="bold red")
        console.print(f"[red]Return code:[/red] {e.returncode}", style="bold red")
        if error_output:
             console.print(f"[red]Stderr:[/red]\n{error_output}", style="bold red")

        # Check for the specific error about local changes being overwritten
        # Check for the specific error about local changes being overwritten
        if "Your local changes to the following files would be overwritten by merge" in error_output:
            console.print("\n[bold yellow]Pull blocked due to uncommitted local changes.[/bold yellow]")
            console.print("Please commit or stash your changes before pulling.")

            action = questionary.select(
                "How would you like to handle this?",
                choices=[
                    "Stash local changes and pull",
                    "Abort pull (handle manually)",
                ],
            ).ask()

            if action == "Stash local changes and pull":
                try:
                    console.print("[bold blue]Stashing local changes...[/bold blue]")
                    subprocess.run(["git", "stash"], check=True)
                    console.print("[green]Local changes stashed.[/green]")

                    console.print(f"[bold blue]Attempting to pull again after stashing...[/bold blue]")
                    subprocess.run(["git", "pull", "origin", branch_name], check=True)
                    console.print(f"[green]Pulled latest changes from branch '{branch_name}'.[/green]")

                    console.print("[bold blue]Applying stashed changes...[/bold blue]")
                    # Use git stash pop. Conflicts might occur here.
                    stash_pop_result = subprocess.run(["git", "stash", "pop"], capture_output=True, text=True)
                    if stash_pop_result.returncode != 0:
                         console.print("[bold yellow]Applying stashed changes resulted in conflicts.[/bold yellow]")
                         console.print("Please resolve the conflicts manually and then commit the changes.")
                         if stash_pop_result.stdout: console.print(f"[yellow]Stdout:[/yellow]\n{stash_pop_result.stdout}", style="yellow")
                         if stash_pop_result.stderr: console.print(f"[yellow]Stderr:[/yellow]\n{stash_pop_result.stderr}", style="yellow")
                    else:
                         console.print("[green]Stashed changes applied successfully.[/green]")

                except subprocess.CalledProcessError as stash_e:
                    console.print(f"[bold red]Git command failed during stash/pull/pop sequence:[/bold red] {' '.join(stash_e.cmd)}", style="bold red")
                    console.print(f"[red]Return code:[/red] {stash_e.returncode}", style="bold red")
                    if stash_e.stdout: console.print(f"[red]Stdout:[/red]\n{stash_e.stdout.decode()}", style="bold red")
                    if stash_e.stderr: console.print(f"[red]Stderr:[/red]\n{stash_e.stderr.decode()}", style="bold red")
                except Exception as stash_e:
                    console.print_exception()
                    console.print(f"An unexpected error occurred during stash/pull/pop sequence: {stash_e}", style="bold red")

            elif action == "Abort pull (handle manually)":
                console.print("[yellow]Pull aborted by user. Please handle local changes manually.[/yellow]")

        # Check for the specific error about divergent branches
        elif "fatal: Need to specify how to reconcile divergent branches." in error_output:
             console.print("\n[bold yellow]Pull blocked due to divergent branches.[/bold yellow]")
             console.print("Your local branch and the remote branch have diverged.")

             action = questionary.select(
                 "How would you like to reconcile divergent branches?",
                 choices=[
                     "Merge (git pull --no-rebase)",
                     "Rebase (git pull --rebase)",
                     "Fast-forward only (git pull --ff-only)",
                     "Abort pull (handle manually)",
                 ],
             ).ask()

             try:
                 if action == "Merge (git pull --no-rebase)":
                     console.print("[bold blue]Attempting to merge remote changes...[/bold blue]")
                     subprocess.run(["git", "pull", "origin", branch_name, "--no-rebase"], check=True)
                     console.print(f"[green]Pulled and merged latest changes from branch '{branch_name}'.[/green]")
                 elif action == "Rebase (git pull --rebase)":
                     console.print("[bold blue]Attempting to rebase local changes onto remote...[/bold blue]")
                     subprocess.run(["git", "pull", "origin", branch_name, "--rebase"], check=True)
                     console.print(f"[green]Pulled and rebased local changes onto branch '{branch_name}'.[/green]")
                 elif action == "Fast-forward only (git pull --ff-only)":
                     console.print("[bold blue]Attempting fast-forward pull...[/bold blue]")
                     subprocess.run(["git", "pull", "origin", branch_name, "--ff-only"], check=True)
                     console.print(f"[green]Fast-forwarded branch '{branch_name}'.[/green]")
                 elif action == "Abort pull (handle manually)":
                     console.print("[yellow]Pull aborted by user. Please handle divergent branches manually.[/yellow]")

             except subprocess.CalledProcessError as resolve_e:
                 console.print(f"[bold red]Git command failed during divergence resolution:[/bold red] {' '.join(resolve_e.cmd)}", style="bold red")
                 console.print(f"[red]Return code:[/red] {resolve_e.returncode}", style="bold red")
                 if resolve_e.stdout: console.print(f"[red]Stdout:[/red]\n{resolve_e.stdout.decode()}", style="bold red")
                 if resolve_e.stderr: console.print(f"[red]Stderr:[/red]\n{resolve_e.stderr.decode()}", style="bold red")
                 console.print("[bold red]Automatic resolution failed. Please resolve manually.[/bold red]")
             except Exception as resolve_e:
                 console.print_exception()
                 console.print(f"An unexpected error occurred during divergence resolution: {resolve_e}", style="bold red")


        # If it's not a specifically handled error, print the general error
        else:
            console.print("[bold red]An unhandled Git error occurred during pull.[/bold red]")
            # The initial error output was already printed above.


    except Exception as e:
        console.print_exception()
        console.print(f"An unexpected error occurred: {e}", style="bold red")

def create_pull_request():
    try:
        # Check if Git is installed
        subprocess.run(["git", "--version"], check=True, capture_output=True)

        # Get current branch
        result = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True, check=True)
        branch_name = result.stdout.strip()

        # Check if GITHUB_TOKEN is available
        if not GITHUB_TOKEN:
            console.print("GitHub token not found. Please set GITHUB_TOKEN in .env or as an environment variable.", style="bold red")
            return

        # Create pull request
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
        }
        data = {
            "title": f"Pull Request from {branch_name} to {DEFAULT_BASE_BRANCH}",
            "head": branch_name,
            "base": DEFAULT_BASE_BRANCH,
            "body": f"Pull request from branch {branch_name} to {DEFAULT_BASE_BRANCH}",
        }
        response = requests.post(f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls", headers=headers, json=data)

        if response.status_code == 201:
            console.print("Pull request created successfully!", style="bold green")
            console.print(f"URL: {response.json()['html_url']}", style="bold blue")
        else:
            console.print(f"Failed to create pull request. Status code: {response.status_code}", style="bold red")
            console.print(f"Response: {response.text}", style="bold red")

    except subprocess.CalledProcessError as e:
        console.print(f"Git command failed: {e.stderr.decode()}", style="bold red")
    except requests.exceptions.RequestException as e:
        console.print(f"API request failed: {e}", style="bold red")
    except Exception as e:
        console.print_exception()
        console.print(f"An unexpected error occurred: {e}", style="bold red")

def list_branches():
    try:
        # Check if Git is installed
        subprocess.run(["git", "--version"], check=True, capture_output=True)

        # List branches
        result = subprocess.run(["git", "branch", "-a"], capture_output=True, text=True, check=True)
        branches = result.stdout.strip().split("\n")
        console.print("Available branches:", style="bold blue")
        for branch in branches:
            console.print(branch.strip())

    except subprocess.CalledProcessError as e:
        console.print(f"Git command failed: {e.stderr.decode()}", style="bold red")
    except Exception as e:
        console.print_exception()
        console.print(f"An unexpected error occurred: {e}", style="bold red")

def create_branch():
    try:
        # Check if Git is installed
        subprocess.run(["git", "--version"], check=True, capture_output=True)

        # Get new branch name
        branch_name = questionary.text("Enter new branch name:").ask()
        if not branch_name:
            console.print("Branch name cannot be empty.", style="bold red")
            return

        # Create new branch
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        console.print(f"Created new branch '{branch_name}'", style="bold green")

    except subprocess.CalledProcessError as e:
        console.print(f"Git command failed: {e.stderr.decode()}", style="bold red")
    except Exception as e:
        console.print_exception()
        console.print(f"An unexpected error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main_menu()
