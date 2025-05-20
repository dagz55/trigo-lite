import socket
import requests
import platform

def get_wan_ip():
    """Gets the public WAN IP address."""
    try:
        response = requests.get('https://icanhazip.com')
        response.raise_for_status() # Raise an exception for bad status codes
        return response.text.strip()
    except requests.RequestException:
        return None # Return None on failure

def get_ip_geolocation(ip_address):
    """Gets geolocation information for an IP address using ipinfo.io."""
    if not ip_address:
        return None

    try:
        response = requests.get(f'https://ipinfo.io/{ip_address}/json')
        response.raise_for_status() # Raise an exception for bad status codes
        data = response.json()
        return data
    except requests.RequestException:
        return None # Return None on failure

def get_lan_ip():
    """Gets the local LAN IP address."""
    try:
        # Get the hostname
        hostname = socket.gethostname()
        # Get the IP address associated with the hostname
        lan_ip = socket.gethostbyname(hostname)
        return lan_ip
    except socket.gaierror:
        return "Could not retrieve LAN IP"

def get_hostname():
    """Gets the system hostname."""
    return socket.gethostname()

def get_os_info():
    """Gets the operating system information."""
    return platform.system() + " " + platform.release()

# Note: Getting detailed WiFi info and listing open ports reliably and cross-platform
# requires more complex methods or external libraries/commands specific to each OS.
# This script provides basic network identification information.

def main():
    print("Gathering network information...")

    wan_ip = get_wan_ip()
    lan_ip = get_lan_ip()
    hostname = get_hostname()
    os_info = get_os_info()
    geolocation_data = get_ip_geolocation(wan_ip)

    print("\nNetwork Summary:")
    print("--------------------------------------------------")
    print(f"{'Hostname:':<20}{hostname}")
    print(f"{'Operating System:':<20}{os_info}")
    print(f"{'LAN IP Address:':<20}{lan_ip}")
    print(f"{'WAN IP Address:':<20}{wan_ip if wan_ip else 'N/A'}")

    if geolocation_data:
        print(f"{'Country:':<20}{geolocation_data.get('country', 'N/A')}")
        # ipinfo.io provides city and region, not a specific "area code" in the traditional sense.
        # We'll display city and region.
        city_region = f"{geolocation_data.get('city', 'N/A')}, {geolocation_data.get('region', 'N/A')}"
        print(f"{'City/Region:':<20}{city_region}")
        print(f"{'Internet Provider:':<20}{geolocation_data.get('org', 'N/A')}")
    else:
        print(f"{'Geolocation Info:':<20}Could not retrieve (requires internet)")

    print("--------------------------------------------------")

if __name__ == "__main__":
    main()
