import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-secondary/20 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">HostingArena</h3>
            <p className="text-sm text-muted-foreground">
              Data-driven reviews for the modern web infrastructure stack.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">VPNs</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/compare?type=vpn" className="hover:text-foreground">Compare VPNs</Link></li>
              <li><Link href="/vpn/nordvpn" className="hover:text-foreground">NordVPN Review</Link></li>
              <li><Link href="/vpn/expressvpn" className="hover:text-foreground">ExpressVPN Review</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hosting</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
               <li><Link href="/compare?type=hosting" className="hover:text-foreground">Compare Hosting</Link></li>
               <li><Link href="/hosting/bluehost" className="hover:text-foreground">Bluehost Review</Link></li>
               <li><Link href="/hosting/siteground" className="hover:text-foreground">SiteGround Review</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
               <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
               <li><Link href="#" className="hover:text-foreground">Methodology</Link></li>
               <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HostingArena. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
