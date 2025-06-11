#!/usr/bin/env python3
"""
macOS File Cleanup Script
A comprehensive tool for finding and cleaning up large files on macOS systems.

Features:
- Find files 1GB or larger
- Display top 10 largest files
- Real-time file deletion during search
- Runtime countdown display
- Comprehensive error handling
- Detailed summary logging
"""

import os
import sys
import time
import threading
import argparse
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Tuple, Optional, Dict, Any
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed
import signal
import json
import traceback


@dataclass
class FileInfo:
    """Data class to store file information."""
    path: str
    size: int
    modified_time: float
    is_accessible: bool = True
    error_message: Optional[str] = None


class FileCleanupStats:
    """Class to track cleanup statistics."""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.files_scanned = 0
        self.files_deleted = 0
        self.bytes_freed = 0
        self.errors_encountered = 0
        self.directories_scanned = 0
        self.large_files_found = 0
        self.permission_errors = 0
        self.io_errors = 0
        self.other_errors = 0
        self.interrupted = False
        self.completion_status = "INCOMPLETE"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert stats to dictionary for logging."""
        runtime = datetime.now() - self.start_time
        return {
            "start_time": self.start_time.isoformat(),
            "runtime_seconds": runtime.total_seconds(),
            "completion_status": self.completion_status,
            "files_scanned": self.files_scanned,
            "files_deleted": self.files_deleted,
            "bytes_freed": self.bytes_freed,
            "large_files_found": self.large_files_found,
            "directories_scanned": self.directories_scanned,
            "errors": {
                "total": self.errors_encountered,
                "permission_errors": self.permission_errors,
                "io_errors": self.io_errors,
                "other_errors": self.other_errors
            },
            "interrupted": self.interrupted
        }


class CountdownTimer:
    """Thread-safe countdown timer for runtime display."""
    
    def __init__(self):
        self.start_time = time.time()
        self.running = True
        self.lock = threading.Lock()
    
    def stop(self):
        """Stop the countdown timer."""
        with self.lock:
            self.running = False
    
    def get_elapsed_time(self) -> str:
        """Get formatted elapsed time."""
        elapsed = time.time() - self.start_time
        hours, remainder = divmod(int(elapsed), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    
    def display_loop(self):
        """Main display loop for countdown timer."""
        while True:
            with self.lock:
                if not self.running:
                    break
            
            elapsed_time = self.get_elapsed_time()
            print(f"\r⏱️  Runtime: {elapsed_time} | Scanning files...", end="", flush=True)
            time.sleep(1)


class MacOSFileCleanup:
    """Main class for macOS file cleanup operations."""
    
    def __init__(self, target_directory: str, min_size_gb: float = 1.0, 
                 interactive: bool = True, dry_run: bool = False):
        self.target_directory = Path(target_directory).resolve()
        self.min_size_bytes = int(min_size_gb * 1024 * 1024 * 1024)  # Convert GB to bytes
        self.interactive = interactive
        self.dry_run = dry_run
        self.stats = FileCleanupStats()
        self.large_files: List[FileInfo] = []
        self.timer = CountdownTimer()
        self.shutdown_requested = False
        
        # Setup logging
        self.setup_logging()
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def setup_logging(self):
        """Setup comprehensive logging configuration."""
        log_filename = f"file_cleanup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        # Create logs directory if it doesn't exist
        log_dir = Path("cleanup_logs")
        log_dir.mkdir(exist_ok=True)
        log_path = log_dir / log_filename
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_path, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger(__name__)
        self.log_file_path = log_path
        
        self.logger.info("="*60)
        self.logger.info("macOS File Cleanup Script Started")
        self.logger.info(f"Target Directory: {self.target_directory}")
        self.logger.info(f"Minimum File Size: {self.min_size_bytes / (1024**3):.2f} GB")
        self.logger.info(f"Interactive Mode: {self.interactive}")
        self.logger.info(f"Dry Run Mode: {self.dry_run}")
        self.logger.info("="*60)
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        self.logger.warning(f"Received signal {signum}. Initiating graceful shutdown...")
        self.shutdown_requested = True
        self.stats.interrupted = True
        self.timer.stop()
    
    def format_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format."""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.2f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} PB"
    
    def is_safe_to_delete(self, file_path: Path) -> Tuple[bool, str]:
        """
        Check if a file is safe to delete based on macOS system considerations.
        
        Returns:
            Tuple of (is_safe, reason)
        """
        try:
            path_str = str(file_path).lower()
            
            # System critical directories and files
            critical_paths = [
                '/system/', '/usr/bin/', '/usr/sbin/', '/bin/', '/sbin/',
                '/library/application support/', '/library/frameworks/',
                '/library/system/', '/private/var/db/', '/private/etc/',
                '/applications/', '/library/preferences/'
            ]
            
            # Check if file is in critical system location
            for critical_path in critical_paths:
                if critical_path in path_str:
                    return False, f"File in critical system directory: {critical_path}"
            
            # Check for system file extensions
            system_extensions = {'.dylib', '.framework', '.kext', '.plist'}
            if file_path.suffix.lower() in system_extensions:
                return False, f"System file type: {file_path.suffix}"
            
            # Check if file is currently in use (basic check)
            try:
                with open(file_path, 'rb') as f:
                    pass  # Just try to open for reading
            except PermissionError:
                return False, "File may be in use or protected"
            
            # Additional macOS-specific checks
            if file_path.name.startswith('.'):
                return False, "Hidden system file"
            
            return True, "Safe to delete"
            
        except Exception as e:
            return False, f"Error checking file safety: {str(e)}"
    
    def get_file_info(self, file_path: Path) -> Optional[FileInfo]:
        """
        Get file information with comprehensive error handling.
        
        Returns:
            FileInfo object or None if file cannot be accessed
        """
        try:
            stat_info = file_path.stat()
            
            # Skip if file is smaller than minimum size
            if stat_info.st_size < self.min_size_bytes:
                return None
            
            return FileInfo(
                path=str(file_path),
                size=stat_info.st_size,
                modified_time=stat_info.st_mtime,
                is_accessible=True
            )
            
        except PermissionError as e:
            self.stats.permission_errors += 1
            self.logger.warning(f"Permission denied: {file_path} - {str(e)}")
            return FileInfo(
                path=str(file_path),
                size=0,
                modified_time=0,
                is_accessible=False,
                error_message=f"Permission denied: {str(e)}"
            )
        except OSError as e:
            self.stats.io_errors += 1
            self.logger.warning(f"OS error accessing {file_path}: {str(e)}")
            return FileInfo(
                path=str(file_path),
                size=0,
                modified_time=0,
                is_accessible=False,
                error_message=f"OS error: {str(e)}"
            )
        except Exception as e:
            self.stats.other_errors += 1
            self.logger.error(f"Unexpected error accessing {file_path}: {str(e)}")
            return FileInfo(
                path=str(file_path),
                size=0,
                modified_time=0,
                is_accessible=False,
                error_message=f"Unexpected error: {str(e)}"
            )
    
    def scan_directory(self, directory: Path) -> List[FileInfo]:
        """
        Recursively scan directory for large files with error handling.
        
        Returns:
            List of FileInfo objects for large files
        """
        large_files = []
        
        try:
            self.stats.directories_scanned += 1
            
            # Use os.walk for better performance and error handling
            for root, dirs, files in os.walk(directory):
                if self.shutdown_requested:
                    break
                
                # Filter out system directories that should be avoided
                dirs[:] = [d for d in dirs if not d.startswith('.') and 
                          d not in {'System', 'private', 'dev', 'proc'}]
                
                root_path = Path(root)
                
                for filename in files:
                    if self.shutdown_requested:
                        break
                    
                    try:
                        file_path = root_path / filename
                        self.stats.files_scanned += 1
                        
                        file_info = self.get_file_info(file_path)
                        if file_info and file_info.is_accessible and file_info.size >= self.min_size_bytes:
                            large_files.append(file_info)
                            self.stats.large_files_found += 1
                            
                            # Log discovery of large file
                            self.logger.info(f"Large file found: {file_path} ({self.format_size(file_info.size)})")
                        
                        # Update progress every 1000 files
                        if self.stats.files_scanned % 1000 == 0:
                            self.logger.info(f"Progress: {self.stats.files_scanned} files scanned, "
                                           f"{self.stats.large_files_found} large files found")
                    
                    except Exception as e:
                        self.stats.other_errors += 1
                        self.logger.error(f"Error processing file {filename} in {root}: {str(e)}")
                        continue
        
        except PermissionError as e:
            self.stats.permission_errors += 1
            self.logger.warning(f"Permission denied accessing directory {directory}: {str(e)}")
        except Exception as e:
            self.stats.other_errors += 1
            self.logger.error(f"Error scanning directory {directory}: {str(e)}")
        
        return large_files
    
    def display_top_files(self, files: List[FileInfo], count: int = 10):
        """Display top largest files in a formatted table."""
        if not files:
            print("\n📁 No large files found.")
            return
        
        # Sort files by size (descending)
        sorted_files = sorted([f for f in files if f.is_accessible], 
                            key=lambda x: x.size, reverse=True)
        
        print(f"\n📊 Top {min(count, len(sorted_files))} Largest Files:")
        print("="*80)
        print(f"{'#':<3} {'Size':<12} {'Path':<60}")
        print("-"*80)
        
        for i, file_info in enumerate(sorted_files[:count], 1):
            size_str = self.format_size(file_info.size)
            path_str = file_info.path
            if len(path_str) > 55:
                path_str = "..." + path_str[-52:]
            
            print(f"{i:<3} {size_str:<12} {path_str}")
        
        print("="*80)
    
    def delete_file_safely(self, file_info: FileInfo) -> bool:
        """
        Safely delete a file with comprehensive error handling.
        
        Returns:
            True if file was deleted successfully, False otherwise
        """
        try:
            file_path = Path(file_info.path)
            
            # Double-check file safety before deletion
            is_safe, reason = self.is_safe_to_delete(file_path)
            if not is_safe:
                self.logger.warning(f"Skipping unsafe file {file_path}: {reason}")
                return False
            
            if self.dry_run:
                self.logger.info(f"DRY RUN: Would delete {file_path} ({self.format_size(file_info.size)})")
                return True
            
            # Attempt to delete the file
            file_path.unlink()
            
            self.stats.files_deleted += 1
            self.stats.bytes_freed += file_info.size
            
            self.logger.info(f"✅ Deleted: {file_path} ({self.format_size(file_info.size)})")
            return True
            
        except PermissionError as e:
            self.stats.permission_errors += 1
            self.logger.error(f"❌ Permission denied deleting {file_info.path}: {str(e)}")
            return False
        except OSError as e:
            self.stats.io_errors += 1
            self.logger.error(f"❌ OS error deleting {file_info.path}: {str(e)}")
            return False
        except Exception as e:
            self.stats.other_errors += 1
            self.logger.error(f"❌ Unexpected error deleting {file_info.path}: {str(e)}")
            return False
    
    def interactive_deletion(self, files: List[FileInfo]):
        """Handle interactive file deletion with user prompts."""
        if not files:
            return
        
        accessible_files = [f for f in files if f.is_accessible]
        if not accessible_files:
            print("\n⚠️  No accessible files to delete.")
            return
        
        print(f"\n🗑️  Interactive Deletion Mode")
        print(f"Found {len(accessible_files)} large files that can be deleted.")
        
        for i, file_info in enumerate(accessible_files, 1):
            if self.shutdown_requested:
                break
            
            file_path = Path(file_info.path)
            size_str = self.format_size(file_info.size)
            
            print(f"\n[{i}/{len(accessible_files)}] File: {file_path}")
            print(f"Size: {size_str}")
            print(f"Modified: {datetime.fromtimestamp(file_info.modified_time).strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Check if file is safe to delete
            is_safe, reason = self.is_safe_to_delete(file_path)
            if not is_safe:
                print(f"⚠️  UNSAFE TO DELETE: {reason}")
                continue
            
            while True:
                try:
                    choice = input("Delete this file? (y/n/q/a): ").lower().strip()
                    
                    if choice == 'q':
                        print("Quitting interactive deletion.")
                        return
                    elif choice == 'a':
                        print("Deleting all remaining files...")
                        # Delete current file and all remaining
                        for remaining_file in accessible_files[i-1:]:
                            if self.shutdown_requested:
                                break
                            self.delete_file_safely(remaining_file)
                        return
                    elif choice == 'y':
                        self.delete_file_safely(file_info)
                        break
                    elif choice == 'n':
                        print("Skipping file.")
                        break
                    else:
                        print("Please enter 'y' (yes), 'n' (no), 'q' (quit), or 'a' (all).")
                
                except KeyboardInterrupt:
                    print("\nInterrupted by user.")
                    self.shutdown_requested = True
                    return
                except Exception as e:
                    self.logger.error(f"Error in interactive mode: {str(e)}")
                    break
    
    def run_cleanup(self):
        """Main cleanup execution method."""
        try:
            # Validate target directory
            if not self.target_directory.exists():
                raise FileNotFoundError(f"Target directory does not exist: {self.target_directory}")
            
            if not self.target_directory.is_dir():
                raise NotADirectoryError(f"Target path is not a directory: {self.target_directory}")
            
            # Start countdown timer in separate thread
            timer_thread = threading.Thread(target=self.timer.display_loop, daemon=True)
            timer_thread.start()
            
            self.logger.info("🔍 Starting file scan...")
            
            # Scan for large files
            self.large_files = self.scan_directory(self.target_directory)
            
            # Stop timer
            self.timer.stop()
            print()  # New line after timer
            
            self.logger.info(f"📊 Scan completed. Found {len(self.large_files)} large files.")
            
            # Display top 10 largest files
            self.display_top_files(self.large_files, 10)
            
            # Handle file deletion
            if self.large_files and not self.shutdown_requested:
                accessible_files = [f for f in self.large_files if f.is_accessible]
                
                if accessible_files:
                    if self.interactive:
                        self.interactive_deletion(accessible_files)
                    else:
                        print(f"\n🗑️  Auto-deletion mode: Deleting {len(accessible_files)} files...")
                        for file_info in accessible_files:
                            if self.shutdown_requested:
                                break
                            self.delete_file_safely(file_info)
                else:
                    print("\n⚠️  No accessible files found for deletion.")
            
            # Mark as completed if not interrupted
            if not self.shutdown_requested:
                self.stats.completion_status = "COMPLETED"
            
        except KeyboardInterrupt:
            self.logger.warning("Cleanup interrupted by user.")
            self.stats.interrupted = True
            self.shutdown_requested = True
        except Exception as e:
            self.logger.error(f"Fatal error during cleanup: {str(e)}")
            self.logger.error(f"Traceback: {traceback.format_exc()}")
            self.stats.completion_status = "ERROR"
            raise
        finally:
            self.timer.stop()
            self.generate_summary_report()
    
    def generate_summary_report(self):
        """Generate comprehensive summary report."""
        runtime = datetime.now() - self.stats.start_time
        
        print("\n" + "="*60)
        print("📋 CLEANUP SUMMARY REPORT")
        print("="*60)
        
        print(f"Status: {self.stats.completion_status}")
        print(f"Runtime: {str(runtime).split('.')[0]}")
        print(f"Target Directory: {self.target_directory}")
        
        print(f"\n📊 Statistics:")
        print(f"  Files Scanned: {self.stats.files_scanned:,}")
        print(f"  Directories Scanned: {self.stats.directories_scanned:,}")
        print(f"  Large Files Found: {self.stats.large_files_found:,}")
        print(f"  Files Deleted: {self.stats.files_deleted:,}")
        print(f"  Space Freed: {self.format_size(self.stats.bytes_freed)}")
        
        if self.stats.errors_encountered > 0:
            print(f"\n⚠️  Errors Encountered:")
            print(f"  Permission Errors: {self.stats.permission_errors}")
            print(f"  I/O Errors: {self.stats.io_errors}")
            print(f"  Other Errors: {self.stats.other_errors}")
            print(f"  Total Errors: {self.stats.errors_encountered}")
        
        if self.stats.interrupted:
            print(f"\n⚠️  Operation was interrupted")
        
        print(f"\n📝 Log File: {self.log_file_path}")
        print("="*60)
        
        # Log summary to file
        self.logger.info("CLEANUP SUMMARY:")
        self.logger.info(json.dumps(self.stats.to_dict(), indent=2))
        
        # Save summary as JSON
        summary_file = self.log_file_path.parent / f"summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        try:
            with open(summary_file, 'w') as f:
                json.dump(self.stats.to_dict(), f, indent=2)
            print(f"📄 Summary JSON: {summary_file}")
        except Exception as e:
            self.logger.error(f"Failed to save summary JSON: {str(e)}")


def main():
    """Main entry point with argument parsing."""
    parser = argparse.ArgumentParser(
        description="macOS File Cleanup Tool - Find and clean up large files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python macos_file_cleanup.py /Users/username/Downloads
  python macos_file_cleanup.py /Users/username --size 2.5 --non-interactive
  python macos_file_cleanup.py /Volumes/ExternalDrive --dry-run
        """
    )
    
    parser.add_argument(
        'directory',
        help='Target directory to scan for large files'
    )
    
    parser.add_argument(
        '--size', '-s',
        type=float,
        default=1.0,
        help='Minimum file size in GB (default: 1.0)'
    )
    
    parser.add_argument(
        '--non-interactive', '-n',
        action='store_true',
        help='Run in non-interactive mode (auto-delete files)'
    )
    
    parser.add_argument(
        '--dry-run', '-d',
        action='store_true',
        help='Show what would be deleted without actually deleting'
    )
    
    args = parser.parse_args()
    
    try:
        # Validate arguments
        if args.size <= 0:
            raise ValueError("File size must be greater than 0")
        
        target_dir = Path(args.directory).expanduser().resolve()
        
        print("🧹 macOS File Cleanup Tool")
        print("="*40)
        print(f"Target Directory: {target_dir}")
        print(f"Minimum File Size: {args.size} GB")
        print(f"Interactive Mode: {not args.non_interactive}")
        print(f"Dry Run: {args.dry_run}")
        print("="*40)
        
        if not args.dry_run and not args.non_interactive:
            confirm = input("\nProceed with cleanup? (y/N): ").lower().strip()
            if confirm != 'y':
                print("Cleanup cancelled.")
                return
        
        # Create and run cleanup
        cleanup = MacOSFileCleanup(
            target_directory=str(target_dir),
            min_size_gb=args.size,
            interactive=not args.non_interactive,
            dry_run=args.dry_run
        )
        
        cleanup.run_cleanup()
        
    except KeyboardInterrupt:
        print("\n\nCleanup interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()