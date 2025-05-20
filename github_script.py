import subprocess
import os
import requests
from dotenv import load_dotenv
import questionary
from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax
from rich.text import Text

console = Console()

# Load environment variables
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_URL = "https://github.com/dagz55/trigo-firebase"
DEFAULT_BASE_BRANCH = "main"

def run_git_command(command):
    """Runs a git command and handles errors."""
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        console.print(Panel(f"Error executing git command: {' '.join(command)}\n{e.stderr}", title="[bold red]Git Error[/bold red]", expand=False))
        return None
    except FileNotFoundError:
        console.print(Panel("Git command not found. Is Git installed and in your PATH?", title="[bold red]Git Not Found[/bold red]", expand=False))
        return None

def get_github_headers():
    """Returns headers for GitHub API requests."""
    if not GITHUB_TOKEN:
        console.print(Panel("GitHub token not found. Please set GITHUB_TOKEN in your .env file or provide it when prompted.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        return {}
    return {"Authorization": f"token {GITHUB_TOKEN}"}

def get_branches():
    """Lists local branches."""
    branches = run_git_command(["git", "branch", "--format=%(refname:short)"])
    if branches is not None:
        return branches.split('\n')
    return []

def select_branch(branches, prompt="Select a branch:"):
    """Allows the user to select a branch from a list."""
    if not branches:
        console.print(Panel("No branches found.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        return None
    branch = questionary.select(prompt, choices=branches).ask()
    return branch

def push_changes():
    """Pushes local changes to a remote branch."""
    console.print(Panel("Push Local Changes", title="[bold blue]Feature[/bold blue]", expand=False))
    branches = get_branches()
    if not branches:
        return

    current_branch = run_git_command(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    if current_branch not in branches:
         console.print(Panel(f"Current branch '{current_branch}' not found in local branches.", title="[bold red]Error[/bold red]", expand=False))
         return

    branch_to_push = questionary.select("Select branch to push:", choices=branches, default=current_branch).ask()
    if not branch_to_push:
        return

    commit_message = questionary.text("Enter commit message:").ask()
    if not commit_message:
        console.print(Panel("Commit message cannot be empty.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        return

    # Check for staged changes
    staged_files = run_git_command(["git", "diff", "--cached", "--name-only"])
    # Check for staged changes
    staged_files = run_git_command(["git", "diff", "--cached", "--name-only"])
    if not staged_files:
        console.print(Panel("No staged changes to commit.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        stage_all = questionary.confirm("No staged changes. Do you want to stage all changes and commit?").ask()
        if stage_all:
            add_result = run_git_command(["git", "add", "."])
            if add_result is None:
                return # Error during git add
            staged_files = run_git_command(["git", "diff", "--cached", "--name-only"])
            if not staged_files:
                 console.print(Panel("Still no staged changes after adding all files.", title="[bold red]Error[/bold red]", expand=False))
                 return
        else:
            return

    commit_result = run_git_command(["git", "commit", "-m", commit_message])
    if commit_result is None:
        return # Error during git commit

    console.print(Panel(f"Commit successful:\n{commit_result}", title="[bold green]Commit Info[/bold green]", expand=False))

    # Check for remote existence and access
    remote_check = run_git_command(["git", "ls-remote", "origin"])
    if remote_check is None:
        console.print(Panel("Could not access remote 'origin'. Please check your remote URL and network connection.", title="[bold red]Remote Access Error[/bold red]", expand=False))
        return

    push_result = run_git_command(["git", "push", "origin", branch_to_push])
    if push_result is not None:
        console.print(Panel(f"Push successful:\n{push_result}", title="[bold green]Success[/bold green]", expand=False))
    else:
        # Check for push conflicts
        status_check = run_git_command(["git", "status"])
        if status_check and "Your branch is ahead of 'origin" in status_check and "have divergent branches" in status_check:
             console.print(Panel("Push failed due to divergent branches. You may need to pull and merge changes first.", title="[bold red]Push Conflict[/bold red]", expand=False))
        elif status_check and "Authentication failed" in status_check:
             console.print(Panel("Push failed: Authentication failed. Please check your GitHub token.", title="[bold red]Authentication Error[/bold red]", expand=False))

def pull_changes():
    """Pulls the latest changes from a remote branch."""
    console.print(Panel("Pull Remote Changes", title="[bold blue]Feature[/bold blue]", expand=False))
    branches = get_branches()
    if not branches:
        return

    branch_to_pull = select_branch(branches, prompt="Select branch to pull from:")
    if not branch_to_pull:
        return

    # Check for unstaged changes
    unstaged_changes = run_git_command(["git", "status", "--porcelain"])
    if unstaged_changes:
        console.print(Panel("You have unstaged changes. Please commit or stash them before pulling.", title="[bold yellow]Unstaged Changes[/bold yellow]", expand=False))
        return

    # Check for remote existence and access
    remote_check = run_git_command(["git", "ls-remote", "origin"])
    if remote_check is None:
        console.print(Panel("Could not access remote 'origin'. Please check your remote URL and network connection.", title="[bold red]Remote Access Error[/bold red]", expand=False))
        return

    pull_result = run_git_command(["git", "pull", "origin", branch_to_pull])
    if pull_result is not None:
        console.print(Panel(f"Pull successful:\n{pull_result}", title="[bold green]Success[/bold green]", expand=False))
    else:
        # Check for merge conflicts
        status_check = run_git_command(["git", "status"])
        if status_check and "Merge conflict" in status_check:
            console.print(Panel("Pull failed due to merge conflicts. Please resolve conflicts manually.", title="[bold red]Merge Conflict[/bold red]", expand=False))
        elif status_check and "Authentication failed" in status_check:
             console.print(Panel("Pull failed: Authentication failed. Please check your GitHub token.", title="[bold red]Authentication Error[/bold red]", expand=False))

def create_pull_request():
    """Creates a Pull Request on GitHub."""
    console.print(Panel("Create Pull Request", title="[bold blue]Feature[/bold blue]", expand=False))
    headers = get_github_headers()
    if not headers:
        return

    branches = get_branches()
    if not branches:
        return

    head_branch = select_branch(branches, prompt="Select the head branch for the PR:")
    if not head_branch:
        return

    base_branch = questionary.text("Enter the base branch for the PR:", default=DEFAULT_BASE_BRANCH).ask()
    if not base_branch:
        console.print(Panel("Base branch cannot be empty.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        return

    pr_title = questionary.text("Enter the PR title:").ask()
    if not pr_title:
        console.print(Panel("PR title cannot be empty.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        return

    pr_body = questionary.text("Enter the PR body (optional):").ask()

    owner, repo = REPO_URL.split('/')[-2:]

    api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    data = {
        "title": pr_title,
        "body": pr_body,
        "head": head_branch,
        "base": base_branch,
    }

    try:
        response = requests.post(api_url, headers=headers, json=data)
        response.raise_for_status()  # Raise an exception for bad status codes
        pr_data = response.json()
        console.print(Panel(f"Pull Request created successfully:\n{pr_data['html_url']}", title="[bold green]Success[/bold green]", expand=False))
    except requests.exceptions.RequestException as e:
        console.print(Panel(f"Error creating Pull Request: {e}", title="[bold red]API Error[/bold red]", expand=False))
        if response.status_code == 401:
             console.print(Panel("Authentication failed. Please check your GitHub token and ensure it has the necessary permissions.", title="[bold red]Authentication Error[/bold red]", expand=False))
        elif response.status_code == 422:
             console.print(Panel(f"Validation failed: {response.json().get('message', '')}", title="[bold red]Validation Error[/bold red]", expand=False))
        elif response.status_code == 404:
             console.print(Panel("Repository or branches not found. Please check the repository URL and branch names.", title="[bold red]Not Found Error[/bold red]", expand=False))

def list_branches():
    """Lists all branches (local and remote)."""
    console.print(Panel("List All Branches", title="[bold blue]Feature[/bold blue]", expand=False))
    local_branches = run_git_command(["git", "branch", "--format=%(refname:short)"])
    remote_branches = run_git_command(["git", "branch", "-r", "--format=%(refname:short)"])

    if local_branches is not None:
        console.print(Panel(f"Local Branches:\n{local_branches}", title="[bold blue]Local[/bold blue]", expand=False))
    if remote_branches is not None:
        console.print(Panel(f"Remote Branches:\n{remote_branches}", title="[bold blue]Remote[/bold blue]", expand=False))

def create_new_branch():
    """Creates a new branch from the current HEAD."""
    console.print(Panel("Create New Branch", title="[bold blue]Feature[/bold blue]", expand=False))
    new_branch_name = questionary.text("Enter the name for the new branch:").ask()
    if not new_branch_name:
        console.print(Panel("Branch name cannot be empty.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        return

    branches = get_branches()
    if new_branch_name in branches:
        console.print(Panel(f"Branch '{new_branch_name}' already exists.", title="[bold yellow]Warning[/bold yellow]", expand=False))
        return

    create_result = run_git_command(["git", "branch", new_branch_name])
    if create_result is not None:
        console.print(Panel(f"Branch '{new_branch_name}' created successfully.", title="[bold green]Success[/bold green]", expand=False))
        checkout = questionary.confirm(f"Do you want to checkout the new branch '{new_branch_name}'?").ask()
        if checkout:
            checkout_result = run_git_command(["git", "checkout", new_branch_name])
            if checkout_result is not None:
                console.print(Panel(f"Checked out to branch '{new_branch_name}'.", title="[bold green]Success[/bold green]", expand=False))


def main_menu():
    """Displays the main menu and handles user input."""
    while True:
        console.print(Panel("GitHub Interaction Script", title="[bold magenta]Menu[/bold magenta]", expand=False))
        choice = questionary.select(
            "Choose an action:",
            choices=[
                "Push Local Changes",
                "Pull Remote Changes",
                "Create Pull Request",
                "List All Branches",
                "Create New Branch",
                "Exit"
            ]
        ).ask()

        if choice == "Push Local Changes":
            push_changes()
        elif choice == "Pull Remote Changes":
            pull_changes()
        elif choice == "Create Pull Request":
            create_pull_request()
        elif choice == "List All Branches":
            list_branches()
        elif choice == "Create New Branch":
            create_new_branch()
        elif choice == "Exit":
            console.print(Panel("Exiting script. Goodbye!", title="[bold blue]Info[/bold blue]", expand=False))
            break

if __name__ == "__main__":
    try:
        main_menu()
    except Exception as e:
        console.print(Panel(f"An unexpected error occurred: {e}", title="[bold red]Unexpected Error[/bold red]", expand=False))
