
import shutil
import os
import platform

def clean_next_directory():
    """Deletes the .next directory if it exists."""
    next_dir = ".next"
    if os.path.exists(next_dir) and os.path.isdir(next_dir):
        try:
            shutil.rmtree(next_dir)
            print(f"Successfully deleted '{next_dir}' directory.")
        except OSError as e:
            print(f"Error deleting '{next_dir}': {e.filename} - {e.strerror}.")
            print("Please ensure no processes are using the .next directory (e.g., dev server is stopped).")
            if platform.system() == "Windows":
                print("On Windows, file locking can be an issue. Try closing your IDE or terminal and running the script again as admin.")
    else:
        print(f"'{next_dir}' directory not found or is not a directory.")

if __name__ == "__main__":
    print("Attempting to clean the Next.js build cache...")
    print("IMPORTANT: Please ensure your Next.js development server is STOPPED before proceeding.")
    
    # Optional: Add a confirmation step
    # confirm = input(f"Are you sure you want to delete the '.next' directory? (yes/no): ").strip().lower()
    # if confirm == 'yes':
    # clean_next_directory()
    # else:
    #     print("Operation cancelled by user.")

    clean_next_directory()
    
    print("\nCache cleaning process complete.")
    print("You can now restart your Next.js development server (e.g., 'npm run dev' or 'yarn dev').")
