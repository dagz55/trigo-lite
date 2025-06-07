#!/bin/bash

# Script to push your project to GitHub
# Target repository: dagz55/trigo-lite.git

REPO_URL="https://github.com/dagz55/trigo-lite.git"
BRANCH_NAME="main" # Updated to match the actual default branch

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git first."
    exit 1
fi

# Initialize Git repository if it's not already one
if [ ! -d ".git" ]; then
    echo "Initializing new Git repository..."
    git init -b "$BRANCH_NAME"
    if [ $? -ne 0 ]; then
        echo "Failed to initialize git repository. If a default branch name other than '$BRANCH_NAME' was created, adjust BRANCH_NAME in this script."
        exit 1
    fi
    echo "Git repository initialized on branch '$BRANCH_NAME'."
fi

# Set up the remote if not already set or if URL is different
CURRENT_REMOTE_URL=$(git remote get-url origin 2>/dev/null)
REMOTE_EXISTS=$?

if [ "$REMOTE_EXISTS" -ne 0 ]; then
    echo "Adding remote 'origin' with URL: $REPO_URL"
    git remote add origin "$REPO_URL"
    if [ $? -ne 0 ]; then echo "Failed to add remote 'origin'."; exit 1; fi
elif [ "$CURRENT_REMOTE_URL" != "$REPO_URL" ]; then
    echo "Updating remote 'origin' URL to: $REPO_URL"
    git remote set-url origin "$REPO_URL"
    if [ $? -ne 0 ]; then echo "Failed to update remote 'origin' URL."; exit 1; fi
else
    echo "Remote 'origin' is already configured to $REPO_URL."
fi

# Add all files to staging
echo "Adding all files to staging..."
git add .
if [ $? -ne 0 ]; then echo "Failed to add files."; exit 1; fi

# Commit the changes
DEFAULT_COMMIT_MESSAGE="Update project files"
COMMIT_MESSAGE="$DEFAULT_COMMIT_MESSAGE"

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes staged for commit. If you want to push existing commits, you can run 'git push' manually or re-run this script after making new changes."
else
    read -p "Enter commit message (default: $DEFAULT_COMMIT_MESSAGE): " USER_INPUT_MESSAGE
    if [ ! -z "$USER_INPUT_MESSAGE" ]; then
        COMMIT_MESSAGE="$USER_INPUT_MESSAGE"
    fi
    echo "Committing files with message: $COMMIT_MESSAGE"
    git commit -m "$COMMIT_MESSAGE"
    if [ $? -ne 0 ]; then
        echo "Failed to commit files. This might be because there are no actual changes to commit, or a git pre-commit hook failed."
        # Exit if commit truly failed and was not due to no changes
        if ! git diff --staged --quiet; then
            exit 1
        fi
    fi
fi

# Push the changes to GitHub
echo "Pushing to $BRANCH_NAME branch on remote 'origin'..."
git push -u origin "$BRANCH_NAME"
PUSH_EXIT_CODE=$?

if [ $PUSH_EXIT_CODE -ne 0 ]; then
    # Check for non-fast-forward error
    GIT_PUSH_OUTPUT=$(git push -u origin "$BRANCH_NAME" 2>&1)
    if echo "$GIT_PUSH_OUTPUT" | grep -q "fetch first"; then
        echo "Push failed: Remote contains work that you do not have locally."
        echo "You need to pull and merge the remote changes first."
        read -p "Do you want to pull and merge remote changes now? (y/n): " PULL_CONFIRM
        if [ "$PULL_CONFIRM" = "y" ] || [ "$PULL_CONFIRM" = "Y" ]; then
            git pull origin "$BRANCH_NAME"
            if [ $? -ne 0 ]; then
                echo "Failed to pull and merge remote changes. Please resolve any conflicts and try again."
                exit 1
            fi
            echo "Retrying push..."
            git push -u origin "$BRANCH_NAME"
            if [ $? -ne 0 ]; then
                echo "Push still failed. Please check for conflicts or other issues."
                exit 1
            fi
        else
            echo "Aborting push. Please pull and merge manually, then re-run this script."
            exit 1
        fi
    else
        echo "Failed to push to GitHub. Please ensure:"
        echo "1. The remote repository $REPO_URL exists and you have push permissions."
        echo "2. Your local branch '$BRANCH_NAME' is up-to-date or can be fast-forwarded."
        echo "3. You have authenticated with Git for GitHub (e.g., using a Personal Access Token or SSH key)."
        exit 1
    fi
fi

echo ""
echo "Successfully pushed project to $REPO_URL"
echo "You can view your repository at: $REPO_URL"
